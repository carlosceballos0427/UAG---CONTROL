// ─── API Client for Django REST Framework ───────────────────────────
// Replaces the old Data Connect SDK calls with fetch() to our Django API.

const API_BASE = `http://${window.location.hostname}:8000/api`;

const YEARS_KEY = 'uagcontrol_tracking_years';
const DEPENDENCIAS_KEY = 'uagcontrol_dependencias';

const DEFAULT_DEPENDENCIAS = [
    'Unidad de Apoyo a la Gestión',
    'Subdirección de Finanzas Públicas',
    'Subdirección de Tesorería',
    'Subdirección de Catastro Municipal',
    'Subdirección de Impuestos y Rentas',
    'Contaduría General de Santiago de Cali',
    'Departamento Administrativo de Gestión Jurídica Pública',
];

// ─── LocalStorage helpers (sin cambios) ──────────────────────────────

export const getStoredYears = () => {
    const years = localStorage.getItem(YEARS_KEY);
    return years ? JSON.parse(years) : ['2025', '2026'];
};

export const saveStoredYears = (years) => {
    localStorage.setItem(YEARS_KEY, JSON.stringify(years));
};

export const getStoredDependencias = () => {
    const stored = localStorage.getItem(DEPENDENCIAS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_DEPENDENCIAS;
};

export const saveDependencias = (dependencias) => {
    localStorage.setItem(DEPENDENCIAS_KEY, JSON.stringify(dependencias));
};

// ─── Helper para peticiones fetch ────────────────────────────────────

const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    const token = localStorage.getItem('uag_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers['Authorization'] = `Token ${token}`;
    }

    const config = {
        headers,
        ...options,
    };
    const response = await fetch(url, config);
    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Error (${response.status}):`, errorBody);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    // DELETE returns 204 No Content
    if (response.status === 204) return null;
    return response.json();
};

// ─── CRUD de Procesos (Django REST API) ──────────────────────────────

export const getStoredData = async (year) => {
    try {
        const procesos = await apiFetch(`/procesos/?year=${year}`);
        return procesos.map(p => ({
            id: p.id,
            'No.': p.numero_item || '',
            'MES': p.mes || '',
            'NUMERO DE PROCESO': p.numero_proceso || '',
            'AREA ENCARGADA': p.area_encargada || '',
            'DEPENDENCIA': p.dependencia || '',
            'BP': p.bp || '',
            'PROCESO': p.objeto || '',
            'OBJETO': p.objeto || '',
            'MODALIDAD': p.modalidad || '',
            'TIPO DE CONTRATO': p.tipo_contrato || '',
            'PRESUPUESTO ESTIMADO': p.presupuesto_estimado || 0,
            'VALOR ADJUDICADO': p.valor_adjudicado || 0,
            'CDP': p.cdp || 0,
            'ESTADO': p.estado || 'PENDIENTE',
            'SUPERVISOR': p.supervisor || '',
            'APOYO A LA SUPERVISIÓN': p.apoyo_supervision || '',
            'CONTRATISTA': p.contratista || '',
            'ADICIONES': p.adiciones?.map(a => ({ id: a.id, descripcion: a.descripcion, valor: a.valor })) || [],
            'PAGOS': p.pagos?.map(pg => ({ id: pg.id, periodo: pg.periodo, fecha: pg.fecha, valor: pg.valor })) || [],
            'CREADO_POR': p.creado_por_detail?.email || ''
        }));
    } catch (e) {
        console.error("Error loading data from API:", e);
        return [];
    }
};

export const addEntry = async (year, entry) => {
    try {
        const proceso = await apiFetch('/procesos/', {
            method: 'POST',
            body: JSON.stringify({
                year,
                mes: entry['MES'],
                numero_item: entry['No.'],
                numero_proceso: entry['NUMERO DE PROCESO'],
                area_encargada: entry['AREA ENCARGADA'],
                dependencia: entry['DEPENDENCIA'],
                bp: entry['BP'],
                objeto: entry['OBJETO'],
                modalidad: entry['MODALIDAD'],
                tipo_contrato: entry['TIPO DE CONTRATO'],
                presupuesto_estimado: entry['PRESUPUESTO ESTIMADO'] ? parseFloat(entry['PRESUPUESTO ESTIMADO']) : 0,
                valor_adjudicado: entry['VALOR ADJUDICADO'] ? parseFloat(entry['VALOR ADJUDICADO']) : 0,
                cdp: entry['CDP'] ? parseFloat(entry['CDP']) : 0,
                estado: entry['ESTADO'],
                supervisor: entry['SUPERVISOR'],
                apoyo_supervision: entry['APOYO A LA SUPERVISIÓN'],
                contratista: entry['CONTRATISTA']
            }),
        });

        const procesoId = proceso.id;

        // Crear adiciones asociadas
        if (entry['ADICIONES']?.length) {
            for (const ad of entry['ADICIONES']) {
                await apiFetch('/adiciones/', {
                    method: 'POST',
                    body: JSON.stringify({
                        proceso: procesoId,
                        descripcion: ad.descripcion,
                        valor: parseFloat(ad.valor) || 0,
                    }),
                });
            }
        }

        // Crear pagos asociados
        if (entry['PAGOS']?.length) {
            for (const pg of entry['PAGOS']) {
                const fecha = pg.fecha && pg.fecha !== "" ? pg.fecha : null;
                await apiFetch('/pagos/', {
                    method: 'POST',
                    body: JSON.stringify({
                        proceso: procesoId,
                        periodo: pg.periodo,
                        fecha,
                        valor: parseFloat(pg.valor) || 0,
                    }),
                });
            }
        }

        return true;
    } catch (e) {
        console.error("Error adding entry:", e);
        throw e;
    }
};

export const updateEntry = async (year, entry) => {
    try {
        // 1. Actualizar el Proceso base
        await apiFetch(`/procesos/${entry.id}/`, {
            method: 'PUT',
            body: JSON.stringify({
                year,
                mes: entry['MES'],
                numero_item: entry['No.'],
                numero_proceso: entry['NUMERO DE PROCESO'],
                area_encargada: entry['AREA ENCARGADA'],
                dependencia: entry['DEPENDENCIA'],
                bp: entry['BP'],
                objeto: entry['OBJETO'],
                modalidad: entry['MODALIDAD'],
                tipo_contrato: entry['TIPO DE CONTRATO'],
                presupuesto_estimado: entry['PRESUPUESTO ESTIMADO'] ? parseFloat(entry['PRESUPUESTO ESTIMADO']) : 0,
                valor_adjudicado: entry['VALOR ADJUDICADO'] ? parseFloat(entry['VALOR ADJUDICADO']) : 0,
                cdp: entry['CDP'] ? parseFloat(entry['CDP']) : 0,
                estado: entry['ESTADO'],
                supervisor: entry['SUPERVISOR'],
                apoyo_supervision: entry['APOYO A LA SUPERVISIÓN'],
                contratista: entry['CONTRATISTA']
            }),
        });

        // 2. Obtener estado actual del backend para comparar
        const currentData = await apiFetch(`/procesos/${entry.id}/`);
        const currentAdiciones = currentData.adiciones || [];
        const currentPagos = currentData.pagos || [];

        // 3. Sync Adiciones
        const entryAdiciones = entry['ADICIONES'] || [];
        const adicionesToDelete = currentAdiciones.filter(ca => !entryAdiciones.some(a => a.id === ca.id));

        for (const ad of entryAdiciones) {
            if (typeof ad.id === 'string' && ad.id.includes('-')) {
                // Update
                await apiFetch(`/adiciones/${ad.id}/`, {
                    method: 'PUT',
                    body: JSON.stringify({ proceso: entry.id, descripcion: ad.descripcion, valor: parseFloat(ad.valor) || 0 })
                });
            } else {
                // Create
                await apiFetch('/adiciones/', {
                    method: 'POST',
                    body: JSON.stringify({ proceso: entry.id, descripcion: ad.descripcion, valor: parseFloat(ad.valor) || 0 })
                });
            }
        }
        for (const delAd of adicionesToDelete) {
            await apiFetch(`/adiciones/${delAd.id}/`, { method: 'DELETE' });
        }

        // 4. Sync Pagos
        const entryPagos = entry['PAGOS'] || [];
        const pagosToDelete = currentPagos.filter(cp => !entryPagos.some(p => p.id === cp.id));

        for (const pg of entryPagos) {
            const fecha = pg.fecha && pg.fecha !== "" ? pg.fecha : null;
            if (typeof pg.id === 'string' && pg.id.includes('-')) {
                // Update
                await apiFetch(`/pagos/${pg.id}/`, {
                    method: 'PUT',
                    body: JSON.stringify({ proceso: entry.id, periodo: pg.periodo, fecha, valor: parseFloat(pg.valor) || 0 })
                });
            } else {
                // Create
                await apiFetch('/pagos/', {
                    method: 'POST',
                    body: JSON.stringify({ proceso: entry.id, periodo: pg.periodo, fecha, valor: parseFloat(pg.valor) || 0 })
                });
            }
        }
        for (const delPg of pagosToDelete) {
            await apiFetch(`/pagos/${delPg.id}/`, { method: 'DELETE' });
        }

        return true;
    } catch (e) {
        console.error("Error updating entry:", e);
        throw e;
    }
};

export const deleteEntry = async (year, id) => {
    try {
        await apiFetch(`/procesos/${id}/`, {
            method: 'DELETE',
        });
        return true;
    } catch (e) {
        console.error("Error deleting entry:", e);
        throw e;
    }
};
