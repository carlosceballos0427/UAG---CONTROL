import * as XLSX from 'xlsx';
import { getStoredData, addEntry } from './storage';

/**
 * Column mapping from Excel headers to form field names
 */
const EXCEL_TO_FORM_MAP = {
    'No.': 'No.',
    'MES': 'MES',
    'NUMERO DE PROCESO': 'NUMERO DE PROCESO',
    'AREA ENCARGADA': 'AREA ENCARGADA',
    'BP': 'BP',
    'PROCESO': 'PROCESO',
    'OBJETO DEL PROCESO': 'OBJETO',
    'MODALIDAD DE SELECCIÓN': 'MODALIDAD',
    'VALOR ESTIMADO EN EL PROCESO': 'PRESUPUESTO ESTIMADO',
    'VALOR DEL CONTRATO': 'VALOR ADJUDICADO',
    'VALOR CDP': 'CDP',
    'ESTADO DEL PROCESO': 'ESTADO',
    'SUPERVISOR': 'SUPERVISOR',
    'APOYO A LA SUPERVISION': 'APOYO A LA SUPERVISIÓN',
    'CONTRATISTA': 'CONTRATISTA',
    'ADICION': 'ADICION_DESC',
    'VALOR ADICION': 'ADICION_VALOR',
};

/**
 * Normalize ESTADO values from Excel to match app states
 */
const normalizeEstado = (val) => {
    if (!val) return 'PENDIENTE';
    const v = String(val).toUpperCase().trim();
    if (v.includes('EJECU') || v.includes('PROCESO')) return 'EN PROCESO';
    if (v.includes('FINAL') || v.includes('LIQUID')) return 'FINALIZADO';
    if (v.includes('SUSPEND') || v.includes('CANCEL')) return 'SUSPENDIDO';
    if (v.includes('ADJUDI')) return 'EN PROCESO';
    if (v.includes('DESIERTO') || v.includes('DECLAR')) return 'SUSPENDIDO';
    return 'PENDIENTE';
};

/**
 * Import an Excel file and store data in LocalStorage
 * @param {File} file - The .xlsx file to import
 * @param {string} year - The year key for storage
 * @returns {Promise<{count: number, data: Array}>}
 */
export const importExcel = (file, year) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });
                const ws = wb.Sheets[wb.SheetNames[0]];

                // Convert to JSON (row 2 = headers, data starts at row 3+)
                const rawData = XLSX.utils.sheet_to_json(ws, { range: 1, defval: '' });

                const processedData = rawData
                    .filter(row => {
                        // Skip empty rows or header-like rows
                        const num = row['No.'];
                        return num && !isNaN(Number(num));
                    })
                    .map((row, index) => {
                        // Build additions array
                        const adiciones = [];
                        const adDesc = row['ADICION'] || row['ADICION_DESC'] || '';
                        const adValor = row['VALOR ADICION'] || row['ADICION_VALOR'] || 0;
                        if (adDesc || (adValor && Number(adValor) > 0)) {
                            adiciones.push({
                                id: Date.now() + index + 1,
                                descripcion: String(adDesc || 'Adición 1'),
                                valor: Number(adValor) || 0,
                            });
                        }

                        // Build payments array
                        const pagos = [];

                        // 1. Try to parse detailed payments from 'DETALLE PAGOS' (format: "Cuenta de Cobro N° 1: $1000")
                        const detallePagos = row['DETALLE PAGOS'];
                        if (detallePagos) {
                            const entries = String(detallePagos).split(';');
                            entries.forEach((entry, i) => {
                                const parts = entry.split(':');
                                if (parts.length >= 2) {
                                    const periodo = parts[0].trim();
                                    // Remove $ and any non-numeric chars except digits/dot/comma
                                    const rawVal = parts[1].replace(/[^\d.,]/g, '').replace(',', '.');
                                    const val = parseFloat(rawVal);
                                    if (val > 0) {
                                        pagos.push({
                                            id: Date.now() + index + 300 + i,
                                            fecha: '', // Date is not stored in string export currently
                                            periodo: periodo, // "Cuenta de Cobro N° X"
                                            valor: val
                                        });
                                    }
                                }
                            });
                        }

                        // 2. Fallback: Import basic total if detailed payments missing
                        if (pagos.length === 0) {
                            const pagoValor = row['VALOR PAGADO'] || row['TOTAL PAGADO'] || 0;
                            if (pagoValor && Number(pagoValor) > 0) {
                                pagos.push({
                                    id: Date.now() + index + 2,
                                    fecha: '',
                                    periodo: 'Carga Inicial',
                                    valor: Number(pagoValor)
                                });
                            }
                        }

                        // Map columns
                        const entry = {
                            id: Date.now() + index,
                            'No.': String(row['No.'] || index + 1),
                            'MES': String(row['MES'] || ''),
                            'NUMERO DE PROCESO': String(row['NUMERO DE PROCESO'] || ''),
                            'AREA ENCARGADA': String(row['AREA ENCARGADA'] || ''),
                            'BP': String(row['BP'] || ''),
                            'PROCESO': String(row['PROCESO'] || ''),
                            'OBJETO': String(row['OBJETO DEL PROCESO'] || row['OBJETO'] || ''),
                            'MODALIDAD': String(row['MODALIDAD DE SELECCIÓN'] || row['MODALIDAD'] || ''),
                            'TIPO DE CONTRATO': String(row['TIPO DE CONTRATO'] || ''),
                            'PRESUPUESTO ESTIMADO': Number(row['VALOR ESTIMADO EN EL PROCESO'] || row['PRESUPUESTO ESTIMADO'] || 0),
                            'VALOR ADJUDICADO': Number(row['VALOR DEL CONTRATO'] || row['VALOR ADJUDICADO'] || 0),
                            'CDP': Number(row['VALOR CDP'] || row['CDP'] || 0),
                            'SALDO POR PAGAR': 0,
                            'ESTADO': normalizeEstado(row['ESTADO DEL PROCESO'] || row['ESTADO']),
                            'SUPERVISOR': String(row['SUPERVISOR'] || ''),
                            'APOYO A LA SUPERVISIÓN': String(row['APOYO A LA SUPERVISION'] || row['APOYO A LA SUPERVISIÓN'] || ''),
                            'CONTRATISTA': String(row['CONTRATISTA'] || ''),
                            'ADICIONES': adiciones,
                            'PAGOS': pagos,
                        };

                        // Calculate saldo
                        const totalAdiciones = adiciones.reduce((s, a) => s + (Number(a.valor) || 0), 0);
                        const totalPagos = pagos.reduce((s, p) => s + (Number(p.valor) || 0), 0);
                        const valorTotal = (entry['VALOR ADJUDICADO'] || 0) + totalAdiciones;

                        // New logic: Saldo = (Valor Total) - (Total Pagos)
                        // Note: If no payments exist, it defaults to Total - CDP? 
                        // The user said: "el saldo por pagar se va restando a medida de que el usuario va ingresando el valor pagado"
                        // So initially if 0 payments, Saldo = Valor Total.
                        // But usually initial saldo is Valor Total - CDP (if CDP is the initial coverage). 
                        // Let's stick to the user's logic: Saldo = Total Contrato - Total Pagado. 
                        // BUT typically CDP isn't a payment, it's a reservation. 
                        // Valid Saldo logic: Value - Payments. 
                        entry['SALDO POR PAGAR'] = valorTotal - totalPagos;

                        return entry;
                    });

                // Merge or replace data
                Promise.all(processedData.map(entry => addEntry(year, entry)))
                    .then(() => {
                        resolve({
                            count: processedData.length,
                            data: processedData,
                        });
                    })
                    .catch((error) => {
                        reject(new Error(`Error insertando en BD: ${error.message}`));
                    });
            } catch (err) {
                reject(new Error(`Error al procesar el archivo: ${err.message}`));
            }
        };
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Export data to Excel (.xlsx) file
 * @param {Array} data - Array of process objects
 * @param {string} year - Year for the filename
 */
export const exportToExcel = (data, year) => {
    const exportData = data.map(item => {
        const adicionesTotal = (item['ADICIONES'] || []).reduce((sum, a) => sum + (Number(a.valor) || 0), 0);
        const adicionesDesc = (item['ADICIONES'] || []).map(a => a.descripcion).join('; ');

        const pagosTotal = (item['PAGOS'] || []).reduce((sum, p) => sum + (Number(p.valor) || 0), 0);
        const pagosDesc = (item['PAGOS'] || []).map(p => `${p.periodo}: $${p.valor}`).join('; ');

        return {
            'No.': item['No.'],
            'MES': item['MES'],
            'NUMERO DE PROCESO': item['NUMERO DE PROCESO'],
            'AREA ENCARGADA': item['AREA ENCARGADA'],
            'BP': item['BP'],
            'PROCESO': item['PROCESO'],
            'OBJETO': item['OBJETO'],
            'MODALIDAD': item['MODALIDAD'],
            'TIPO DE CONTRATO': item['TIPO DE CONTRATO'],
            'PRESUPUESTO ESTIMADO': item['PRESUPUESTO ESTIMADO'],
            'VALOR ADJUDICADO': item['VALOR ADJUDICADO'],
            'CDP': item['CDP'],
            'ADICIONES': adicionesDesc,
            'VALOR ADICIONES': adicionesTotal,
            'VALOR TOTAL CONTRATO': (item['VALOR ADJUDICADO'] || 0) + adicionesTotal,
            'DETALLE PAGOS': pagosDesc,
            'TOTAL PAGADO': pagosTotal,
            'SALDO POR PAGAR': item['SALDO POR PAGAR'],
            'ESTADO': item['ESTADO'],
            'SUPERVISOR': item['SUPERVISOR'],
            'APOYO A LA SUPERVISIÓN': item['APOYO A LA SUPERVISIÓN'],
            'CONTRATISTA': item['CONTRATISTA'],
        };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Auto-width columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, ...exportData.map(r => String(r[key] || '').length).slice(0, 10)) + 2
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Procesos ${year}`);
    XLSX.writeFile(wb, `Seguimiento_Procesos_${year}.xlsx`);
};

/**
 * Export data to CSV for Power BI
 * @param {Array} data - Array of process objects
 * @param {string} year - Year for the filename
 */
export const exportToCSV = (data, year) => {
    const exportData = data.map(item => {
        const adicionesTotal = (item['ADICIONES'] || []).reduce((sum, a) => sum + (Number(a.valor) || 0), 0);
        const pagosTotal = (item['PAGOS'] || []).reduce((sum, p) => sum + (Number(p.valor) || 0), 0);
        const valorTotalContrato = (item['VALOR ADJUDICADO'] || 0) + adicionesTotal;

        return {
            'No': item['No.'],
            'Mes': item['MES'],
            'NumeroProceso': item['NUMERO DE PROCESO'],
            'AreaEncargada': item['AREA ENCARGADA'],
            'BP': item['BP'],
            'Proceso': item['PROCESO'],
            'Objeto': item['OBJETO'],
            'Modalidad': item['MODALIDAD'],
            'TipoContrato': item['TIPO DE CONTRATO'],
            'PresupuestoEstimado': item['PRESUPUESTO ESTIMADO'],
            'ValorAdjudicado': item['VALOR ADJUDICADO'],
            'CDP': item['CDP'],
            'ValorAdiciones': adicionesTotal,
            'ValorTotalContrato': valorTotalContrato,
            'TotalPagado': pagosTotal,
            'SaldoPorPagar': valorTotalContrato - pagosTotal,
            'Estado': item['ESTADO'],
            'Supervisor': item['SUPERVISOR'],
            'ApoyoSupervision': item['APOYO A LA SUPERVISIÓN'],
            'Contratista': item['CONTRATISTA'],
            'Ano': year,
        };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';' }); // Semicolon separator for Excel/Power BI in Spanish locales

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for UTF-8
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Seguimiento_Procesos_${year}_PowerBI.csv`;
    a.click();
    URL.revokeObjectURL(url);
};
