/**
 * ProcessList.jsx
 *
 * Componente que muestra la tabla/listado de todos los procesos contractuales.
 * Diseño UX/UI premium con filtros por estado, búsqueda y tabla responsive.
 */
import React, { useState, useMemo } from 'react';
import { Eye, Edit, Trash2, Search, X, Filter } from 'lucide-react';
import ProcessDetailModal from './ProcessDetailModal';

// ─── Estados con estilos ──────────────────────────────────────────
const ESTADO_STYLES = {
    'TERMINADO':    { bg: 'bg-green-100',   text: 'text-green-700',   dot: 'bg-green-500' },
    'EN PROCESO':   { bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500' },
    'EN EJECUCIÓN': { bg: 'bg-indigo-100',  text: 'text-indigo-700',  dot: 'bg-indigo-500' },
    'LIQUIDADO':    { bg: 'bg-gray-200',    text: 'text-gray-700',    dot: 'bg-gray-500' },
    'EMPRÉSTITO':   { bg: 'bg-purple-100',  text: 'text-purple-700',  dot: 'bg-purple-500' },
    'SUSPENDIDO':   { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500' },
    'EMITIDO':      { bg: 'bg-cyan-100',    text: 'text-cyan-700',    dot: 'bg-cyan-500' },
    'PENDIENTE':    { bg: 'bg-yellow-100',  text: 'text-yellow-700',  dot: 'bg-yellow-500' },
};
const getEstadoStyle = (e) => ESTADO_STYLES[e] || ESTADO_STYLES['PENDIENTE'];

const ProcessList = ({ data, onEdit, onDelete, userRole = 'radicador' }) => {
    const fmt = (v) => `$ ${new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0)}`;

    const [selectedProcess, setSelectedProcess] = useState(null);
    const [filterEstado, setFilterEstado] = useState(null);
    const [searchText, setSearchText] = useState('');

    const estadoCounts = useMemo(() => {
        const c = {};
        data.forEach(i => { const e = i['ESTADO'] || 'PENDIENTE'; c[e] = (c[e] || 0) + 1; });
        return c;
    }, [data]);

    const filteredData = useMemo(() => {
        let r = data;
        if (filterEstado) r = r.filter(i => (i['ESTADO'] || 'PENDIENTE') === filterEstado);
        if (searchText.trim()) {
            const q = searchText.toLowerCase().trim();
            r = r.filter(i =>
                (i['NUMERO DE PROCESO'] || '').toLowerCase().includes(q) ||
                (i['CONTRATISTA'] || '').toLowerCase().includes(q) ||
                (i['OBJETO'] || '').toLowerCase().includes(q) ||
                (i['SUPERVISOR'] || '').toLowerCase().includes(q)
            );
        }
        return r;
    }, [data, filterEstado, searchText]);

    const estadosPresentes = useMemo(() => {
        return ['PENDIENTE', 'EN PROCESO', 'EN EJECUCIÓN', 'TERMINADO', 'LIQUIDADO', 'SUSPENDIDO', 'EMPRÉSTITO', 'EMITIDO'].filter(e => estadoCounts[e] > 0);
    }, [estadoCounts]);

    return (
        <div className="card mt-8 overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            {/* ── Header con filtros ── */}
            <div className="p-5 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Filter size={18} className="text-blue-500" /> Listado de Procesos
                    </h2>
                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                        {filteredData.length} de {data.length}
                    </span>
                </div>

                {/* Búsqueda */}
                <div className="relative mb-3">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Buscar por N° proceso, contratista, objeto o supervisor..."
                        className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 dark:focus:ring-blue-900 transition-all bg-gray-50/80 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800"
                    />
                    {searchText && (
                        <button onClick={() => setSearchText('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X size={15} />
                        </button>
                    )}
                </div>

                {/* Filtros por estado */}
                <div className="flex flex-wrap gap-1.5">
                    <button
                        onClick={() => setFilterEstado(null)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            !filterEstado ? 'bg-gray-800 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        TODOS ({data.length})
                    </button>
                    {estadosPresentes.map(estado => {
                        const s = getEstadoStyle(estado);
                        const active = filterEstado === estado;
                        return (
                            <button
                                key={estado}
                                onClick={() => setFilterEstado(active ? null : estado)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${
                                    active
                                        ? `${s.bg} ${s.text} shadow-sm ring-2 ring-offset-1 ring-current`
                                        : `${s.bg} ${s.text} opacity-75 hover:opacity-100`
                                }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                                {estado} ({estadoCounts[estado]})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Tabla ── */}
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                    <thead>
                        <tr className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <th className="pl-4 pr-2 py-3 w-[15%] text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">N° Proceso</th>
                            <th className="px-2 py-3 w-[27%] text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Objeto / Contratista</th>
                            <th className="px-2 py-3 w-[10%] text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Valor Total</th>
                            <th className="px-2 py-3 w-[10%] text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Pagado</th>
                            <th className="px-2 py-3 w-[10%] text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Saldo</th>
                            <th className="px-2 py-3 w-[11%] text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Estado</th>
                            <th className="px-1 py-3 w-[7%] text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">SECOP</th>
                            <th className="px-1 py-3 w-[10%] text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-6 py-12 text-center text-gray-400 italic text-sm">
                                    {data.length === 0 ? 'No hay procesos registrados para este año.' : 'No se encontraron procesos con los filtros aplicados.'}
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((item) => {
                                const adT = (item['ADICIONES'] || []).reduce((s, a) => s + (parseFloat(a.valor) || 0), 0);
                                const tC = (parseFloat(item['VALOR ADJUDICADO']) || 0) + adT;
                                const tP = (item['PAGOS'] || []).reduce((s, p) => s + (parseFloat(p.valor) || 0), 0);
                                const saldo = tC - tP;
                                const estado = item['ESTADO'] || 'PENDIENTE';
                                const st = getEstadoStyle(estado);

                                return (
                                    <tr key={item.id} className="transition-all duration-200 group relative hover:z-10 hover:bg-white dark:hover:bg-gray-700 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                                        {/* N° Proceso */}
                                        <td className="pl-4 pr-2 py-2.5">
                                            <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold block truncate" title={item['NUMERO DE PROCESO'] || 'N/A'}>
                                                {item['NUMERO DE PROCESO'] || 'N/A'}
                                            </span>
                                        </td>

                                        {/* Objeto / Contratista */}
                                        <td className="px-2 py-2.5">
                                            <div className="truncate font-medium text-gray-800 dark:text-gray-200 text-[11px] leading-tight" title={item['OBJETO']}>
                                                {item['OBJETO'] || 'Sin objeto'}
                                            </div>
                                            <div className="truncate text-[10px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5" title={item['CONTRATISTA']}>
                                                {item['CONTRATISTA'] || 'Sin contratista'}
                                            </div>
                                        </td>

                                        {/* Valor Total */}
                                        <td className="px-2 py-2.5 text-right">
                                            <span className="font-mono text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate block" title={fmt(tC)}>
                                                {fmt(tC)}
                                            </span>
                                        </td>

                                        {/* Total Pagado */}
                                        <td className="px-2 py-2.5 text-right">
                                            <span className="font-mono text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate block" title={fmt(tP)}>
                                                {fmt(tP)}
                                            </span>
                                        </td>

                                        {/* Saldo + Clasificación */}
                                        <td className="px-2 py-2.5 text-right">
                                            <span className={`font-mono text-[11px] font-semibold truncate block ${saldo <= 0 ? 'text-green-600' : 'text-amber-600'}`} title={fmt(saldo)}>
                                                {fmt(saldo)}
                                            </span>
                                            {item['TIPO_SALDO'] === 'A_FAVOR' && (
                                                <span className="inline-flex items-center gap-0.5 mt-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[8px] font-bold uppercase tracking-wide">
                                                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>A Favor
                                                </span>
                                            )}
                                            {item['TIPO_SALDO'] === 'CUENTAS_POR_COBRAR' && (
                                                <span className="inline-flex items-center gap-0.5 mt-0.5 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[8px] font-bold uppercase tracking-wide">
                                                    <span className="w-1 h-1 rounded-full bg-rose-500"></span>CxC
                                                </span>
                                            )}
                                        </td>

                                        {/* Estado */}
                                        <td className="px-2 py-2.5 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide ${st.bg} ${st.text}`} title={estado}>
                                                {estado}
                                            </span>
                                        </td>

                                        {/* SECOP */}
                                        <td className="px-1 py-2.5 text-center">
                                            {item['LINK_SECOP'] ? (
                                                <a
                                                    href={item['LINK_SECOP']}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="secop-badge"
                                                    title={`Abrir en SECOP: ${item['LINK_SECOP']}`}
                                                >
                                                    <span className="secop-badge-inner">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="secop-icon">
                                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                                            <polyline points="9 12 11 14 15 10"/>
                                                        </svg>
                                                        <span className="secop-label">SECOP</span>
                                                    </span>
                                                </a>
                                            ) : (
                                                <span className="text-gray-200 text-[10px]">—</span>
                                            )}
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-1 py-2.5 text-center">
                                            <div className="flex justify-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setSelectedProcess(item)} className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md transition-colors" title="Ver Detalle">
                                                    <Eye size={15} />
                                                </button>
                                                {userRole !== 'visualizador' && (
                                                    <button onClick={() => onEdit(item)} className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors" title="Editar">
                                                        <Edit size={15} />
                                                    </button>
                                                )}
                                                {userRole === 'admin' && (
                                                    <button onClick={() => onDelete(item.id)} className="p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors" title="Eliminar">
                                                        <Trash2 size={15} />
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

            {/* Modal */}
            {selectedProcess && (
                <ProcessDetailModal process={selectedProcess} onClose={() => setSelectedProcess(null)} />
            )}
        </div>
    );
};

export default ProcessList;
