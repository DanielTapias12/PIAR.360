import React, { useState } from 'react';
import type { AuthenticatedUser, Student, UserRole } from '../types';
import { MOCK_USERS } from '../services/mockData';

interface RegisterScreenProps {
    students: Student[];
    onRegisterSuccess: () => void;
    onBackToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ students, onRegisterSuccess, onBackToLogin }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('Docente');
    const [studentId, setStudentId] = useState<string>(students.length > 0 ? students[0].id : '');
    const [error, setError] = useState('');

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !username || !password || !role) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        
        if (role === 'Familia' && !studentId) {
             setError('Debe seleccionar un estudiante para el rol de Familia.');
            return;
        }

        const userExists = MOCK_USERS.some(u => u.username === username);
        if (userExists) {
            setError('El nombre de usuario ya existe. Por favor, elija otro.');
            return;
        }

        const newUser: AuthenticatedUser = {
            name,
            username,
            role,
            ...(role === 'Familia' && { studentId }),
        };

        // In a real app, this would be an API call to the backend.
        MOCK_USERS.push(newUser);
        
        onRegisterSuccess();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-sky-600">Crear Cuenta</h1>
                    <p className="mt-2 text-slate-500">Únete a la plataforma de inclusión educativa.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                        <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700">Nombre de Usuario</label>
                        <input id="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    </div>
                    <div>
                         <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
                        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700">Rol</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                            <option value="Docente">Docente</option>
                            <option value="Directivo">Directivo</option>
                            <option value="Familia">Familia</option>
                        </select>
                    </div>
                    
                    {role === 'Familia' && (
                         <div className="animate-fade-in">
                            <label htmlFor="student" className="block text-sm font-medium text-slate-700">Estudiante Asociado</label>
                            <select id="student" value={studentId} onChange={(e) => setStudentId(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    )}


                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <div>
                        <button type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors">
                            Registrarse
                        </button>
                    </div>
                </form>
                 <div className="text-center text-sm">
                    <button onClick={onBackToLogin} className="font-medium text-sky-600 hover:text-sky-500">
                        ¿Ya tienes cuenta? Inicia sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterScreen;