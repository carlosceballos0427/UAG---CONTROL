import { X, Calendar, CreditCard, Wallet, FileText, User, Building2, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * @component ProcessDetailModal
 * @description Modal de solo lectura para ver el detalle completo de un proceso.
 * Muestra información básica, ejecución financiera, adiciones y el historial detallado de pagos.
 */
const ProcessDetailModal = ({ process, onClose }) => {
    if (!process) return null;

    const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

    const adicionesTotal = (process['ADICIONES'] || []).reduce((s, a) => s + (parseFloat(a.valor) || 0), 0);
    const pagosTotal = (process['PAGOS'] || []).reduce((s, p) => s + (parseFloat(p.valor) || 0), 0);
    const valorTotal = (parseFloat(process['VALOR ADJUDICADO']) || 0) + adicionesTotal;
    const saldo = valorTotal - pagosTotal;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
                {/* Header */}
                <header className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Detalle del Proceso</div>
                        <h2 className="text-xl font-black text-gray-900 leading-none">{process['OBJETO']?.substring(0, 60)}...</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                        <X size={24} />
                    </button>
                </header>

                {/* Content */}
                <div className="overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                            <span className="text-[10px] font-bold text-blue-400 uppercase block mb-1">No. Proceso</span>
                            <div className="font-bold text-gray-800 text-sm">{process['NUMERO DE PROCESO']}</div>
                        </div>
                        <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                            <span className="text-[10px] font-bold text-purple-400 uppercase block mb-1">Contratista</span>
                            <div className="font-bold text-gray-800 text-sm truncate" title={process['CONTRATISTA']}>{process['CONTRATISTA']}</div>
                        </div>
                        <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100">
                            <span className="text-[10px] font-bold text-orange-400 uppercase block mb-1">Dependencia</span>
                            <div className="font-bold text-gray-800 text-sm truncate" title={process['DEPENDENCIA']}>{process['DEPENDENCIA'] || 'N/A'}</div>
                        </div>
                        <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-200">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Estado</span>
                            <div className={`font-bold text-sm px-2 py-0.5 rounded-md inline-block ${process.ESTADO === 'TERMINADO' ? 'bg-emerald-100 text-emerald-700' :
                                process.ESTADO === 'EN PROCESO' ? 'bg-blue-100 text-blue-700' :
                                    process.ESTADO === 'EN EJECUCIÓN' ? 'bg-indigo-100 text-indigo-700' :
                                        process.ESTADO === 'EN TRÁMITE DE LIQUIDACIÓN' ? 'bg-teal-100 text-teal-700' :
                                            process.ESTADO === 'LIQUIDADO' ? 'bg-gray-200 text-gray-700' :
                                                process.ESTADO === 'SUSPENDIDO' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                {process['ESTADO']}
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                            <CreditCard size={18} className="text-emerald-500" /> Resumen Financiero
                        </h3>
                        <div className="bg-gray-50 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <span className="text-xs text-gray-400 font-medium">Valor Total Contrato</span>
                                <div className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(valorTotal)}</div>
                                <div className="text-[10px] text-gray-400 mt-1">Inicial: {formatCurrency(process['VALOR ADJUDICADO'])}</div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 font-medium">Total Pagado</span>
                                <div className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(pagosTotal)}</div>
                                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min((pagosTotal / valorTotal) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 font-medium">Saldo Pendiente</span>
                                <div className="text-2xl font-black text-amber-500 mt-1">{formatCurrency(saldo)}</div>
                                {process['TIPO_SALDO'] === 'A_FAVOR' && (
                                    <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                                        <TrendingUp size={14} className="text-emerald-600" />
                                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Saldo a Favor</span>
                                    </div>
                                )}
                                {process['TIPO_SALDO'] === 'CUENTAS_POR_COBRAR' && (
                                    <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200">
                                        <TrendingDown size={14} className="text-rose-600" />
                                        <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wide">Cuentas por Cobrar</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Tables Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Adiciones */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-blue-500" /> Historial de Adiciones
                            </h3>
                            {(process['ADICIONES'] || []).length > 0 ? (
                                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Descripción</th>
                                                <th className="px-4 py-3 text-right">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {(process['ADICIONES'] || []).map((adj, i) => (
                                                <tr key={i} className="hover:bg-gray-50/50">
                                                    <td className="px-4 py-3 text-gray-700">{adj.descripcion}</td>
                                                    <td className="px-4 py-3 text-right font-mono font-medium">{formatCurrency(adj.valor)}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-blue-50/30 font-bold text-blue-800">
                                                <td className="px-4 py-2 text-right text-xs uppercase">Total</td>
                                                <td className="px-4 py-2 text-right font-mono">{formatCurrency(adicionesTotal)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-xl text-sm italic border border-gray-100 border-dashed">
                                    Sin adiciones registradas
                                </div>
                            )}
                        </section>

                        {/* Pagos */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                                <Wallet size={18} className="text-emerald-500" /> Historial de Pagos
                            </h3>
                            {(process['PAGOS'] || []).length > 0 ? (
                                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Concepto</th>
                                                <th className="px-4 py-3 text-center">Fecha</th>
                                                <th className="px-4 py-3 text-right">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {(process['PAGOS'] || []).map((pago, i) => (
                                                <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                                                    <td className="px-4 py-3 text-gray-800 font-medium">{pago.periodo}</td>
                                                    <td className="px-4 py-3 text-center text-gray-500 text-xs">{pago.fecha || '-'}</td>
                                                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">{formatCurrency(pago.valor)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-xl text-sm italic border border-gray-100 border-dashed">
                                    Sin pagos registrados
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-gray-50 p-4 rounded-xl flex flex-col gap-3 text-xs text-gray-500 border border-gray-100 mt-auto">
                        <div className="flex gap-4 flex-wrap">
                            <span className="flex items-center gap-1"><User size={14} /> Supervisor: <strong>{process['SUPERVISOR'] || 'No asignar'}</strong></span>
                            <span className="flex items-center gap-1"><Building2 size={14} /> Apoyo: <strong>{process['APOYO A LA SUPERVISIÓN'] || 'N/A'}</strong></span>
                        </div>
                        {process['LINK_SECOP'] && (
                            <a
                                href={process['LINK_SECOP']}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="secop-badge"
                                title={`Abrir en SECOP: ${process['LINK_SECOP']}`}
                            >
                                <span className="secop-badge-inner" style={{ padding: '6px 12px', fontSize: '11px', gap: '5px' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="secop-icon">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                        <polyline points="9 12 11 14 15 10"/>
                                    </svg>
                                    <span className="secop-label">Ver en SECOP</span>
                                </span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcessDetailModal;
