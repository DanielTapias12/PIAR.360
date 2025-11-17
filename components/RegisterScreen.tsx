
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface RegisterScreenProps {
    onSwitchToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'Docente' | 'Familia' | 'Director'>('Docente');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        name: name,
                        username: username,
                        role: role
                    }
                }
            });

            if (error) throw error;
            
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                 setSuccess("Ya existe un usuario con este correo electrónico. Por favor, inicia sesión.");
            } else {
                 setSuccess("¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta.");
            }
           
        } catch (error: any) {
            setError(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-4xl font-bold">
                    <span className="text-slate-800">PIAR</span>
                    <span className="text-sky-500">.360</span>
                </h1>
                <h2 className="mt-2 text-center text-lg text-slate-600">
                    Crea una nueva cuenta
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleRegister}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full appearance-none block px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700">Nombre de Usuario</label>
                            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="mt-1 w-full appearance-none block px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full appearance-none block px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full appearance-none block px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700">Rol</label>
                            <select id="role" value={role} onChange={(e) => setRole(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md">
                                <option>Docente</option>
                                <option>Familia</option>
                                <option>Director</option>
                            </select>
                        </div>

                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                        {success && <p className="text-sm text-green-600 text-center">{success}</p>}

                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400">
                                {loading ? 'Registrando...' : 'Registrar'}
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center">
                        <button onClick={onSwitchToLogin} className="font-medium text-sky-600 hover:text-sky-500 text-sm">
                            ¿Ya tienes una cuenta? Inicia sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterScreen;
