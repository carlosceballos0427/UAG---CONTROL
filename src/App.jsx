import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import DataEntryForm from './components/DataEntryForm'
import ProcessList from './components/ProcessList'
import Settings from './components/Settings'
import ErrorBoundary from './components/ErrorBoundary'
import { getStoredData, deleteEntry, getStoredYears, saveStoredYears, getStoredDependencias, saveDependencias } from './utils/storage'
import { Settings as SettingsIcon, Eye, EyeOff, Moon, Sun, Menu, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import logoAlcaldia from './assets/logo_alcaldia.png'
import logoHacienda from './assets/logo_hacienda.png'
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
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('uag_sidebar_collapsed') === 'true';
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem('uag_sidebar_collapsed', isSidebarCollapsed);
    }, [isSidebarCollapsed]);

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
            <div className="login-page-container">
                <div className="login-card">
                    <div className="login-logo-wrapper">
                        <img src={logoAlcaldia} alt="Alcaldía de Cali" className="login-logo" />
                    </div>
                    
                    <div className="login-header-pretitle">Alcaldía de Santiago de Cali</div>
                    <div className="login-header-title">Departamento Administrativo de Hacienda</div>
                    <div className="login-header-subtitle">Control Contractual (UAG)</div>
                    
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div className="text-left">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1.5 pl-1">Usuario</label>
                            <input
                                type="text"
                                placeholder="Ingresa tu usuario"
                                value={loginUsername}
                                onChange={(e) => setLoginUsername(e.target.value)}
                                className="login-input"
                                required
                            />
                        </div>
                        
                        <div className="text-left">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1.5 pl-1">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Ingresa tu contraseña"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    className="login-input pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors bg-transparent border-none outline-none"
                                    title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {loginError && (
                            <div className="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 p-3 rounded-r-lg mt-1 text-left shadow-sm animate-fade-in">
                                <p className="text-red-700 dark:text-red-400 text-xs font-semibold">{loginError}</p>
                            </div>
                        )}
                        
                        <button
                            type="submit"
                            className="login-button mt-4"
                        >
                            Ingresar al Sistema
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                {/* Logo / Nombre de la app */}
                <div className="sidebar-logo-container">
                    <div className="sidebar-logo-wrapper">
                        <img src={logoAlcaldia} alt="Logo Alcaldía" className="sidebar-logo-image" />
                    </div>
                    <div className={`sidebar-logo-text ${isSidebarCollapsed ? 'hidden' : ''}`}>
                        <div className="text-lg font-black text-white tracking-widest leading-none">UAG</div>
                        <div className="text-[10px] font-bold text-emerald-400 tracking-[0.2em] uppercase">Control</div>
                    </div>
                </div>
                {/* Toggle collapse button */}
                <button
                    className="sidebar-toggle-btn"
                    onClick={() => setIsSidebarCollapsed(prev => !prev)}
                    title={isSidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
                >
                    {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
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
                        title={isSidebarCollapsed ? 'Dashboard' : ''}
                    >
                        <span className="nav-icon">📊</span>
                        <span className={`nav-label ${isSidebarCollapsed ? 'hidden' : ''}`}>Dashboard</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'list' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('list'); setIsMobileMenuOpen(false); }}
                        title={isSidebarCollapsed ? 'Listado' : ''}
                    >
                        <span className="nav-icon">📋</span>
                        <span className={`nav-label ${isSidebarCollapsed ? 'hidden' : ''}`}>Listado</span>
                    </button>
                    {user?.rol !== 'visualizador' && (
                        <button
                            className={`nav-item ${activeTab === 'entry' ? 'active' : ''}`}
                            onClick={() => {
                                setEditingProcess(null);
                                setActiveTab('entry');
                                setIsMobileMenuOpen(false);
                            }}
                            title={isSidebarCollapsed ? (editingProcess ? 'Editar' : 'Diligenciar') : ''}
                        >
                            <span className="nav-icon">✍️</span>
                            <span className={`nav-label ${isSidebarCollapsed ? 'hidden' : ''}`}>{editingProcess ? 'Editar' : 'Diligenciar'}</span>
                        </button>
                    )}
                    <div className="mt-auto pt-10">
                        {/* Dark Mode Toggle */}
                        <button
                            className="nav-item w-full mb-2"
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            title={isSidebarCollapsed ? (isDarkMode ? 'Modo Claro' : 'Modo Oscuro') : ''}
                        >
                            {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
                            <span className={`nav-label ${isSidebarCollapsed ? 'hidden' : ''}`}>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                        </button>

                        <button
                            className={`nav-item w-full ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                            title={isSidebarCollapsed ? 'Configuración' : ''}
                        >
                            <SettingsIcon size={18} />
                            <span className={`nav-label ${isSidebarCollapsed ? 'hidden' : ''}`}>Configuración</span>
                        </button>

                        <div className="my-4 border-t border-gray-200/20 dark:border-gray-700/50"></div>
                        <div className={`px-3 mb-2 ${isSidebarCollapsed ? 'hidden' : ''}`}>
                            <div className="text-xs text-gray-400 font-bold truncate">{user?.email}</div>
                            <div className="text-[10px] text-blue-400 font-bold uppercase mt-0.5">{user?.rol || 'radicador'}</div>
                        </div>
                        <button
                            className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={handleLogout}
                            title={isSidebarCollapsed ? 'Cerrar Sesión' : ''}
                        >
                            <span className="nav-icon text-lg">🚪</span>
                            <span className={`nav-label ${isSidebarCollapsed ? 'hidden' : ''}`}>Cerrar Sesión</span>
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
                        <div className="mobile-logo-wrapper">
                            <img src={logoAlcaldia} alt="Alcaldía" className="mobile-logo-image" />
                        </div>
                        <div>
                            <div className="text-base font-black text-blue-600 dark:text-blue-400 tracking-widest leading-none">UAG</div>
                            <div className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase">Control</div>
                        </div>
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
