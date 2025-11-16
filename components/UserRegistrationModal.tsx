import React, { useState } from 'react';
import type { UserRole } from '../types';
import { XMarkIcon, CheckCircleIcon } from './icons/Icons';

interface UserRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: (data: { name: string; email: string; role: UserRole }) => void;
    newCredentials: { username: string; password: string } | null;
}

const CredentialDisplay = ({ label, value }: { label: string; value: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-600">{label}</label>
            <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex-grow items-stretch focus-within:z-10">
                    <input
                        type="text"
                        readOnly
                        value={value}
                        className="block w-full rounded-none rounded-l-md border-slate-300 bg-slate-100 text-slate-700 sm:text-sm"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
            </div>
        </div>
    );
};

const UserRegistrationModal: React.FC<UserRegistrationModalProps> = ({ isOpen, onClose, onRegister, newCredentials }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>('Docente');
    const [error, setError] = useState('');
    
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim() || !email.trim()) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        onRegister({ name, email, role });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg m-4 transform transition-all">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">
                        {newCredentials ? 'Usuario Registrado con Éxito' : 'Registrar Nuevo Usuario'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {newCredentials ? (
                    <div className="space-y-4">
                         <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-r-lg" role="alert">
                            <div className="flex items-center">
                                <CheckCircleIcon className="w-6 h-6 mr-3"/>
                                <div>
                                    <p className="font-bold">¡Usuario creado!</p>
                                    <p className="text-sm">Comparte estas credenciales temporales con el nuevo usuario. Deberá cambiarlas en su primer inicio de sesión.</p>
                                </div>
                            </div>
                        </div>
                        <CredentialDisplay label="Nombre de Usuario" value={newCredentials.username} />
                        <CredentialDisplay label="Contraseña Temporal" value={newCredentials.password} />
                         <div className="mt-6 flex justify-end">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">
                                Hecho
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="user-name" className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                            <input id="user-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-50 border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="user-email" className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
                                <input id="user-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-50 border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="user-role" className="block text-sm font-medium text-slate-700">Rol</label>
                                <select id="user-role" value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1 block w-full px-3 py-2 border-slate-300 bg-slate-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm">
                                    <option value="Docente">Docente</option>
                                    <option value="Familia">Familia</option>
                                    <option value="Director">Director</option>
                                </select>
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">Registrar Usuario</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UserRegistrationModal;