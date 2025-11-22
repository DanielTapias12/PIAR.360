import React, { useState, useMemo } from 'react';
import { HomeIcon, UsersIcon, BellIcon, ChatBubbleOvalLeftEllipsisIcon, LightbulbIcon, GraduationCapIcon, UserGroupIcon, LogoutIcon, Cog6ToothIcon } from './icons/Icons';
import Notifications from './Notifications';
import type { AuthenticatedUser, Notification, UserRole } from '../types';

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
    // New Design: Dark sidebar with light text, active state is a soft gradient pill
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

    if (!user) return null;

    const renderNavItems = () => {
        const commonItems = (
             <div className="pt-4 mt-4 border-t border-slate-700/50">
                <NavItem label="Configuración" icon={Cog6ToothIcon} isActive={currentView === 'settings'} onClick={() => setView('settings')} />
            </div>
        );

        switch(user.role) {
            case 'Director':
                return (
                    <>
                        <NavItem label="Dashboard" icon={GraduationCapIcon} isActive={currentView === 'dashboard'} onClick={() => setView('dashboard')} />
                        <NavItem label="Estudiantes" icon={UsersIcon} isActive={currentView === 'students'} onClick={() => setView('students')} />
                        <NavItem label="Familias" icon={UserGroupIcon} isActive={currentView === 'families'} onClick={() => setView('families')} />
                        <NavItem label="Estrategias" icon={LightbulbIcon} isActive={currentView === 'strategies'} onClick={() => setView('strategies')} />
                        <NavItem label="Asistente IA" icon={ChatBubbleOvalLeftEllipsisIcon} isActive={currentView === 'assistant'} onClick={() => setView('assistant')} />
                        {commonItems}
                    </>
                );
            case 'Familia':
                 return (
                    <>
                        <NavItem label="Panel Principal" icon={HomeIcon} isActive={currentView === 'dashboard'} onClick={() => setView('dashboard')} />
                        <NavItem label="Asesor IA" icon={ChatBubbleOvalLeftEllipsisIcon} isActive={currentView === 'assistant'} onClick={() => setView('assistant')} />
                        {commonItems}
                    </>
                 );
            case 'Docente':
            default:
                return (
                    <>
                        <NavItem label="Dashboard" icon={HomeIcon} isActive={currentView === 'dashboard'} onClick={() => setView('dashboard')} />
                        <NavItem label="Estudiantes" icon={UsersIcon} isActive={currentView === 'students'} onClick={() => setView('students')} />
                        <NavItem label="Familias" icon={UserGroupIcon} isActive={currentView === 'families'} onClick={() => setView('families')} />
                        <NavItem label="Estrategias" icon={LightbulbIcon} isActive={currentView === 'strategies'} onClick={() => setView('strategies')} />
                        <NavItem label="Asistente IA" icon={ChatBubbleOvalLeftEllipsisIcon} isActive={currentView === 'assistant'} onClick={() => setView('assistant')} />
                        {commonItems}
                    </>
                );
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar - Dark Theme */}
            <div className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
                <div className="px-8 py-8 flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-sky-500/30">
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
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {renderNavItems()}
                </nav>
                <div className="p-6 border-t border-slate-800">
                     <div className="flex items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        {user.photo_url ? (
                            <img src={user.photo_url} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-slate-600" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
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
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header - Glassmorphism */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-10 flex justify-between items-center px-8 py-4 shadow-sm">
                    <div>
                         <h2 className="text-lg font-semibold text-slate-800 capitalize">
                            {currentView === 'assistant' ? 'Asistente Inteligente' : currentView}
                         </h2>
                    </div>
                     <div className="relative flex items-center gap-4">
                        <div className="h-8 w-px bg-slate-200 mx-1"></div>
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
                <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;