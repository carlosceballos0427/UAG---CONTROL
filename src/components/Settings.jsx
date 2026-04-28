import { useState, useRef, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Trash2, Calendar, Upload, Download, FileSpreadsheet, BarChart3, CheckCircle, AlertCircle, Loader2, Building2, Users } from 'lucide-react';
import { importExcel, exportToExcel, exportToCSV } from '../utils/excelIO';

/**
 * @component Settings
 * Panel de configuración: gestión de años, dependencias y exportación/importación de datos.
 */
const Settings = ({ years, onYearsChange, data, year, onDataImported, dependencias = [], onDependenciasChange, currentUser }) => {
    const [newYear, setNewYear] = useState('');
    const [newDependencia, setNewDependencia] = useState('');
    const [importStatus, setImportStatus] = useState(null);
    const [importMessage, setImportMessage] = useState('');
    const fileInputRef = useRef(null);

    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

    const [systemUsers, setSystemUsers] = useState([]);
    const [newUserState, setNewUserState] = useState({ username: '', email: '', password: '', rol: 'radicador' });

    useEffect(() => {
        if (currentUser?.rol === 'admin') {
            const fetchUsers = async () => {
                const token = localStorage.getItem('uag_token');
                const res = await fetch(`/api/usuarios/`, {
                    headers: { 'Authorization': `Token ${token}` }
                });
                if (res.ok) setSystemUsers(await res.json());
            };
            fetchUsers();
        }
    }, [currentUser]);

    const handleChangePassword = async () => {
        if (!newPassword || !newPasswordConfirm) return alert("Los campos de contraseña no pueden estar vacíos");
        if (newPassword !== newPasswordConfirm) return alert("Las contraseñas no coinciden");
        if (newPassword.length < 4) return alert("La contraseña debe tener al menos 4 caracteres");
        
        const token = localStorage.getItem('uag_token');
        const res = await fetch(`/api/usuarios/change_password/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
            body: JSON.stringify({ new_password: newPassword })
        });
        
        if (res.ok) {
            alert("Contraseña cambiada exitosamente. Por seguridad, deberás iniciar sesión de nuevo.");
            localStorage.removeItem('uag_token');
            localStorage.removeItem('uag_user');
            window.location.reload();
        } else {
            alert("Ocurrió un error al cambiar la contraseña.");
        }
    };

    const handleCreateUser = async () => {
        if (!newUserState.username || !newUserState.password) {
            alert('Usuario y contraseña son obligatorios');
            return;
        }
        const token = localStorage.getItem('uag_token');
        const res = await fetch(`/api/usuarios/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
            body: JSON.stringify(newUserState)
        });
        if (res.ok) {
            const created = await res.json();
            setSystemUsers([...systemUsers, created]);
            setNewUserState({ username: '', email: '', password: '', rol: 'radicador' });
            alert('Usuario creado exitosamente');
        } else {
            alert('Error al crear usuario. Revisa que el nombre de usuario no exista ya.');
        }
    };

    const handleDeleteUser = async (userToDelete) => {
        if (!window.confirm(`¿Seguro que deseas eliminar al usuario ${userToDelete.username}?`)) return;
        const token = localStorage.getItem('uag_token');
        const res = await fetch(`/api/usuarios/${userToDelete.id}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Token ${token}` }
        });
        if (res.ok) {
            setSystemUsers(systemUsers.filter(u => u.id !== userToDelete.id));
        }
    };

    // ─── Años ─────────────────────────────────────────────────────

    const handleAddYear = () => {
        if (!newYear || years.includes(newYear)) {
            alert('Año no válido o ya existente');
            return;
        }
        const updatedYears = [...years, newYear].sort((a, b) => b - a);
        onYearsChange(updatedYears);
        setNewYear('');
    };

    const handleRemoveYear = (yearToRemove) => {
        if (years.length <= 1) {
            alert('Debe haber al menos un año registrado');
            return;
        }
        if (window.confirm(`¿Está seguro de eliminar el año ${yearToRemove}? Se perderán los datos asociados.`)) {
            onYearsChange(years.filter(y => y !== yearToRemove));
        }
    };

    // ─── Dependencias ─────────────────────────────────────────────

    const handleAddDependencia = () => {
        const trimmed = newDependencia.trim();
        if (!trimmed) return;
        if (dependencias.includes(trimmed)) {
            alert('Esta dependencia ya existe');
            return;
        }
        onDependenciasChange([...dependencias, trimmed]);
        setNewDependencia('');
    };

    const handleRemoveDependencia = (dep) => {
        if (window.confirm(`¿Eliminar "${dep}" de la lista?`)) {
            onDependenciasChange(dependencias.filter(d => d !== dep));
        }
    };

    // ─── Import / Export ──────────────────────────────────────────

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImportStatus('loading');
        setImportMessage('Importando datos...');
        try {
            const result = await importExcel(file, year);
            setImportStatus('success');
            setImportMessage(`✅ ${result.count} procesos importados correctamente para el año ${year}`);
            if (onDataImported) onDataImported();
        } catch (err) {
            setImportStatus('error');
            setImportMessage(`❌ ${err.message}`);
        }
        e.target.value = '';
    };

    const handleExportExcel = () => {
        if (!data?.length) { alert('No hay datos para exportar'); return; }
        exportToExcel(data, year);
    };

    const handleExportCSV = () => {
        if (!data?.length) { alert('No hay datos para exportar'); return; }
        exportToCSV(data, year);
    };

    // ─── Render ───────────────────────────────────────────────────
    return (
        <div className="max-w-3xl mx-auto animate-fade-in-up space-y-8">
            <header>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <SettingsIcon size={32} className="text-gray-400" /> Configuración
                </h1>
                <p className="text-gray-500 mt-1">UAG Control — Gestión de parámetros y datos del sistema</p>
            </header>

            {/* ========== MI CUENTA ========== */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="p-8">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
                        <Users size={20} className="text-blue-500" /> Mi Cuenta ({currentUser?.username})
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">Administra de forma segura tu propia contraseña de acceso a la plataforma.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input 
                            type="password" placeholder="Nueva Contraseña" 
                            value={newPassword} onChange={e => setNewPassword(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input 
                            type="password" placeholder="Confirmar Nueva Contraseña" 
                            value={newPasswordConfirm} onChange={e => setNewPasswordConfirm(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            onClick={handleChangePassword}
                            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                        >
                            Actualizar Contraseña
                        </button>
                    </div>
                </div>
            </div>

            {/* ========== IMPORT / EXPORT ========== */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
                        <FileSpreadsheet size={20} className="text-emerald-500" /> Importar / Exportar Datos
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Año activo: <span className="font-bold text-gray-800">{year}</span>
                    </p>

                    {/* Import */}
                    <div className="mb-8">
                        <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Importar desde Excel</h4>
                        <div className="flex items-center gap-4">
                            <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
                            <button
                                onClick={handleImportClick}
                                disabled={importStatus === 'loading'}
                                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
                            >
                                {importStatus === 'loading' ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                                Seleccionar archivo .xlsx
                            </button>
                            <span className="text-xs text-gray-400">Se importarán los datos al año {year}</span>
                        </div>
                        {importMessage && (
                            <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${importStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    importStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                                        'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                {importStatus === 'success' && <CheckCircle size={18} />}
                                {importStatus === 'error' && <AlertCircle size={18} />}
                                {importStatus === 'loading' && <Loader2 size={18} className="animate-spin" />}
                                {importMessage}
                            </div>
                        )}
                    </div>

                    {/* Export */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Exportar datos ({data?.length || 0} procesos)</h4>
                        <div className="flex gap-4 flex-wrap">
                            <button onClick={handleExportExcel} disabled={!data?.length} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50">
                                <Download size={20} /> Exportar a Excel (.xlsx)
                            </button>
                            <button onClick={handleExportCSV} disabled={!data?.length} className="flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all disabled:opacity-50">
                                <BarChart3 size={20} /> Exportar para Power BI (.csv)
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-5 bg-amber-50/50 border-t border-amber-100">
                    <p className="text-xs text-amber-700/80 leading-relaxed">
                        <strong>💡 Nota:</strong> Al importar, los datos existentes del año {year} serán reemplazados.
                        El CSV usa separador <code>;</code> y codificación UTF-8 con BOM, compatible con Power BI y Excel en español.
                    </p>
                </div>
            </div>

            {/* ========== DEPENDENCIAS ========== */}
            
            {/* ========== GESTIÓN DE USUARIOS ========== */}
            {currentUser?.rol === 'admin' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8">
                <div className="p-8">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
                        <Users size={20} className="text-indigo-500" /> Gestión de Usuarios
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Crea cuentas de acceso para los demás miembros de tu equipo.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                        <input
                            type="text" placeholder="Usuario"
                            value={newUserState.username} onChange={e => setNewUserState({...newUserState, username: e.target.value})}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="email" placeholder="Correo (opcional)"
                            value={newUserState.email} onChange={e => setNewUserState({...newUserState, email: e.target.value})}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="password" placeholder="Contraseña"
                            value={newUserState.password} onChange={e => setNewUserState({...newUserState, password: e.target.value})}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                        <select 
                            value={newUserState.rol} onChange={e => setNewUserState({...newUserState, rol: e.target.value})}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="radicador">Radicador</option>
                            <option value="admin">Administrador</option>
                        </select>
                        <button
                            onClick={handleCreateUser}
                            className="md:col-span-4 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Crear Usuario
                        </button>
                    </div>

                    <div className="space-y-2">
                        {systemUsers.map((u, i) => (
                            <div key={i} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 group">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-800">{u.username}</span>
                                    <span className="text-xs text-gray-400 uppercase tracking-widest">{u.rol}</span>
                                </div>
                                {u.username !== currentUser?.username && (
                                <button
                                    onClick={() => handleDeleteUser(u)}
                                    className="text-red-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-sm"
                                    title="Eliminar usuario"
                                >
                                    <Trash2 size={16} />
                                </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            )}
            
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8">
                <div className="p-8">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
                        <Building2 size={20} className="text-blue-500" /> Dependencias / Organismos
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Lista normalizada de dependencias. Aparecerá como selector en el formulario de contratos.
                    </p>

                    {/* Agregar nueva */}
                    <div className="flex gap-3 mb-6">
                        <input
                            type="text"
                            value={newDependencia}
                            onChange={(e) => setNewDependencia(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDependencia())}
                            placeholder="Ej: Subdirección de Recursos Humanos"
                            className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                        <button
                            onClick={handleAddDependencia}
                            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <Plus size={18} /> Agregar
                        </button>
                    </div>

                    {/* Lista de dependencias */}
                    <div className="space-y-2">
                        {dependencias.map((dep, i) => (
                            <div key={i} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 group hover:bg-white hover:shadow-sm transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">{i + 1}</div>
                                    <span className="text-sm font-medium text-gray-700">{dep}</span>
                                </div>
                                <button
                                    onClick={() => handleRemoveDependencia(dep)}
                                    className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Eliminar dependencia"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {dependencias.length === 0 && (
                            <p className="text-center text-gray-400 text-sm italic py-4">No hay dependencias registradas</p>
                        )}
                    </div>
                </div>
                <div className="p-5 bg-blue-50/50 border-t border-blue-100">
                    <p className="text-xs text-blue-700/80 leading-relaxed">
                        <strong>💡 Tip:</strong> Usar nombres estandarizados garantiza uniformidad en las gráficas y reportes.
                        Presiona <kbd className="bg-white px-1 rounded border border-blue-200 text-xs">Enter</kbd> para agregar rápidamente.
                    </p>
                </div>
            </div>

            {/* ========== GESTIÓN DE AÑOS ========== */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                        <Calendar size={20} className="text-blue-500" /> Gestión de Años
                    </h3>
                    <div className="flex gap-3 mb-8">
                        <input
                            type="number"
                            value={newYear}
                            onChange={(e) => setNewYear(e.target.value)}
                            placeholder="Ej: 2027"
                            className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                        />
                        <button onClick={handleAddYear} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
                            <Plus size={20} /> Agregar Año
                        </button>
                    </div>
                    <div className="space-y-3">
                        {years.map(y => (
                            <div key={y} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-sm transition-all">
                                <span className="text-xl font-black text-gray-700">{y}</span>
                                <button onClick={() => handleRemoveYear(y)} className="text-red-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity" title="Eliminar año">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-6 bg-blue-50/50 border-t border-blue-100">
                    <div className="flex gap-4">
                        <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 h-fit">
                            <SettingsIcon size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900">Nota sobre el almacenamiento</h4>
                            <p className="text-sm text-blue-700/80 mt-1 leading-relaxed">
                                Los datos se guardan localmente en su navegador (LocalStorage).
                                Use la opción de exportar para mantener copias de seguridad.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
