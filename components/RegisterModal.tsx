import React, { useState } from 'react';
import type { UserRole } from '../types';
import { XMarkIcon, CheckCircleIcon } from './icons/Icons';
import type { AuthError } from '@supabase/supabase-js';


interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: (data: { name: string; username: string; email: string; password: string; role: UserRole }) => Promise<{ error: AuthError | null }>;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onRegister }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<UserRole>('Docente');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        // Reset state
        setName('');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setRole('Docente');
        setError('');
        setIsLoading(false);
        setIsSuccess(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        
        setIsLoading(true);
        const { error: signUpError } = await onRegister({ name, username, email, password, role });
        setIsLoading(false);

        if (signUpError) {
            if (signUpError.message.includes('unique constraint')) {
                 setError('El nombre de usuario o el correo electrónico ya están en uso.');
            } else if (signUpError.message.includes('already registered')) {
                 setError('Un usuario con este correo electrónico ya está registrado.');
            }
            else {
                setError(signUpError.message || 'Ocurrió un error durante el registro.');
            }
        } else {
            setIsSuccess(true);
        }
    };
    
    if (isSuccess) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-all text-center">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900">
                        ¡Cuenta Creada con Éxito!
                    </h2>
                    <p className="text-slate-600 mt-2">Tu sesión ha sido iniciada.</p>
                    <button 
                        onClick={handleClose}
                        className="mt-6 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700"
                    >
                        Continuar al Dashboard
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg m-4 transform transition-all">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        Crear una Cuenta
                    </h2>
                    <button onClick={handleClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                        <input id="reg-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-50 border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm text-gray-900" />
                    </div>
                     <div>
                        <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
                        <input id="reg-username" type="text" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-50 border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm text-gray-900" />
                    </div>
                    
                    <div>
                        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700">Correo Electrónico (Contacto)</label>
                        <input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-50 border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm text-gray-900" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-50 border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm text-gray-900" />
                        </div>
                         <div>
                            <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                            <input id="reg-confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-50 border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm text-gray-900" />
                        </div>
                    </div>

                     <div>
                        <label htmlFor="reg-role" className="block text-sm font-medium text-gray-700">Soy un...</label>
                        <select id="reg-role" value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1 block w-full px-3 py-2 border-slate-300 bg-slate-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm text-gray-900">
                            <option value="Docente">Docente</option>
                            <option value="Familia">Familia / Acudiente</option>
                            <option value="Director">Director</option>
                        </select>
                    </div>
                    
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterModal;