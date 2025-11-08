import React, { useState } from 'react';
import type { AuthenticatedUser } from '../types';
import { MOCK_USERS, MOCK_STUDENTS } from '../services/mockData';
import RegisterScreen from './RegisterScreen';


interface LoginScreenProps {
    onLogin: (user: AuthenticatedUser) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    // In a real app, this logic would be in a service that calls a backend API.
    const handleLoginAttempt = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // In a real app, passwords would be hashed and stored securely.
        // For this demo, we check if a user exists with the given credentials.
        const user = MOCK_USERS.find(u => u.username === username);

        // We're not checking passwords here for simplicity since they aren't stored.
        // A real app MUST check hashed passwords.
        if (user) {
            onLogin(user);
        } else {
            setError('Usuario o contraseña incorrectos.');
        }
    };
    
    if (isRegistering) {
        return (
            <RegisterScreen
                students={MOCK_STUDENTS}
                onRegisterSuccess={() => {
                    setIsRegistering(false);
                    alert('¡Registro exitoso! Ahora puedes iniciar sesión con tus nuevas credenciales.');
                }}
                onBackToLogin={() => setIsRegistering(false)}
            />
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-sky-600">PIAR.ai</h1>
                    <p className="mt-2 text-slate-500">Bienvenido al Asistente de Inclusión Educativa</p>
                </div>

                <form onSubmit={handleLoginAttempt} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700">Usuario</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        />
                    </div>
                    <div>
                         <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        />
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                        >
                            Ingresar
                        </button>
                    </div>
                </form>
                
                <div className="text-center text-sm">
                    <button onClick={() => setIsRegistering(true)} className="font-medium text-sky-600 hover:text-sky-500">
                        ¿No tienes cuenta? Regístrate aquí
                    </button>
                </div>


                 <div className="text-xs text-slate-400 pt-4 border-t border-slate-200">
                    <p className="font-semibold text-center text-slate-500 mb-2">Usuarios de Demostración:</p>
                    <ul className="space-y-1">
                        <li><span className="font-bold">Docente:</span> u: <kbd>amorales</kbd> / p: <kbd>password123</kbd></li>
                        <li><span className="font-bold">Directivo:</span> u: <kbd>director</kbd> / p: <kbd>password123</kbd></li>
                        <li><span className="font-bold">Familia:</span> u: <kbd>familia.valderrama</kbd> / p: <kbd>password123</kbd></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;