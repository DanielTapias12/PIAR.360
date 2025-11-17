
import React, { useState, useEffect, useRef } from 'react';
import type { AuthenticatedUser } from '../types';
import { CameraIcon, CheckCircleIcon } from './icons/Icons';

interface ProfileSettingsProps {
    user: AuthenticatedUser;
    onUpdateProfile: (updatedData: Partial<AuthenticatedUser>, newAvatarFile?: File) => Promise<void>;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdateProfile }) => {
    const [formData, setFormData] = useState<Partial<AuthenticatedUser>>({});
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            const { id, email, ...editableData } = user;
            setFormData(editableData);
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onUpdateProfile(formData, avatarFile ?? undefined);
        setIsSaving(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const initialFormData = { ...user };
    delete initialFormData.id;
    delete initialFormData.email;

    const isDirty = JSON.stringify(formData) !== JSON.stringify(initialFormData) || avatarFile !== null;

    if (!user) {
        return null;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Configuración de Perfil</h1>
                <p className="text-slate-500 mt-1">Revisa y actualiza tu información personal.</p>
            </header>
            
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row items-start gap-8">
                    {/* Avatar Section */}
                    <div className="w-full md:w-1/3 flex flex-col items-center">
                        <div className="relative w-32 h-32">
                            <img 
                                src={avatarPreview || formData.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || '?')}&background=0ea5e9&color=fff&size=128`} 
                                alt="Avatar" 
                                className="w-32 h-32 rounded-full object-cover bg-slate-200"
                            />
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2 bg-slate-700 text-white rounded-full hover:bg-slate-800 transition-colors"
                                aria-label="Cambiar foto de perfil"
                            >
                                <CameraIcon className="w-5 h-5" />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleAvatarChange} 
                                className="hidden" 
                                accept="image/png, image/jpeg, image/webp"
                            />
                        </div>
                        <p className="text-sm text-slate-500 mt-2 text-center">Sube tu foto de perfil.<br/>(PNG, JPG, WEBP)</p>
                    </div>

                    {/* Form Fields Section */}
                    <div className="w-full md:w-2/3 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                                <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleInputChange} className="mt-1 input-field" />
                            </div>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-slate-700">Nombre de Usuario</label>
                                <input type="text" name="username" id="username" value={formData.username || ''} onChange={handleInputChange} className="mt-1 input-field" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email-display" className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
                            <input type="email" id="email-display" value={user.email} disabled className="mt-1 input-field bg-slate-100 cursor-not-allowed" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Teléfono</label>
                                <input type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleInputChange} className="mt-1 input-field" />
                            </div>
                             <div>
                                <label htmlFor="address" className="block text-sm font-medium text-slate-700">Dirección</label>
                                <input type="text" name="address" id="address" value={formData.address || ''} onChange={handleInputChange} className="mt-1 input-field" />
                            </div>
                        </div>
                        
                        {/* Role-specific fields */}
                        {user.role === 'Docente' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="specialization" className="block text-sm font-medium text-slate-700">Especialización</label>
                                    <input type="text" name="specialization" id="specialization" value={formData.specialization || ''} onChange={handleInputChange} className="mt-1 input-field" />
                                </div>
                                <div>
                                    <label htmlFor="experience" className="block text-sm font-medium text-slate-700">Experiencia</label>
                                    <input type="text" name="experience" id="experience" value={formData.experience || ''} onChange={handleInputChange} className="mt-1 input-field" />
                                </div>
                            </div>
                        )}
                        {user.role === 'Familia' && (
                             <div>
                                <label htmlFor="relationship" className="block text-sm font-medium text-slate-700">Parentesco con el estudiante</label>
                                <input type="text" name="relationship" id="relationship" value={formData.relationship || ''} onChange={handleInputChange} className="mt-1 input-field" placeholder="Ej: Madre, Padre, Acudiente" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end items-center gap-4">
                    {showSuccess && (
                        <div className="flex items-center text-sm text-green-600 animate-fade-in">
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                            <span>¡Perfil guardado con éxito!</span>
                        </div>
                    )}
                    <button type="submit" disabled={!isDirty || isSaving} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
            
            <style>{`
                .input-field {
                    display: block;
                    width: 100%;
                    border-radius: 0.375rem;
                    border: 1px solid #cbd5e1;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    background-color: #ffffff;
                    color: #1e293b;
                    transition: box-shadow 0.15s ease-in-out, border-color 0.15s ease-in-out;
                }
                .input-field:focus {
                    outline: 2px solid transparent;
                    outline-offset: 2px;
                    border-color: #0ea5e9;
                    box-shadow: 0 0 0 2px #38bdf8;
                }
            `}</style>
        </div>
    );
};

export default ProfileSettings;
