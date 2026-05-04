/**
 * ProcessList.jsx
 *
 * Componente que muestra la tabla/listado de todos los procesos contractuales
 * registrados en un año. Incluye columnas de identificación, valores financieros
 * (con alineación a la derecha para montos grandes), estado, y acciones CRUD.
 *
 * Los valores monetarios se formatean con separador de miles colombiano
 * y se alinean a la derecha para facilitar la lectura de cifras grandes.
 */
import React, { useState } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import ProcessDetailModal from './ProcessDetailModal';

/**
 * @component ProcessList
 * @description Renderiza una tabla con todos los procesos del año seleccionado.
 *   Muestra: N° Proceso, Objeto/Contratista, Tipo, Valor Total, Total Pagado,
 *   Saldo por Pagar, Estado, y botones de Editar/Eliminar.
 *
 * @param {Object} props
 * @param {Array} props.data - Array de objetos de proceso (del LocalStorage).
 * @param {Function} props.onEdit - Callback al hacer clic en "Editar" (recibe el proceso).
 * @param {Function} props.onDelete - Callback al hacer clic en "Eliminar" (recibe el id).
 */
const ProcessList = ({ data, onEdit, onDelete, userRole = 'radicador' }) => {

    /**
     * @function formatCurrency
     * @description Formatea un número como moneda colombiana con separador de miles.
     *   Ejemplo: 2350000000 → "$ 2.350.000.000"
     * @param {number} value - Valor numérico a formatear.
     * @returns {string} Valor formateado con signo $ y separadores de miles.
     */
    const formatCurrency = (value) => {
        return `$ ${new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value || 0)}`;
    };

    const [selectedProcess, setSelectedProcess] = useState(null);

    return (
        <div className="card mt-8 overflow-hidden">
            {/* ── Encabezado con título y contador de procesos ── */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Listado de Procesos</h2>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    {data.length} Procesos
                </span>
            </div>

            {/* ── Tabla de procesos con scroll horizontal ── */}
            <div className="w-full">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-2 py-3 w-[16%] text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">N° Proceso</th>
                            <th className="px-2 py-3 w-[29%] text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Objeto / Contratista</th>
                            <th className="px-2 py-3 w-[13%] text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Valor Total</th>
                            <th className="px-2 py-3 w-[13%] text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Pagado</th>
                            <th className="px-2 py-3 w-[13%] text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Saldo</th>
                            <th className="px-2 py-3 w-[8%] text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Estado</th>
                            <th className="px-2 py-3 w-[8%] text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.length === 0 ? (
                            /* Mensaje cuando no hay procesos registrados */
                            <tr>
                                <td colSpan="8" className="px-6 py-12 text-center text-gray-500 italic">
                                    No hay procesos registrados para este año.
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => {
                                /* Cálculos financieros por fila */
                                const adicionesTotal = (item['ADICIONES'] || []).reduce(
                                    (sum, adj) => sum + (parseFloat(adj.valor) || 0), 0
                                );
                                const totalContrato = (parseFloat(item['VALOR ADJUDICADO']) || 0) + adicionesTotal;
                                const totalPagado = (item['PAGOS'] || []).reduce(
                                    (sum, p) => sum + (parseFloat(p.valor) || 0), 0
                                );
                                const saldoPorPagar = totalContrato - totalPagado;

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        {/* Columna: Número de Proceso */}
                                        <td className="px-2 py-3 overflow-hidden">
                                            <span className="font-mono text-xs text-blue-600 font-medium break-all">
                                                {item['NUMERO DE PROCESO'] || 'N/A'}
                                            </span>
                                        </td>

                                        {/* Columna: Objeto y Contratista */}
                                        <td className="px-2 py-3 overflow-hidden">
                                            <div className="line-clamp-2 font-medium text-gray-900 text-xs mb-1" title={item['OBJETO']}>
                                                {item['OBJETO'] || 'Sin objeto'}
                                            </div>
                                            <div className="text-[10px] text-gray-500 line-clamp-1" title={item['CONTRATISTA']}>
                                                {item['CONTRATISTA'] || 'Sin contratista'}
                                            </div>
                                        </td>

                                        {/* Columna: Tipo de Contrato (ELIMINADA) */}

                                        {/* Columna: Valor Total */}
                                        <td className="px-2 py-3 text-right overflow-hidden">
                                            <span className="font-mono text-xs font-semibold text-gray-900 block truncate" title={formatCurrency(totalContrato)}>
                                                {formatCurrency(totalContrato)}
                                            </span>
                                        </td>

                                        {/* Columna: Total Pagado */}
                                        <td className="px-2 py-3 text-right overflow-hidden">
                                            <span className="font-mono text-xs font-medium text-emerald-600 block truncate" title={formatCurrency(totalPagado)}>
                                                {formatCurrency(totalPagado)}
                                            </span>
                                        </td>

                                        {/* Columna: Saldo por Pagar */}
                                        <td className="px-2 py-3 text-right overflow-hidden">
                                            <span className={`font-mono text-xs font-semibold block truncate ${saldoPorPagar <= 0 ? 'text-green-600' : 'text-amber-600'}`} title={formatCurrency(saldoPorPagar)}>
                                                {formatCurrency(saldoPorPagar)}
                                            </span>
                                        </td>

                                        {/* Columna: Estado */}
                                        <td className="px-2 py-3 text-center overflow-hidden">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium block truncate ${item['ESTADO'] === 'FINALIZADO' ? 'bg-green-100 text-green-700' :
                                                item['ESTADO'] === 'EN PROCESO' ? 'bg-blue-100 text-blue-700' :
                                                    item['ESTADO'] === 'EN EJECUCIÓN' ? 'bg-indigo-100 text-indigo-700' :
                                                        item['ESTADO'] === 'LIQUIDADO' ? 'bg-gray-100 text-gray-700' :
                                                            item['ESTADO'] === 'EMPRÉSTITO' ? 'bg-purple-100 text-purple-700' :
                                                                item['ESTADO'] === 'SUSPENDIDO' ? 'bg-red-100 text-red-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                }`} title={item['ESTADO'] || 'PENDIENTE'}>
                                                {item['ESTADO'] || 'PENDIENTE'}
                                            </span>
                                        </td>

                                        {/* Columna: Acciones */}
                                        <td className="px-2 py-3 text-center">
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={() => setSelectedProcess(item)}
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Ver Detalle Completo"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onEdit(item)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                {userRole === 'admin' && (
                                                    <button
                                                        onClick={() => onDelete(item.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>


            {/* Modal de Detalle */}
            {
                selectedProcess && (
                    <ProcessDetailModal
                        process={selectedProcess}
                        onClose={() => setSelectedProcess(null)}
                    />
                )
            }
        </div >
    );
};

export default ProcessList;
