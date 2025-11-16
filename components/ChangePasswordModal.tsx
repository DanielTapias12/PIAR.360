import React, { useState } from 'react';
import type { AuthenticatedUser } from '../types';
import { XMarkIcon, ShieldCheckIcon } from './icons/Icons';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (newUsername: string, newPassword?: string) => void;
    isInitialSetup: boolean;
    currentUser: AuthenticatedUser;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onUpdate, isInitialSetup, currentUser }) => {
    const [username, setUsername] = useState(currentUser.username);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (!username.trim() || (isInitialSetup && !password.trim())) {
            setError('El nombre de usuario y la nueva contraseña son obligatorios.');
            return;
        }
        if (password && password.length < 6) {
             setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        onUpdate(username, password || undefined);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4 transform transition-all">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">
                        {isInitialSetup ? 'Configura tu Cuenta' : 'Actualizar Credenciales'}
                    </h2>
                    {!isInitialSetup && (
                        <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
                
                {isInitialSetup && (
                    <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 rounded-r-lg mb-4" role="alert">
                         <div className="flex items-center">
                            <ShieldCheckIcon className="w-6 h-6 mr-3"/>
                            <div>
                                <p className="font-bold">¡Bienvenido/a!</p>
                                <p className="text-sm">Por seguridad, por favor actualiza tus credenciales para continuar.</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="update-username" className="block text-sm font-medium text-slate-700">Nombre de Usuario</label>
                        <input id="update-username" type="text" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-50 border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="update-password" className="block text-sm font-medium text-slate-700">{isInitialSetup ? 'Nueva Contraseña' : 'Nueva Contraseña (opcional)'}</label>
                        <input id="update-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="update-confirm-password" className="block text-sm font-medium text-slate-700">Confirmar Nueva Contraseña</label>
                        <input id="update-confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm" />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="mt-6 flex justify-end gap-3">
                         {!isInitialSetup && (
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                                Cancelar
                            </button>
                         )}
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">
                            {isInitialSetup ? 'Guardar y Continuar' : 'Actualizar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;