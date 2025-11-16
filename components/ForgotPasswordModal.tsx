import React, { useState } from 'react';
import { XMarkIcon, CheckCircleIcon } from './icons/Icons';
import type { AuthError } from '@supabase/supabase-js';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPasswordReset: (email: string) => Promise<{ error: AuthError | null }>;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, onPasswordReset }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        setEmail('');
        setError('');
        setIsLoading(false);
        setIsSuccess(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const { error: resetError } = await onPasswordReset(email);
        
        setIsLoading(false);
        
        if (resetError) {
            setError('Ocurrió un error. Por favor, inténtalo de nuevo.');
        } else {
            setIsSuccess(true);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4 transform transition-all">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">
                        Recuperar Contraseña
                    </h2>
                    <button onClick={handleClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {isSuccess ? (
                    <div className="text-center py-4">
                        <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="text-slate-600">Si existe una cuenta asociada a este correo, se ha enviado un enlace para restablecer tu contraseña.</p>
                        <button onClick={handleClose} className="mt-6 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700">
                            Entendido
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-sm text-slate-600">
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </p>
                        <div>
                            <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
                            <input
                                id="reset-email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-slate-50 border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                                Cancelar
                            </button>
                            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400">
                                {isLoading ? 'Enviando...' : 'Enviar Enlace'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;