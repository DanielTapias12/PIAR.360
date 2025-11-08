import React, { useState } from 'react';
import type { AuthenticatedUser } from '../types';
import { HomeIcon, UsersIcon, LogoutIcon, BellIcon, ChatBubbleOvalLeftEllipsisIcon, LightbulbIcon } from './icons/Icons';
import Notifications from './Notifications';

interface LayoutProps {
    children: React.ReactNode;
    user: AuthenticatedUser;
    onLogout: () => void;
    setView: (view: 'dashboard' | 'students' | 'assistant' | 'strategies') => void;
    currentView: 'dashboard' | 'students' | 'assistant' | 'strategies';
}

const NavItem = ({ label, icon, isActive, onClick }: { label: string, icon: React.FC<any>, isActive: boolean, onClick: () => void }) => {
    const Icon = icon;
    const activeClasses = "bg-sky-100 text-sky-700";
    const inactiveClasses = "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive ? activeClasses : inactiveClasses}`}
        >
            <Icon className="w-5 h-5 mr-3" />
            <span>{label}</span>
        </button>
    );
};


const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, setView, currentView }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    
    const roleName = {
        'Docente': 'Docente',
        'Directivo': 'Director/a',
        'Familia': 'Familia',
    };
    
    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h1 className="text-xl font-bold text-sky-600">PIAR.ai</h1>
                    <p className="text-xs text-slate-500">Asistente de Inclusión</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {user.role === 'Familia' ? (
                        <NavItem label="Resumen" icon={HomeIcon} isActive={currentView === 'dashboard'} onClick={() => setView('dashboard')} />
                    ) : (
                        <>
                            <NavItem label="Dashboard" icon={HomeIcon} isActive={currentView === 'dashboard'} onClick={() => setView('dashboard')} />
                            <NavItem label="Estudiantes" icon={UsersIcon} isActive={currentView === 'students'} onClick={() => setView('students')} />
                            <NavItem label="Estrategias" icon={LightbulbIcon} isActive={currentView === 'strategies'} onClick={() => setView('strategies')} />
                        </>
                    )}
                    <NavItem label="Asistente IA" icon={ChatBubbleOvalLeftEllipsisIcon} isActive={currentView === 'assistant'} onClick={() => setView('assistant')} />
                </nav>
                <div className="p-4 border-t border-slate-200">
                    <button onClick={onLogout} className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                        <LogoutIcon className="w-5 h-5 mr-3" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-slate-200 flex justify-between items-center px-8 py-3">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-lg">
                           {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                            <p className="font-semibold text-slate-800">
                                {user.name}
                            </p>
                            <p className="text-xs text-slate-500">{roleName[user.role]}</p>
                        </div>
                    </div>
                     <div className="relative">
                        <button onClick={() => setShowNotifications(s => !s)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                            <BellIcon className="w-6 h-6" />
                        </button>
                        {showNotifications && <Notifications onClose={() => setShowNotifications(false)}/>}
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
