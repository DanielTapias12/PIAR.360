import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import SuccessModal from './SuccessModal';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from './icons/Icons';

interface RegisterScreenProps {
    onSwitchToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<'Docente' | 'Familia' | 'Director'>('Docente');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        setLoading(true);
        setError(null);
        setSuccessMessage('');

        try {
            // FIX: Renamed destructured 'error' to 'signUpError' to avoid shadowing the component's state variable.
            const { data, error: signUpError } = await supabase.auth.signUp({
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

            if (signUpError) throw signUpError;
            
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                 setSuccessMessage("Ya existe un usuario con este correo electrónico. Por favor, inicia sesión o revisa tu bandeja de entrada para confirmar la cuenta.");
            } else {
                 setSuccessMessage("¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta y poder iniciar sesión.");
            }
            setShowSuccessModal(true);
           
        // FIX: Renamed 'error' in catch block to 'e' to avoid shadowing and fix usage.
        } catch (e: any) {
            setError(e.error_description || e.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleModalClose = () => {
        setShowSuccessModal(false);
        onSwitchToLogin();
    };


    return (
        <>
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleModalClose}
                title="Registro Completado"
                message={successMessage}
            />
            <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
                        <div className="relative mb-8 text-center">
                             <button
                                type="button"
                                onClick={onSwitchToLogin}
                                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                                aria-label="Volver a Iniciar Sesión"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-4xl font-bold">
                                    <span className="text-slate-800">PIAR</span>
                                    <span className="text-sky-500">.360</span>
                                </h1>
                                <h2 className="mt-2 text-lg text-slate-600">
                                    Crea una nueva cuenta
                                </h2>
                            </div>
                        </div>
                        
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
                                <div className="mt-1 relative">
                                    <input 
                                        id="password" 
                                        type={showPassword ? 'text' : 'password'}
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required 
                                        className="w-full appearance-none block px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm pr-10" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5 text-slate-500" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5 text-slate-500" />
                                        )}
                                    </button>
                                </div>
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

                            <div>
                                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400">
                                    {loading ? 'Registrando...' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                        <div className="mt-6 text-center">
                            <button type="button" onClick={onSwitchToLogin} className="font-medium text-sky-600 hover:text-sky-500 text-sm">
                                ¿Ya tienes una cuenta? Inicia sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterScreen;