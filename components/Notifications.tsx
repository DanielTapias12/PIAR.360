
import React from 'react';
import { MOCK_NOTIFICATIONS } from '../services/mockData';

interface NotificationsProps {
    onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onClose }) => {
    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-10">
            <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">Notificaciones</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {MOCK_NOTIFICATIONS.map(notification => (
                    <div key={notification.id} className="p-4 hover:bg-slate-50 relative">
                        {!notification.read && (
                            <span className="absolute top-4 right-4 w-2 h-2 bg-sky-500 rounded-full"></span>
                        )}
                        <p className="font-semibold text-sm text-slate-700">{notification.title}</p>
                        <p className="text-sm text-slate-500">{notification.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{notification.timestamp}</p>
                    </div>
                ))}
            </div>
             <div className="p-2 border-t border-slate-200 text-center">
                <button className="text-sm font-medium text-sky-600 hover:underline">
                    Ver todas
                </button>
            </div>
        </div>
    );
};

export default Notifications;
