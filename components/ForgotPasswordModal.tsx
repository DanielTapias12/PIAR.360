import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { XMarkIcon, CheckCircleIcon } from './icons/Icons';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    if (!isOpen) return null;

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin, // Redirects user back to the app after password reset
        });
        
        if (error) {
            setError('No se pudo enviar el enlace. Verifica que el correo electrónico sea correcto.');
            console.error('Password reset error:', error);
        } else {
            setSuccessMessage(`Se ha enviado un enlace de recuperación a ${email}. Por favor, revisa tu bandeja de entrada.`);
        }
        
        setIsLoading(false);
    };
    
    const handleClose = () => {
        // Reset state on close
        setEmail('');
        setError('');
        setSuccessMessage('');
        setIsLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4 transform transition-all">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Recuperar Contraseña</h2>
                    <button onClick={handleClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {successMessage ? (
                    <div className="space-y-4">
                         <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-r-lg" role="alert">
                            <div className="flex items-center">
                                <CheckCircleIcon className="w-6 h-6 mr-3"/>
                                <div>
                                    <p className="font-bold">¡Enlace enviado!</p>
                                    <p className="text-sm">{successMessage}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">
                                Cerrar
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleResetRequest} className="space-y-4">
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