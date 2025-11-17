

import React from 'react';
import type { Notification } from '../types';

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `Hace ${Math.floor(interval)} años`;
    interval = seconds / 2592000;
    if (interval > 1) return `Hace ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `Hace ${Math.floor(interval)} días`;
    interval = seconds / 3600;
    if (interval > 1) return `Hace ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `Hace ${Math.floor(interval)} minutos`;
    return 'Hace un momento';
};

interface NotificationsProps {
    notifications: Notification[];
    onClose: () => void;
    onClearAll: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onClose, onClearAll }) => {
    
    const handleClear = () => {
        onClearAll();
        onClose();
    };

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-10 top-full">
            <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">Notificaciones</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {notifications.length > 0 ? notifications.map(notification => (
                    <div key={notification.id} className={`p-4 hover:bg-slate-50 relative ${!notification.read ? 'bg-sky-50' : ''}`}>
                        {!notification.read && (
                            <span className="absolute top-4 right-4 w-2 h-2 bg-sky-500 rounded-full"></span>
                        )}
                        <p className="font-semibold text-sm text-slate-700">{notification.title}</p>
                        <p className="text-sm text-slate-500">{notification.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{timeAgo(notification.timestamp)}</p>
                    </div>
                )) : (
                    <p className="p-4 text-sm text-slate-500 text-center">No hay notificaciones.</p>
                )}
            </div>
             <div className="p-2 border-t border-slate-200 text-center">
                <button
                    onClick={handleClear}
                    disabled={notifications.length === 0}
                    className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline disabled:text-slate-400 disabled:no-underline"
                >
                    Limpiar historial
                </button>
            </div>
        </div>
    );
};

export default Notifications;