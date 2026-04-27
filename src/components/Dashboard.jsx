import { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    BarChart, Bar
} from 'recharts';
import { LayoutDashboard, CheckCircle, Clock, DollarSign, Wallet, Building2 } from 'lucide-react';

const Dashboard = ({ data, year, setYear, years }) => {
    const metrics = useMemo(() => {
        const totalProcesos = data.length;
        const completados = data.filter(d => d.ESTADO === 'FINALIZADO').length;
        const enProceso = data.filter(d => d.ESTADO === 'EN PROCESO').length;

        const presupuestoTotal = data.reduce((acc, d) => acc + (parseFloat(d['PRESUPUESTO ESTIMADO']) || 0), 0);
        const valorAdjudicado = data.reduce((acc, d) => {
            const adiciones = (d['ADICIONES'] || []).reduce((sum, adj) => sum + (parseFloat(adj.valor) || 0), 0);
            return acc + (parseFloat(d['VALOR ADJUDICADO']) || 0) + adiciones;
        }, 0);

        const totalCDP = data.reduce((acc, d) => acc + (parseFloat(d['CDP']) || 0), 0);
        const saldoTotal = valorAdjudicado - totalCDP;

        return [
            { label: 'Procesos Totales', value: totalProcesos, icon: <LayoutDashboard size={20} />, color: '#6366f1' },
            { label: 'Finalizados', value: completados, icon: <CheckCircle size={20} />, color: '#10b981' },
            { label: 'Presupuesto Estimado', value: `$ ${new Intl.NumberFormat('es-CO').format(presupuestoTotal)}`, icon: <DollarSign size={20} />, color: '#8b5cf6' },
            { label: 'Valor Adjudicado + Adic.', value: `$ ${new Intl.NumberFormat('es-CO').format(valorAdjudicado)}`, icon: <Wallet size={20} />, color: '#3b82f6' },
            { label: 'Saldo por Pagar', value: `$ ${new Intl.NumberFormat('es-CO').format(saldoTotal)}`, icon: <Clock size={20} />, color: '#f59e0b' },
        ];
    }, [data]);

    const chartData = useMemo(() => {
        const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
        return meses.map(mes => {
            const procesosMes = data.filter(d => d.MES === mes);
            const total = procesosMes.reduce((acc, d) => {
                const adiciones = (d['ADICIONES'] || []).reduce((sum, adj) => sum + (parseFloat(adj.valor) || 0), 0);
                return acc + (parseFloat(d['VALOR ADJUDICADO']) || 0) + adiciones;
            }, 0);
            return { name: mes.substring(0, 3).toUpperCase(), value: total };
        });
    }, [data]);

    const statusData = useMemo(() => {
        const counts = data.reduce((acc, d) => {
            const status = d.ESTADO || 'PENDIENTE';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    }, [data]);

    const modalidadData = useMemo(() => {
        const normalize = (str) => {
            if (!str) return 'SIN DEFINIR';
            let s = str.toString().trim().toUpperCase();
            // Normalizar acentos y abreviaturas comunes
            s = s.replace('CONTRATACION', 'CONTRATACIÓN');
            s = s.replace('MINIMA', 'MÍNIMA');
            s = s.replace('CUANTIA', 'CUANTÍA');
            s = s.replace('SELECCION', 'SELECCIÓN');
            s = s.replace('PUBLICA', 'PÚBLICA');
            s = s.replace('MERITOS', 'MÉRITOS');
            s = s.replace('REGIMEN', 'RÉGIMEN');
            return s;
        };

        const counts = data.reduce((acc, d) => {
            const mod = normalize(d['MODALIDAD']);
            acc[mod] = (acc[mod] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(counts)
            .map(key => ({ name: key, value: counts[key] }))
            .sort((a, b) => b.value - a.value);
    }, [data]);

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6366f1'];

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                {metrics.map((m, i) => {
                    // Determinar tamaño de fuente según longitud del valor
                    const valueStr = String(m.value);
                    const fontSize = valueStr.length > 18 ? 'text-sm' : valueStr.length > 12 ? 'text-base' : 'text-xl';

                    return (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between min-h-[130px]">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity" style={{ color: m.color }}>
                                {m.icon}
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-tight min-h-[28px]">{m.label}</span>
                            <div className={`mt-2 ${fontSize} font-black text-gray-900 break-all leading-tight`} title={valueStr}>{m.value}</div>
                            <div className="h-1 w-12 mt-4 rounded-full" style={{ backgroundColor: m.color }}></div>
                        </div>
                    );
                })}
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
                                <Tooltip
                                    contentStyle={{ background: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`$${new Intl.NumberFormat('es-CO').format(value)}`, 'Ejecución']}
                                />
                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#fff', stroke: '#3b82f6', strokeWidth: 3 }} activeDot={{ r: 8, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 font-display">Estado de Procesos</h3>
                    <div className="h-[300px] w-full relative">
                        {data.length > 0 ? (
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
                                    <Tooltip />
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
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ background: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
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
