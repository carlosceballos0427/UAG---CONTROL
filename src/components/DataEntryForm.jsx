/**
 * DataEntryForm.jsx
 *
 * Formulario principal para crear y editar procesos contractuales.
 * - Dependencia: select desplegable con lista normalizada de organismos
 * - Pagos: "Cuenta de Cobro" con selector N°1 a N°48
 * - Todos los campos monetarios usan formato colombiano (puntos de miles)
 * - Link SECOP: campo para pegar el enlace del proceso en SECOP
 */
import { useState, useEffect, useRef } from 'react';
import { addEntry, updateEntry } from '../utils/storage';
import { Save, Info, CreditCard, ShieldCheck, Plus, Trash2, Wallet, Building2, User, ExternalLink } from 'lucide-react';

// ─── Utilidades de formateo monetario ─────────────────────────────

/** Formatea número con puntos de miles colombianos. Ej: 2350000 → "2.350.000" */
const formatColNumber = (value) => {
    if (!value || value === 0) return '';
    return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

/** Convierte cadena formateada a número limpio. Ej: "2.350.000" → 2350000 */
const parseColNumber = (str) => {
    if (!str) return 0;
    return parseInt(String(str).replace(/[^\d]/g, ''), 10) || 0;
};

/**
 * @component CurrencyInput
 * Input de texto que muestra el valor con separadores de miles colombianos.
 * Al escribir, solo acepta dígitos y formatea en tiempo real.
 */
const CurrencyInput = ({ value, onChange, className = '', placeholder = '0' }) => (
    <input
        type="text"
        inputMode="numeric"
        value={formatColNumber(value)}
        onChange={(e) => onChange(parseColNumber(e.target.value))}
        className={className}
        placeholder={placeholder}
    />
);

// ─── Opciones de Cuenta de Cobro ──────────────────────────────────
const CUENTAS_COBRO = Array.from({ length: 48 }, (_, i) => `Cuenta de Cobro N° ${i + 1}`);

// ─── Componente principal ─────────────────────────────────────────

/**
 * @component DataEntryForm
 * @param {Object|null} props.editingProcess - Proceso a editar, o null para crear.
 * @param {Function} props.onCancel - Callback al cancelar.
 * @param {Function} props.onSaved - Callback al guardar.
 * @param {string} props.initialYear - Año activo.
 * @param {string[]} props.years - Lista de años disponibles.
 * @param {string[]} props.dependencias - Lista de dependencias/organismos.
 */
const DataEntryForm = ({ editingProcess, onCancel, onSaved, initialYear, years, dependencias = [] }) => {

    const [year, setYear] = useState(initialYear || '2025');
    const [formData, setFormData] = useState({
        'No.': '',
        'MES': '',
        'NUMERO DE PROCESO': '',
        'AREA ENCARGADA': '',
        'DEPENDENCIA': '',
        'BP': '',
        'PROCESO': '',
        'OBJETO': '',
        'MODALIDAD': '',
        'TIPO DE CONTRATO': '',
        'PRESUPUESTO ESTIMADO': 0,
        'VALOR ADJUDICADO': 0,
        'CDP': 0,
        'SALDO POR PAGAR': 0,
        'ESTADO': 'PENDIENTE',
        'SUPERVISOR': '',
        'APOYO A LA SUPERVISIÓN': '',
        'CONTRATISTA': '',
        'LINK_SECOP': '',
        'ADICIONES': [],
        'PAGOS': []
    });

    /** Ref para scroll automático a la sección de pagos al agregar uno nuevo */
    const pagosRef = useRef(null);

    /** Carga datos del proceso al editar */
    useEffect(() => {
        if (editingProcess) {
            setFormData({
                ...editingProcess,
                'SUPERVISOR': editingProcess['SUPERVISOR'] || '',
                'APOYO A LA SUPERVISIÓN': editingProcess['APOYO A LA SUPERVISIÓN'] || '',
                'LINK_SECOP': editingProcess['LINK_SECOP'] || '',
                'ADICIONES': editingProcess['ADICIONES'] || [],
                'PAGOS': editingProcess['PAGOS'] || []
            });
        }
    }, [editingProcess]);

    // ... (rest of code)



    /** Recalcula el Saldo por Pagar automáticamente */
    useEffect(() => {
        const adicionesTotal = (formData['ADICIONES'] || []).reduce((s, a) => s + (parseFloat(a.valor) || 0), 0);
        const pagosTotal = (formData['PAGOS'] || []).reduce((s, p) => s + (parseFloat(p.valor) || 0), 0);
        const valorTotal = (parseFloat(formData['VALOR ADJUDICADO']) || 0) + adicionesTotal;
        setFormData(prev => ({ ...prev, 'SALDO POR PAGAR': valorTotal - pagosTotal }));
    }, [formData['VALOR ADJUDICADO'], formData['ADICIONES'], formData['PAGOS']]);

    // ─── Handlers ─────────────────────────────────────────────────

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCurrencyField = (fieldName, numericValue) => {
        setFormData(prev => ({ ...prev, [fieldName]: numericValue }));
    };

    // Adiciones
    const handleAddAddition = () => {
        setFormData(prev => ({
            ...prev,
            'ADICIONES': [...(prev['ADICIONES'] || []), { id: Date.now(), descripcion: '', valor: 0 }]
        }));
    };
    const handleRemoveAddition = (id) => {
        setFormData(prev => ({ ...prev, 'ADICIONES': prev['ADICIONES'].filter(a => a.id !== id) }));
    };
    const handleAdditionChange = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            'ADICIONES': prev['ADICIONES'].map(a => a.id === id ? { ...a, [field]: value } : a)
        }));
    };

    // Pagos
    const handleAddPayment = () => {
        setFormData(prev => ({
            ...prev,
            'PAGOS': [...(prev['PAGOS'] || []), { id: Date.now(), fecha: '', valor: 0, periodo: '' }]
        }));
        setTimeout(() => pagosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    };
    const handleRemovePayment = (id) => {
        setFormData(prev => ({ ...prev, 'PAGOS': prev['PAGOS'].filter(p => p.id !== id) }));
    };
    const handlePaymentChange = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            'PAGOS': prev['PAGOS'].map(p => p.id === id ? { ...p, [field]: value } : p)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProcess) {
                await updateEntry(year, formData);
                alert('Proceso actualizado correctamente');
            } else {
                await addEntry(year, formData);
                alert('Proceso guardado correctamente');
            }
            if (onSaved) onSaved();
        } catch (error) {
            console.error(error);
            alert('Error al guardar: ' + error.message);
        }
    };

    // ─── Valores calculados ───────────────────────────────────────
    const adicionesTotal = (formData['ADICIONES'] || []).reduce((s, a) => s + (parseFloat(a.valor) || 0), 0);
    const pagosTotal = (formData['PAGOS'] || []).reduce((s, p) => s + (parseFloat(p.valor) || 0), 0);

    // ─── Render ───────────────────────────────────────────────────
    return (
        <div className="form-root animate-fade-in-up">
            {/* Encabezado */}
            <header className="form-header">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">{editingProcess ? 'Editar Proceso' : 'Diligenciar Proceso'}</h1>
                    <p className="text-gray-500 text-sm">UAG Control — Complete la información del contrato</p>
                </div>
                {!editingProcess && (
                    <div className="year-selector-mini">
                        {(years || ['2025', '2026']).map(y => (
                            <button key={y} type="button" className={year === y ? 'active' : ''} onClick={() => setYear(y)}>{y}</button>
                        ))}
                    </div>
                )}
            </header>

            <form onSubmit={handleSubmit} className="premium-form">

                {/* ── SECCIÓN 1: Información Básica ── */}
                <section className="form-section">
                    <div className="section-title text-blue-600"><Info size={18} /> Información Básica</div>
                    <div className="fields-grid">
                        <div className="field">
                            <label>No.</label>
                            <input name="No." value={formData['No.']} onChange={handleChange} required placeholder="Ej: 1" />
                        </div>
                        <div className="field">
                            <label>Mes</label>
                            <select name="MES" value={formData['MES']} onChange={handleChange} required>
                                <option value="">Seleccionar...</option>
                                {['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label>Número de Proceso</label>
                            <input name="NUMERO DE PROCESO" value={formData['NUMERO DE PROCESO']} onChange={handleChange} placeholder="Ej: UAG-LP-001-2025" />
                        </div>
                        <div className="field">
                            <label>Área Encargada</label>
                            <input name="AREA ENCARGADA" value={formData['AREA ENCARGADA']} onChange={handleChange} placeholder="Ej: Administrativa" />
                        </div>
                    </div>

                    {/* Dependencia — select normalizado */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="field">
                            <label className="flex items-center gap-1">
                                <Building2 size={14} className="text-blue-400" /> Dependencia / Organismo
                            </label>
                            <select name="DEPENDENCIA" value={formData['DEPENDENCIA']} onChange={handleChange}>
                                <option value="">Seleccionar dependencia...</option>
                                {dependencias.map(dep => (
                                    <option key={dep} value={dep}>{dep}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label>Modalidad de Selección</label>
                            <select name="MODALIDAD" value={formData['MODALIDAD']} onChange={handleChange}>
                                <option value="">Seleccionar modalidad...</option>
                                {['LICITACIÓN PÚBLICA', 'SELECCIÓN ABREVIADA', 'CONCURSO DE MÉRITOS', 'CONTRATACIÓN DIRECTA', 'MÍNIMA CUANTÍA', 'RÉGIMEN ESPECIAL', 'ACUERDO MARCO DE PRECIOS', 'OTRA'].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* ── SECCIÓN 2: Detalles del Contrato ── */}
                <section className="form-section">
                    <div className="section-title text-indigo-600"><Save size={18} /> Detalles del Contrato</div>
                    <div className="fields-grid full-width">
                        <div className="field">
                            <label>Contratista</label>
                            <input name="CONTRATISTA" value={formData['CONTRATISTA']} onChange={handleChange} placeholder="Nombre de la empresa o persona" />
                        </div>
                        <div className="field">
                            <label>Objeto</label>
                            <textarea name="OBJETO" value={formData['OBJETO']} onChange={handleChange} rows="3" placeholder="Descripción detallada del objeto contractual..." />
                        </div>
                    </div>
                    {/* Campos de Personal (Supervisor / Apoyo) */}
                    <div className="fields-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '1rem' }}>
                        <div className="field">
                            <label className="flex items-center gap-1">
                                <User size={14} className="text-gray-400" /> Supervisor
                            </label>
                            <input name="SUPERVISOR" value={formData['SUPERVISOR']} onChange={handleChange} placeholder="Nombre del supervisor" />
                        </div>
                        <div className="field">
                            <label className="flex items-center gap-1">
                                <Building2 size={14} className="text-gray-400" /> Apoyo a la Supervisión
                            </label>
                            <input name="APOYO A LA SUPERVISIÓN" value={formData['APOYO A LA SUPERVISIÓN']} onChange={handleChange} placeholder="Nombre del apoyo" />
                        </div>
                    </div>
                </section>

                {/* ── SECCIÓN 3: Ejecución Financiera ── */}
                <section className="form-section">
                    <div className="section-title text-emerald-600"><CreditCard size={18} /> Ejecución Financiera</div>
                    <div className="fields-grid">
                        <div className="field">
                            <label>Presupuesto Estimado</label>
                            <div className="currency-input">
                                <span>$</span>
                                <CurrencyInput value={formData['PRESUPUESTO ESTIMADO']} onChange={v => handleCurrencyField('PRESUPUESTO ESTIMADO', v)} />
                            </div>
                        </div>
                        <div className="field">
                            <label>Valor Adjudicado</label>
                            <div className="currency-input">
                                <span>$</span>
                                <CurrencyInput value={formData['VALOR ADJUDICADO']} onChange={v => handleCurrencyField('VALOR ADJUDICADO', v)} />
                            </div>
                        </div>
                        {/* Saldo calculado automáticamente (Reemplaza a CDP) */}
                        <div className="field bg-emerald-50 p-3 rounded-xl border border-emerald-100 shadow-inner col-span-1">
                            <label className="text-emerald-700 text-xs font-black mb-1 uppercase tracking-widest flex items-center gap-1">
                                <Wallet size={14} /> Saldo por Pagar (Automático)
                            </label>
                            <div className="text-2xl font-black text-emerald-600">
                                $ {formatColNumber(formData['SALDO POR PAGAR'] || 0) || '0'}
                            </div>
                            <div className="text-[10px] text-emerald-600/70 mt-1 font-medium">
                                Val. Adjudicado + Adiciones − Total Pagos
                            </div>
                        </div>
                    </div>

                    {/* ── Adiciones ── */}
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Adiciones al Contrato</h4>
                            <button type="button" onClick={handleAddAddition} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold hover:bg-blue-100 transition-colors">
                                <Plus size={14} /> Agregar Adición
                            </button>
                        </div>
                        <div className="space-y-3">
                            {(formData['ADICIONES'] || []).map(adj => (
                                <div key={adj.id} className="flex gap-4 items-end bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-fade-in">
                                    <div className="flex-grow">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Descripción</label>
                                        <input
                                            value={adj.descripcion}
                                            onChange={e => handleAdditionChange(adj.id, 'descripcion', e.target.value)}
                                            className="w-full text-sm border-b border-gray-200 focus:border-blue-500 outline-none pb-1"
                                            placeholder="Ej: Adición N° 1"
                                        />
                                    </div>
                                    <div className="w-48">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Valor</label>
                                        <div className="flex items-center">
                                            <span className="text-gray-400 mr-1">$</span>
                                            <CurrencyInput
                                                value={adj.valor}
                                                onChange={v => handleAdditionChange(adj.id, 'valor', v)}
                                                className="w-full text-sm font-bold border-b border-gray-200 focus:border-blue-500 outline-none pb-1"
                                            />
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveAddition(adj.id)} className="text-red-400 hover:text-red-600 p-1">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {(formData['ADICIONES'] || []).length > 0 && (
                                <div className="flex justify-end p-2">
                                    <span className="text-xs text-gray-500">Total Adiciones: </span>
                                    <span className="text-sm font-bold text-gray-800 ml-1">$ {formatColNumber(adicionesTotal) || '0'}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Control de Pagos / Cuentas de Cobro ── */}
                    <div className="mt-8 border-t border-gray-100 pt-6" ref={pagosRef}>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                <Wallet size={16} className="text-emerald-500" /> Cuentas de Cobro
                            </h4>
                            <button type="button" onClick={handleAddPayment} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full font-bold hover:bg-emerald-100 transition-colors">
                                <Plus size={14} /> Registrar Cuenta de Cobro
                            </button>
                        </div>

                        <div className="space-y-3">
                            {(formData['PAGOS'] || []).map((pago, index) => (
                                <div key={pago.id} className="flex gap-4 items-end bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/50 shadow-sm animate-fade-in">
                                    {/* Número de cuenta de cobro (select) */}
                                    <div className="w-52">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Cuenta de Cobro</label>
                                        <select
                                            value={pago.periodo}
                                            onChange={e => handlePaymentChange(pago.id, 'periodo', e.target.value)}
                                            className="w-full text-sm border-b border-gray-200 focus:border-emerald-500 outline-none pb-1 bg-transparent"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {CUENTAS_COBRO.map(cc => (
                                                <option key={cc} value={cc}>{cc}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Fecha del pago */}
                                    <div className="w-36">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Fecha</label>
                                        <input
                                            type="date"
                                            value={pago.fecha}
                                            onChange={e => handlePaymentChange(pago.id, 'fecha', e.target.value)}
                                            className="w-full text-sm border-b border-gray-200 focus:border-emerald-500 outline-none pb-1 bg-transparent"
                                        />
                                    </div>
                                    {/* Valor pagado */}
                                    <div className="flex-grow">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Valor Pagado</label>
                                        <div className="flex items-center">
                                            <span className="text-gray-400 mr-1">$</span>
                                            <CurrencyInput
                                                value={pago.valor}
                                                onChange={v => handlePaymentChange(pago.id, 'valor', v)}
                                                className="w-full text-sm font-bold border-b border-gray-200 focus:border-emerald-500 outline-none pb-1 bg-transparent"
                                            />
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => handleRemovePayment(pago.id)} className="text-red-400 hover:text-red-600 p-1">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}

                            {(formData['PAGOS'] || []).length > 0 ? (
                                <div className="flex justify-end p-2">
                                    <span className="text-xs text-gray-500">Total Pagado: </span>
                                    <span className="text-sm font-bold text-emerald-600 ml-1">$ {formatColNumber(pagosTotal) || '0'}</span>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-400 text-sm italic">
                                    No hay cuentas de cobro registradas
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── SECCIÓN 4: Supervisión y Estado ── */}
                <section className="form-section">
                    <div className="section-title text-amber-600"><ShieldCheck size={18} /> Estado del Proceso</div>
                    <div className="fields-grid">
                        <div className="field">
                            <label>Estado Actual</label>
                            <select name="ESTADO" value={formData['ESTADO']} onChange={handleChange}>
                                <option value="PENDIENTE">PENDIENTE</option>
                                <option value="EN PROCESO">EN PROCESO</option>
                                <option value="EN EJECUCIÓN">EN EJECUCIÓN</option>
                                <option value="TERMINADO">TERMINADO</option>
                                <option value="LIQUIDADO">LIQUIDADO</option>
                                <option value="SUSPENDIDO">SUSPENDIDO</option>
                                <option value="EMPRÉSTITO">EMPRÉSTITO</option>
                            </select>
                        </div>
                        <div className="field">
                            <label className="flex items-center gap-1">
                                <ExternalLink size={14} className="text-blue-400" /> Link SECOP
                            </label>
                            <input
                                name="LINK_SECOP"
                                value={formData['LINK_SECOP']}
                                onChange={handleChange}
                                placeholder="https://community.secop.gov.co/..."
                                className="text-blue-600 underline"
                            />
                        </div>
                    </div>
                </section>

                {/* ── Botones de acción ── */}
                <div className="form-actions mt-12 pt-8 border-t border-gray-100 flex gap-4">
                    <button type="button" onClick={onCancel || (() => { })} className="px-8 py-3 rounded-xl font-bold bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">
                        {editingProcess ? 'Cancelar' : 'Limpiar'}
                    </button>
                    <button type="submit" className="flex-grow bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2">
                        <Save size={20} /> {editingProcess ? 'Actualizar Proceso' : 'Guardar Nuevo Proceso'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DataEntryForm;
