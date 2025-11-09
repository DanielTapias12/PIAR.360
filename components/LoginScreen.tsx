
import React, { useState } from 'react';
import type { AuthenticatedUser } from '../types';

interface LoginScreenProps {
    onLogin: (user: AuthenticatedUser) => void;
    users: AuthenticatedUser[];
}

const PiarLogoIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="26" fill="currentColor"/>
        <path d="M26 34C30.4183 34 34 30.4183 34 26C34 21.5817 30.4183 18 26 18C21.5817 18 18 21.5817 18 26C18 30.4183 21.5817 34 26 34ZM23 32H29V37H23V32Z" fill="white"/>
    </svg>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, users }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [view, setView] = useState<'login' | 'forgot' | 'success'>('login');

    const handleLoginAttempt = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (user && user.password === password) {
            onLogin(user);
        } else {
             setError('Usuario o contraseña incorrectos.');
        }
    };

    const handlePasswordRecovery = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would have logic to send an email.
        // For this demo, we'll just show a success message.
        setView('success');
    };

    const renderLoginView = () => (
        <>
            <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center gap-x-4">
                    <PiarLogoIcon className="h-12 w-12 text-blue-500"/>
                    <span className="text-3xl font-extrabold tracking-tight text-slate-800">PIAR360</span>
                </div>
                <h2 className="text-center text-3xl font-bold tracking-tight text-slate-800 pt-4">
                    Iniciar sesión
                </h2>
            </div>
            <form onSubmit={handleLoginAttempt} className="space-y-6">
                <div>
                    <label htmlFor="username-input" className="block text-sm font-medium text-slate-700 mb-1.5">Usuario</label>
                    <input id="username-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 sm:text-sm transition text-slate-900" autoComplete="username" />
                </div>
                <div>
                    <label htmlFor="password-input" className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
                    <input id="password-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 sm:text-sm transition text-slate-900" autoComplete="current-password" />
                </div>
                {error && <p className="text-sm text-red-600 text-center !mt-4">{error}</p>}
                <div className="flex items-center justify-end pt-1">
                    <button type="button" onClick={() => setView('forgot')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">¿Olvidaste tu contraseña?</button>
                </div>
                <div className="pt-2">
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">Iniciar sesión</button>
                </div>
            </form>
        </>
    );

    const renderForgotView = () => (
        <>
             <div className="flex flex-col items-center space-y-2">
                <h2 className="text-center text-2xl font-bold tracking-tight text-slate-800">Recuperar Contraseña</h2>
                <p className="text-center text-sm text-slate-500">Ingresa tu correo para recibir tu contraseña.</p>
            </div>
            <form onSubmit={handlePasswordRecovery} className="space-y-6">
                <div>
                    <label htmlFor="email-input" className="block text-sm font-medium text-slate-700 mb-1.5">Correo Electrónico</label>
                    <input id="email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 sm:text-sm transition text-slate-900" autoComplete="email" />
                </div>
                <div className="pt-2">
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">Enviar</button>
                </div>
                 <div>
                    <button type="button" onClick={() => { setView('login'); setError(''); }} className="w-full text-center text-sm font-medium text-slate-600 hover:text-slate-800">Volver a Iniciar Sesión</button>
                </div>
            </form>
        </>
    );

     const renderSuccessView = () => (
        <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Revisa tu Correo</h2>
            <p className="text-sm text-slate-600">
                Si existe una cuenta asociada a <span className="font-medium">{email}</span>, hemos enviado la contraseña.
            </p>
            <button
                onClick={() => { setView('login'); setEmail(''); }}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
                Volver a Iniciar Sesión
            </button>
        </div>
    );
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-cyan-400 p-4">
            <div className="w-full max-w-sm p-10 space-y-8 bg-white rounded-3xl shadow-xl">
                {view === 'login' && renderLoginView()}
                {view === 'forgot' && renderForgotView()}
                {view === 'success' && renderSuccessView()}
            </div>
        </div>
    );
};

export default LoginScreen;