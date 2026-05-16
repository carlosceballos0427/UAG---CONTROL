import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import DataEntryForm from './components/DataEntryForm'
import ProcessList from './components/ProcessList'
import Settings from './components/Settings'
import ErrorBoundary from './components/ErrorBoundary'
import { getStoredData, deleteEntry, getStoredYears, saveStoredYears, getStoredDependencias, saveDependencias } from './utils/storage'
import { Settings as SettingsIcon, Eye, EyeOff, Moon, Sun, Menu, X, Calendar } from 'lucide-react'
import './styles/App.css'

const API_BASE = '/api';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [years, setYears] = useState(['2026', '2025'])
    const [year, setYear] = useState('2026')
    const [data, setData] = useState([])
    const [editingProcess, setEditingProcess] = useState(null)
    const [dependencias, setDependencias] = useState([])
    const [user, setUser] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)
    const [loginUsername, setLoginUsername] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [loginError, setLoginError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    
    // UI States
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('uag_theme') === 'dark' ||
                (!('uag_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('uag_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('uag_theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('uag_token');
            const storedUser = localStorage.getItem('uag_user');
            
            if (token && storedUser) {
                try {
                    const res = await fetch(`${API_BASE}/usuarios/?search=${storedUser}`, {
                        headers: { 'Authorization': `Token ${token}` }
                    });
                    if (res.ok) {
                        const users = await res.json();
                        if (users.length > 0) {
                            setUser({ username: storedUser, email: users[0].email, rol: users[0].rol });
                        } else {
                            handleLogout();
                        }
                    } else {
                        handleLogout();
                    }
                } catch (e) {
                    console.error("Auth error:", e);
                    handleLogout();
                }
            }
            setAuthLoading(false);
        };
        checkAuth();
    }, [])

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            const res = await fetch(`${API_BASE}/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: loginUsername, password: loginPassword })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('uag_token', data.token);
                localStorage.setItem('uag_user', loginUsername);
                window.location.reload();
            } else {
                setLoginError('Credenciales incorrectas. Por favor, verifica que tu usuario y contraseña estén bien escritos.');
            }
        } catch (e) {
            setLoginError('Error de conexión con el servidor');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('uag_token');
        localStorage.removeItem('uag_user');
        setUser(null);
        window.location.reload();
    };

    useEffect(() => {
        const storedYears = getStoredYears();
        let defaultYears = storedYears && storedYears.length > 0 ? storedYears : ['2026', '2025'];
        
        // Sort descending to get the most recent year
        const sortedYears = [...defaultYears].sort((a, b) => parseInt(b) - parseInt(a));
        
        setYears(sortedYears);
        setYear(sortedYears[0]);
        
        setDependencias(getStoredDependencias());
    }, [])

    useEffect(() => {
        getStoredData(year).then(setData)
    }, [year])

    const handleRefresh = () => {
        getStoredData(year).then(setData)
    }

    const handleEdit = (process) => {
        setEditingProcess(process)
        setActiveTab('entry')
    }

    const handleDelete = async (id) => {
        if (user?.rol !== 'admin') {
            alert('Acceso no autorizado: Solo los administradores pueden eliminar procesos.');
            return;
        }
        if (window.confirm('¿Está seguro de eliminar este proceso?')) {
            await deleteEntry(year, id)
            handleRefresh()
        }
    }

    const handleCancelEdit = () => {
        setEditingProcess(null)
        setActiveTab('list')
    }

    const handleSaved = () => {
        setEditingProcess(null)
        handleRefresh()
        setActiveTab('list')
    }

    const handleYearsChange = (newYears) => {
        const sortedYears = [...newYears].sort((a, b) => parseInt(b) - parseInt(a));
        setYears(sortedYears);
        saveStoredYears(sortedYears);
        if (!sortedYears.includes(year)) {
            setYear(sortedYears[0]);
        }
    }

    const handleDependenciasChange = (newDependencias) => {
        setDependencias(newDependencias);
        saveDependencias(newDependencias);
    }

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-xl text-gray-400 font-bold animate-pulse">Cargando UAG Control...</div></div>
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center border border-gray-100">
                    <div className="mb-8">
                        <div className="text-4xl font-black text-blue-600 tracking-widest leading-none mb-1">UAG</div>
                        <div className="text-sm font-bold text-blue-300 tracking-[0.2em] uppercase">Control</div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido</h1>
                    <p className="text-gray-500 mb-8 text-sm">Inicia sesión con tu cuenta para acceder a la plataforma.</p>
                    
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Nombre de Usuario"
                            value={loginUsername}
                            onChange={(e) => setLoginUsername(e.target.value)}
                            className="p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full p-3 pr-12 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors bg-transparent border-none outline-none"
                                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {loginError && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg mt-1 text-left shadow-sm animate-fade-in">
                                <p className="text-red-700 text-sm font-medium">{loginError}</p>
                            </div>
                        )}
                        
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all mt-2"
                        >
                            Ingresar
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="app-container">
            <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                {/* Logo / Nombre de la app */}
                <div className="logo mb-10">
                    <div className="text-xl font-black text-white tracking-widest leading-none">UAG</div>
                    <div className="text-xs font-bold text-blue-300 tracking-[0.2em] uppercase">Control</div>
                </div>
                <nav className="flex flex-col gap-2">
                    {isMobileMenuOpen && (
                        <div className="flex justify-end md:hidden mb-4">
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                    )}
                    <button
                        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                    >
                        <span className="text-lg">📊</span> Dashboard
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'list' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('list'); setIsMobileMenuOpen(false); }}
                    >
                        <span className="text-lg">📋</span> Listado
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'entry' ? 'active' : ''}`}
                        onClick={() => {
                            setEditingProcess(null);
                            setActiveTab('entry');
                            setIsMobileMenuOpen(false);
                        }}
                    >
                        <span className="text-lg">✍️</span> {editingProcess ? 'Editar' : 'Diligenciar'}
                    </button>
                    <div className="mt-auto pt-10">
                        {/* Dark Mode Toggle */}
                        <button
                            className="nav-item w-full mb-2"
                            onClick={() => setIsDarkMode(!isDarkMode)}
                        >
                            {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
                            {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                        </button>

                        <button
                            className={`nav-item w-full ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                        >
                            <SettingsIcon size={18} /> Configuración
                        </button>

                        <div className="my-4 border-t border-gray-200/20 dark:border-gray-700/50"></div>
                        <div className="px-3 mb-2">
                            <div className="text-xs text-gray-400 font-bold truncate">{user?.email}</div>
                            <div className="text-[10px] text-blue-400 font-bold uppercase mt-0.5">{user?.rol || 'radicador'}</div>
                        </div>
                        <button
                            className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={handleLogout}
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </nav>
            </aside>
            
            {/* Overlay para menú móvil */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            <main className="content p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                {/* Header Móvil */}
                <div className="md:hidden flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-widest leading-none">UAG</div>
                        <div className="text-xs font-bold text-gray-400 tracking-[0.2em] uppercase">Control</div>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                <div className="max-w-7xl mx-auto">
                    {activeTab === 'dashboard' && (
                        <ErrorBoundary>
                            <Dashboard data={data} year={year} setYear={setYear} years={years} />
                        </ErrorBoundary>
                    )}
                    {activeTab === 'list' && (
                        <div className="animate-fade-in">
                            <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Seguimiento de Contratos</h1>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">Gestión integral de la ejecución financiera — UAG Control</p>
                                </div>
                                <div className="year-selector bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-1 self-start md:self-auto overflow-x-auto max-w-full">
                                    {years.map(y => (
                                        <button
                                            key={y}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${year === y ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`}
                                            onClick={() => setYear(y)}
                                        >
                                            {year === y && <Calendar size={16} />}
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            </header>
                            <ProcessList data={data} onEdit={handleEdit} onDelete={handleDelete} userRole={user?.rol} />
                        </div>
                    )}
                    {activeTab === 'entry' && (
                        <ErrorBoundary onReset={handleCancelEdit}>
                            <DataEntryForm
                                editingProcess={editingProcess}
                                onCancel={handleCancelEdit}
                                onSaved={handleSaved}
                                initialYear={year}
                                years={years}
                                dependencias={dependencias}
                            />
                        </ErrorBoundary>
                    )}
                    {activeTab === 'settings' && (
                        <Settings
                            years={years}
                            onYearsChange={handleYearsChange}
                            data={data}
                            year={year}
                            onDataImported={handleRefresh}
                            dependencias={dependencias}
                            onDependenciasChange={handleDependenciasChange}
                            currentUser={user}
                        />
                    )}
                </div>
            </main>
        </div>
    )
}

export default App
