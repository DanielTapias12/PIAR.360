import React, { useState } from 'react';
import type { AuthenticatedUser, UserRole } from '../types';
import RegisterModal from './RegisterModal';
import type { AuthError } from '@supabase/supabase-js';

interface LoginScreenProps {
    onLogin: (username: string, password: string) => Promise<{ error: AuthError | null }>;
    onPublicSignUp: (data: { name: string; username: string; email: string; password: string; role: UserRole }) => Promise<{ error: AuthError | null }>;
}

const PiarLogoIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="26" fill="currentColor"/>
        <path d="M26 34C30.4183 34 34 30.4183 34 26C34 21.5817 30.4183 18 26 18C21.5817 18 18 21.5817 18 26C18 30.4183 21.5817 34 26 34ZM23 32H29V37H23V32Z" fill="white"/>
    </svg>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onPublicSignUp }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    
    const handleLoginAttempt = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        const { error: loginError } = await onLogin(username, password);

        if (loginError) {
            setError(loginError.message || 'Usuario o contraseña incorrectos.');
        }
        
        setIsLoading(false);
    };
    
    return (
        <>
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-cyan-400 p-4">
                <div className="w-full max-w-sm p-10 space-y-8 bg-white rounded-3xl shadow-xl">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="flex items-center justify-center gap-x-4">
                            <PiarLogoIcon className="h-12 w-12 text-blue-500"/>
                            <span className="text-3xl font-extrabold tracking-tight text-gray-900">PIAR360</span>
                        </div>
                        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 pt-4">
                            Iniciar sesión
                        </h2>
                    </div>
                    <form onSubmit={handleLoginAttempt} className="space-y-6">
                        <div>
                            <label htmlFor="username-input" className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de Usuario</label>
                            <input id="username-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 sm:text-sm transition text-gray-900" autoComplete="username" />
                        </div>
                        <div>
                            <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
                            <input id="password-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 sm:text-sm transition text-gray-900" autoComplete="current-password" />
                        </div>
                        {error && <p className="text-sm text-red-600 text-center !mt-4">{error}</p>}
                        <div className="pt-2">
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-400">
                                {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
                            </button>
                        </div>
                    </form>
                     <div className="text-center text-sm text-slate-600 !mt-8">
                        ¿No tienes una cuenta?{' '}
                        <button type="button" onClick={() => setShowRegister(true)} className="font-medium text-indigo-600 hover:text-indigo-500">
                           Regístrate aquí
                        </button>
                    </div>
                </div>
            </div>
            <RegisterModal isOpen={showRegister} onClose={() => setShowRegister(false)} onRegister={onPublicSignUp} />
        </>
    );
};

export default LoginScreen;