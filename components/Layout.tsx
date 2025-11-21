
import React, { useState, useMemo } from 'react';
import { HomeIcon, UsersIcon, BellIcon, ChatBubbleOvalLeftEllipsisIcon, LightbulbIcon, GraduationCapIcon, UserGroupIcon, LogoutIcon, Cog6ToothIcon } from './icons/Icons';
import Notifications from './Notifications';
import type { AuthenticatedUser, Notification, UserRole } from '../types';

// Hamburger Icon Component locally defined for layout usage
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

interface LayoutProps {
    children: React.ReactNode;
    user: AuthenticatedUser | null;
    setView: (view: any) => void;
    currentView: string;
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
    onLogout: () => void;
    onClearNotifications: () => void;
}

const NavItem = ({ label, icon, isActive, onClick, disabled }: { label: string, icon: React.FC<any>, isActive: boolean, onClick: () => void, disabled?: boolean }) => {
    const Icon = icon;
    const activeClasses = "bg-sky-600 text-white shadow-lg shadow-sky-900/20";
    const inactiveClasses = "text-slate-400 hover:bg-slate-800 hover:text-white";
    const disabledClasses = "opacity-50 cursor-not-allowed";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out group ${isActive ? activeClasses : inactiveClasses} ${disabled ? disabledClasses : ''}`}
        >
            <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
            <span>{label}</span>
        </button>
    );
};


const Layout: React.FC<LayoutProps> = ({ children, user, setView, currentView, notifications, setNotifications, onLogout, onClearNotifications }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const roleName: { [key in UserRole]: string } = {
        'Docente': 'Docente',
        'Familia': 'Familia',
        'Director': 'Director',
    };
    
    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    const handleToggleNotifications = () => {
        setShowNotifications(s => !s);
        if (!showNotifications) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    const handleNavClick = (view: string) => {
        setView(view);
        setIsSidebarOpen(false); // Close sidebar on mobile selection
    };

    if (!user) return null;

    const renderNavItems = () => {
        const commonItems = (
             <div className="pt-4 mt-4 border-t border-slate-700/50">
                <NavItem label="Configuración" icon={Cog6ToothIcon} isActive={currentView === 'settings'} onClick={() => handleNavClick('settings')} />
            </div>
        );

        switch(user.role) {
            case 'Director':
                return (
                    <>
                        <NavItem label="Dashboard" icon={GraduationCapIcon} isActive={currentView === 'dashboard'} onClick={() => handleNavClick('dashboard')} />
                        <NavItem label="Estudiantes" icon={UsersIcon} isActive={currentView === 'students'} onClick={() => handleNavClick('students')} />
                        <NavItem label="Familias" icon={UserGroupIcon} isActive={currentView === 'families'} onClick={() => handleNavClick('families')} />
                        <NavItem label="Estrategias" icon={LightbulbIcon} isActive={currentView === 'strategies'} onClick={() => handleNavClick('strategies')} />
                        <NavItem label="Asistente IA" icon={ChatBubbleOvalLeftEllipsisIcon} isActive={currentView === 'assistant'} onClick={() => handleNavClick('assistant')} />
                        {commonItems}
                    </>
                );
            case 'Familia':
                 return (
                    <>
                        <NavItem label="Panel Principal" icon={HomeIcon} isActive={currentView === 'dashboard'} onClick={() => handleNavClick('dashboard')} />
                        <NavItem label="Asesor IA" icon={ChatBubbleOvalLeftEllipsisIcon} isActive={currentView === 'assistant'} onClick={() => handleNavClick('assistant')} />
                        {commonItems}
                    </>
                 );
            case 'Docente':
            default:
                return (
                    <>
                        <NavItem label="Dashboard" icon={HomeIcon} isActive={currentView === 'dashboard'} onClick={() => handleNavClick('dashboard')} />
                        <NavItem label="Estudiantes" icon={UsersIcon} isActive={currentView === 'students'} onClick={() => handleNavClick('students')} />
                        <NavItem label="Familias" icon={UserGroupIcon} isActive={currentView === 'families'} onClick={() => handleNavClick('families')} />
                        <NavItem label="Estrategias" icon={LightbulbIcon} isActive={currentView === 'strategies'} onClick={() => handleNavClick('strategies')} />
                        <NavItem label="Asistente IA" icon={ChatBubbleOvalLeftEllipsisIcon} isActive={currentView === 'assistant'} onClick={() => handleNavClick('assistant')} />
                        {commonItems}
                    </>
                );
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="px-8 py-8 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-sky-500/30 flex-shrink-0">
                            <span className="text-white font-bold text-xl">P</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">
                                <span className="text-white">PIAR</span>
                                <span className="text-sky-400">.360</span>
                            </h1>
                            <p className="text-xs text-slate-400 font-medium">Asistente de Inclusión</p>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {renderNavItems()}
                </nav>
                <div className="p-6 border-t border-slate-800">
                     <div className="flex items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        {user.photo_url ? (
                            <img src={user.photo_url} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-slate-600 flex-shrink-0" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                               {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">
                                {user.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{roleName[user.role]}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative w-full">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-10 flex justify-between items-center px-4 md:px-8 py-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                            <Bars3Icon className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg font-semibold text-slate-800 capitalize truncate">
                            {currentView === 'assistant' ? 'Asistente Inteligente' : currentView}
                        </h2>
                    </div>
                     <div className="relative flex items-center gap-2 md:gap-4">
                        <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
                        <button onClick={handleToggleNotifications} className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-sky-600 transition-colors">
                            <BellIcon className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white shadow-sm"></span>
                            )}
                        </button>
                        {showNotifications && <Notifications notifications={notifications} onClose={() => setShowNotifications(false)} onClearAll={onClearNotifications}/>}
                        <button onClick={onLogout} title="Cerrar Sesión" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium">
                           <LogoutIcon className="w-5 h-5"/>
                           <span className="hidden sm:inline">Salir</span>
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth w-full">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
