



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
    const activeClasses = "bg-sky-100 text-sky-700";
    const inactiveClasses = "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
    const disabledClasses = "opacity-50 cursor-not-allowed";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive ? activeClasses : inactiveClasses} ${disabled ? disabledClasses : ''}`}
        >
            <Icon className="w-5 h-5 mr-3" />
            <span>{label}</span>
        </button>
    );
};


const Layout: React.FC<LayoutProps> = ({ children, user, setView, currentView, notifications, setNotifications, onLogout, onClearNotifications }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    
    const roleName: { [key in UserRole]: string } = {
        'Docente': 'Docente',
        'Familia': 'Familia/Acudiente',
        'Director': 'Director',
    };
    
    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    const handleToggleNotifications = () => {
        setShowNotifications(s => !s);
        if (!showNotifications) {
            // Mark all as read when opening
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    if (!user) return null; // Should not happen if App component logic is correct

    const renderNavItems = () => {
        const commonItems = (
             <div className="pt-2 mt-2 border-t border-slate-200">
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
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h1 className="text-2xl font-bold">
                        <span className="text-slate-800">PIAR</span>
                        <span className="text-sky-500">.360</span>
                    </h1>
                    <p className="text-xs text-slate-500 -mt-1">Asistente de Inclusión</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {renderNavItems()}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-slate-200 flex justify-between items-center px-8 py-3">
                    <div className="flex items-center">
                        {user.photo_url ? (
                            <img src={user.photo_url} alt={user.name} className="w-10 h-10 rounded-full object-cover bg-slate-200" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-lg">
                               {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="ml-3">
                            <p className="font-semibold text-slate-800">
                                {user.name}
                            </p>
                            <p className="text-xs text-slate-500">{roleName[user.role]}</p>
                        </div>
                    </div>
                     <div className="relative flex items-center gap-2">
                        <button onClick={handleToggleNotifications} className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                            <BellIcon className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
                            )}
                        </button>
                        {showNotifications && <Notifications notifications={notifications} onClose={() => setShowNotifications(false)} onClearAll={onClearNotifications}/>}
                        <button onClick={onLogout} title="Cerrar Sesión" className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                           <LogoutIcon className="w-6 h-6"/>
                        </button>
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