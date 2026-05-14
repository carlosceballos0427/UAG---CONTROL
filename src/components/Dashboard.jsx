import { useMemo, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    BarChart, Bar
} from 'recharts';
import { LayoutDashboard, Clock, DollarSign, Wallet, Building2, Landmark, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/** Formatea valores monetarios con 2 decimales */
const fmtCurrency = (val) => `$ ${new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0)}`;

// ─── Tooltip personalizado para el Pie Chart ──────────────────────
const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { name, value, percent } = payload[0];
        return (
            <div className="bg-white px-4 py-3 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{name}</div>
                <div className="text-lg font-black text-gray-900">{value} procesos</div>
                <div className="text-xs text-gray-400 mt-0.5">{(percent * 100).toFixed(1)}% del total</div>
            </div>
        );
    }
    return null;
};

// ─── Tooltip personalizado para el Bar Chart ──────────────────────
const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white px-4 py-3 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</div>
                <div className="text-lg font-black text-purple-700">{payload[0].value} procesos</div>
            </div>
        );
    }
    return null;
};

// ─── Tooltip personalizado para el Line Chart ─────────────────────
const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white px-4 py-3 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</div>
                <div className="text-lg font-black text-blue-700">
                    {fmtCurrency(payload[0].value)}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Ejecución del mes</div>
            </div>
        );
    }
    return null;
};

const Dashboard = ({ data, year, setYear, years }) => {
    const mainData = useMemo(() => data.filter(d => d.ESTADO !== 'EMPRÉSTITO'), [data]);
    const emprestitoData = useMemo(() => data.filter(d => d.ESTADO === 'EMPRÉSTITO'), [data]);

    // ─── Métricas de Saldo a Favor y Cuentas por Cobrar ──────────────
    const saldoMetrics = useMemo(() => {
        const aFavor = mainData.filter(d => d['TIPO_SALDO'] === 'A_FAVOR');
        const cxc = mainData.filter(d => d['TIPO_SALDO'] === 'CUENTAS_POR_COBRAR');

        const calcSaldo = (items) => items.reduce((acc, d) => {
            const adiciones = (d['ADICIONES'] || []).reduce((sum, adj) => sum + (parseFloat(adj.valor) || 0), 0);
            const valorTotal = (parseFloat(d['VALOR ADJUDICADO']) || 0) + adiciones;
            const pagos = (d['PAGOS'] || []).reduce((sum, p) => sum + (parseFloat(p.valor) || 0), 0);
            return acc + (valorTotal - pagos);
        }, 0);

        return {
            aFavorCount: aFavor.length,
            aFavorTotal: calcSaldo(aFavor),
            cxcCount: cxc.length,
            cxcTotal: calcSaldo(cxc),
        };
    }, [mainData]);

    const metrics = useMemo(() => {
        const totalProcesos = mainData.length;
        const enProceso = mainData.filter(d => d.ESTADO === 'EN PROCESO').length;
        const enEjecucion = mainData.filter(d => d.ESTADO === 'EN EJECUCIÓN').length;
        const pendientes = mainData.filter(d => d.ESTADO === 'PENDIENTE' || !d.ESTADO).length;
        const terminados = mainData.filter(d => d.ESTADO === 'TERMINADO').length;
        const liquidados = mainData.filter(d => d.ESTADO === 'LIQUIDADO').length;
        const suspendidos = mainData.filter(d => d.ESTADO === 'SUSPENDIDO').length;
        const emitidos = mainData.filter(d => d.ESTADO === 'EMITIDO').length;

        const presupuestoTotal = mainData.reduce((acc, d) => acc + (parseFloat(d['PRESUPUESTO ESTIMADO']) || 0), 0);
        const valorAdjudicado = mainData.reduce((acc, d) => {
            const adiciones = (d['ADICIONES'] || []).reduce((sum, adj) => sum + (parseFloat(adj.valor) || 0), 0);
            return acc + (parseFloat(d['VALOR ADJUDICADO']) || 0) + adiciones;
        }, 0);

        const totalPagado = mainData.reduce((acc, d) => {
            const pagos = (d['PAGOS'] || []).reduce((sum, p) => sum + (parseFloat(p.valor) || 0), 0);
            return acc + pagos;
        }, 0);
        const saldoTotal = valorAdjudicado - totalPagado;

        return [
            {
                label: 'Procesos Totales', value: totalProcesos, icon: <LayoutDashboard size={20} />, color: '#6366f1',
                tooltip: `Pendientes: ${pendientes} | En Proceso: ${enProceso} | En Ejecución: ${enEjecucion} | Terminados: ${terminados} | Liquidados: ${liquidados} | Suspendidos: ${suspendidos} | Emitidos: ${emitidos}`
            },
            {
                label: 'Presupuesto Estimado', value: fmtCurrency(presupuestoTotal), icon: <DollarSign size={20} />, color: '#8b5cf6',
                tooltip: `Presupuesto estimado total para el año ${year}`
            },
            {
                label: 'Valor Adjudicado + Adic.', value: fmtCurrency(valorAdjudicado), icon: <Wallet size={20} />, color: '#3b82f6',
                tooltip: `Total pagado: ${fmtCurrency(totalPagado)} (${valorAdjudicado > 0 ? ((totalPagado / valorAdjudicado) * 100).toFixed(1) : 0}% ejecutado)`
            },
            {
                label: 'Saldo por Pagar', value: fmtCurrency(saldoTotal), icon: <Clock size={20} />, color: '#f59e0b',
                tooltip: `Pendiente de ejecución financiera`
            },
        ];
    }, [mainData, year]);

    const emprestitoMetrics = useMemo(() => {
        const total = emprestitoData.length;
        const valorTotal = emprestitoData.reduce((acc, d) => {
            const adiciones = (d['ADICIONES'] || []).reduce((sum, adj) => sum + (parseFloat(adj.valor) || 0), 0);
            return acc + (parseFloat(d['VALOR ADJUDICADO']) || 0) + adiciones;
        }, 0);
        return { total, valorTotal };
    }, [emprestitoData]);

    const chartData = useMemo(() => {
        const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
        return meses.map(mes => {
            const procesosMes = mainData.filter(d => d.MES === mes);
            const total = procesosMes.reduce((acc, d) => {
                const adiciones = (d['ADICIONES'] || []).reduce((sum, adj) => sum + (parseFloat(adj.valor) || 0), 0);
                return acc + (parseFloat(d['VALOR ADJUDICADO']) || 0) + adiciones;
            }, 0);
            return { name: mes.substring(0, 3).toUpperCase(), value: total };
        });
    }, [mainData]);

    const statusData = useMemo(() => {
        const counts = mainData.reduce((acc, d) => {
            const status = d.ESTADO || 'PENDIENTE';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    }, [mainData]);

    const modalidadData = useMemo(() => {
        const normalize = (str) => {
            if (!str) return 'SIN DEFINIR';
            let s = str.toString().trim().toUpperCase();
            s = s.replace('CONTRATACION', 'CONTRATACIÓN');
            s = s.replace('MINIMA', 'MÍNIMA');
            s = s.replace('CUANTIA', 'CUANTÍA');
            s = s.replace('SELECCION', 'SELECCIÓN');
            s = s.replace('PUBLICA', 'PÚBLICA');
            s = s.replace('MERITOS', 'MÉRITOS');
            s = s.replace('REGIMEN', 'RÉGIMEN');
            return s;
        };

        const counts = mainData.reduce((acc, d) => {
            const mod = normalize(d['MODALIDAD']);
            acc[mod] = (acc[mod] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(counts)
            .map(key => ({ name: key, value: counts[key] }))
            .sort((a, b) => b.value - a.value);
    }, [mainData]);

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6366f1', '#6b7280', '#ec4899', '#8b5cf6'];

    // ─── Hover tooltip state para tarjetas ────────────────────────
    const [hoveredCard, setHoveredCard] = useState(null);

    return (
        <div className="dashboard-root animate-fade-in">
            <header className="dashboard-header mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard General</h1>
                    <p className="text-gray-500 mt-1">Resumen ejecutivo de la ejecución del año {year}</p>
                </div>
                <div className="year-selector bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex gap-1">
                    {(years || ['2025', '2026']).map(y => (
                        <button
                            key={y}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${year === y ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-500 hover:bg-gray-50'}`}
                            onClick={() => setYear(y)}
                        >{y}</button>
                    ))}
                </div>
            </header>

            {/* Sección Especial: Empréstitos */}
            {emprestitoMetrics.total > 0 && (
                <div className="mb-8 bg-gradient-to-r from-purple-600 to-indigo-700 p-6 rounded-3xl shadow-lg border border-purple-500 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm shadow-inner">
                            <Landmark size={36} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xs font-bold text-purple-200 uppercase tracking-widest mb-1">Gestión de Empréstitos (Ingresos)</h2>
                            <div className="text-3xl font-black tracking-tight">{emprestitoMetrics.total} <span className="text-xl font-medium text-purple-200">Procesos Registrados</span></div>
                        </div>
                    </div>
                    <div className="text-right bg-black/10 px-6 py-4 rounded-2xl">
                        <div className="text-xs font-bold text-purple-200 uppercase tracking-widest mb-1">Valor Total de Empréstitos</div>
                        <div className="text-3xl font-black text-emerald-300">{fmtCurrency(emprestitoMetrics.valorTotal)}</div>
                    </div>
                </div>
            )}

            {/* ─── Tarjetas de métricas principales (4 columnas) ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metrics.map((m, i) => {
                    const valueStr = String(m.value);
                    const fontSize = valueStr.length > 18 ? 'text-sm' : valueStr.length > 12 ? 'text-base' : 'text-xl';

                    return (
                        <div
                            key={i}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden group flex flex-col justify-between min-h-[130px] cursor-default"
                            onMouseEnter={() => setHoveredCard(i)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity" style={{ color: m.color }}>
                                {m.icon}
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-tight min-h-[28px]">{m.label}</span>
                            <div className={`mt-2 ${fontSize} font-black text-gray-900 break-all leading-tight`} title={valueStr}>{m.value}</div>
                            <div className="h-1 w-12 mt-4 rounded-full" style={{ backgroundColor: m.color }}></div>

                            {/* Tooltip al hover */}
                            {hoveredCard === i && m.tooltip && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-gray-900 text-white text-[11px] px-4 py-2.5 rounded-xl shadow-2xl whitespace-nowrap animate-fade-in pointer-events-none max-w-[350px] text-center leading-relaxed"
                                     style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                    {m.tooltip}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ─── Sección: Saldos a Favor y Cuentas por Cobrar ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Saldos a Favor */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-emerald-100/40 rounded-full blur-2xl group-hover:bg-emerald-200/50 transition-all duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-emerald-100 shadow-sm">
                                <TrendingUp size={22} className="text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest">Saldos a Favor</h3>
                                <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Procesos con saldo positivo a favor</p>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-4xl font-black text-emerald-700 tracking-tight">{saldoMetrics.aFavorCount}</div>
                                <div className="text-xs text-emerald-500 font-semibold mt-1">procesos clasificados</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Valor Total</div>
                                <div className="text-xl font-black text-emerald-700">{fmtCurrency(saldoMetrics.aFavorTotal)}</div>
                            </div>
                        </div>
                        {saldoMetrics.aFavorCount > 0 && (
                            <div className="mt-4 flex items-center gap-2 text-emerald-500">
                                <ArrowUpRight size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Saldos disponibles</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cuentas por Cobrar */}
                <div className="relative overflow-hidden rounded-2xl border border-rose-200/60 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-rose-100/40 rounded-full blur-2xl group-hover:bg-rose-200/50 transition-all duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-rose-100 shadow-sm">
                                <TrendingDown size={22} className="text-rose-600" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest">Cuentas por Cobrar</h3>
                                <p className="text-[10px] text-rose-400 font-medium mt-0.5">Procesos con cobros pendientes</p>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-4xl font-black text-rose-700 tracking-tight">{saldoMetrics.cxcCount}</div>
                                <div className="text-xs text-rose-500 font-semibold mt-1">procesos clasificados</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">Valor Total</div>
                                <div className="text-xl font-black text-rose-700">{fmtCurrency(saldoMetrics.cxcTotal)}</div>
                            </div>
                        </div>
                        {saldoMetrics.cxcCount > 0 && (
                            <div className="mt-4 flex items-center gap-2 text-rose-500">
                                <ArrowDownRight size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Pendientes de cobro</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <LineChart size={20} className="text-blue-500" /> Ejecución Ejecutada por Mes
                    </h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(value) => `$${value / 1000000}M`} />
                                <Tooltip content={<CustomLineTooltip />} />
                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#fff', stroke: '#3b82f6', strokeWidth: 3 }} activeDot={{ r: 8, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 font-display">Estado de Procesos</h3>
                    <div className="h-[300px] w-full relative">
                        {mainData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 italic">
                                <span>Sin datos suficientes</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Gráfico de Modalidades */}
                <div className="lg:col-span-3 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Building2 size={20} className="text-purple-500" /> Distribución por Modalidad de Selección
                    </h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={modalidadData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis dataKey="name" type="category" width={150} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
