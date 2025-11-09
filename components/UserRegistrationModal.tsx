import React, { useState, useEffect, useMemo } from 'react';
import type { AuthenticatedUser, Student, UserRole } from '../types';
import { XMarkIcon, CheckCircleIcon } from './icons/Icons';

type SettableUserRole = 'Docente' | 'Familia' | 'Directivo';

interface UserRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: Student[];
    onRegister: (data: { 
        name: string; 
        role: SettableUserRole; 
        studentId?: string; 
        assignedGrade?: string; 
        email: string; 
        age: string; 
        address: string; 
        phone: string; 
        specialization?: string;
        experience?: string;
        relationship?: string;
        specificPosition?: string;
    }) => { username: string, password: string } | null;
    creatableRoles?: SettableUserRole[];
    userToEdit?: AuthenticatedUser | null;
    onUpdate?: (data: AuthenticatedUser) => void;
    currentUserRole?: UserRole;
}

const UserRegistrationModal: React.FC<UserRegistrationModalProps> = ({ 
    isOpen, 
    onClose, 
    students, 
    onRegister, 
    creatableRoles = ['Docente', 'Familia'],
    userToEdit,
    onUpdate,
    currentUserRole,
}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [age, setAge] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<SettableUserRole>(creatableRoles[0]);
    const [studentId, setStudentId] = useState<string>(students[0]?.id || '');
    const [assignedGrade, setAssignedGrade] = useState<string>('');
    const [specialization, setSpecialization] = useState('');
    const [experience, setExperience] = useState('');
    const [relationship, setRelationship] = useState('');
    const [specificPosition, setSpecificPosition] = useState('');
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState<{ username: string, password: string } | null>(null);

    const isEditMode = !!userToEdit;
    const availableGrades = useMemo(() => [...new Set(students.map(s => s.grade))].sort(), [students]);

    const resetForm = () => {
        setName(''); setEmail(''); setAge(''); setAddress(''); setPhone(''); setPassword('');
        setRole(creatableRoles[0]); setStudentId(students[0]?.id || '');
        setAssignedGrade(availableGrades.length > 0 ? availableGrades[0] : '');
        setSpecialization(''); setExperience(''); setRelationship(''); setSpecificPosition('');
        setError(''); setSuccessData(null);
    };

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                setName(userToEdit.name || '');
                setEmail(userToEdit.email || '');
                setAge(userToEdit.age || '');
                setAddress(userToEdit.address || '');
                setPhone(userToEdit.phone || '');
                setPassword(userToEdit.password || '');
                setRole(userToEdit.role as SettableUserRole);
                setStudentId(userToEdit.studentId || students[0]?.id || '');
                setSpecialization(userToEdit.specialization || '');
                setExperience(userToEdit.experience || '');
                setRelationship(userToEdit.relationship || '');
                setSpecificPosition(userToEdit.specificPosition || '');
                
                 const teacherGrade = availableGrades.find(grade => 
                    students.some(s => s.grade === grade && s.teacher === userToEdit.name)
                );
                setAssignedGrade(teacherGrade || (availableGrades.length > 0 ? availableGrades[0] : ''));

            } else {
                if (availableGrades.length > 0 && !assignedGrade) {
                    setAssignedGrade(availableGrades[0]);
                }
            }
        } else {
            setTimeout(resetForm, 300); // Reset after closing animation
        }
    }, [isOpen, userToEdit, students, availableGrades, creatableRoles]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email.trim() || !age.trim() || !address.trim() || !phone.trim()) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        
        if (isEditMode && userToEdit) {
            const updatedData: AuthenticatedUser = {
                ...userToEdit,
                name, email, age, address, phone, role,
                ...(password && { password }), // Only include password if it's not empty
                ...(role === 'Familia' && { studentId, relationship }),
                ...(role === 'Docente' && { specialization, experience }),
                ...(role === 'Directivo' && { specificPosition }),
            };
            onUpdate?.(updatedData);
            onClose();
        } else {
            if (role === 'Docente' && !assignedGrade) { setError('Debe seleccionar un grado para asignar al docente.'); return; }
            if (role === 'Familia' && !studentId) { setError('Debe seleccionar un estudiante para el rol de Familia.'); return; }
            try {
                const credentials = onRegister({
                    name, role, email, age, address, phone,
                    ...(role === 'Familia' && { studentId, relationship }),
                    ...(role === 'Docente' && { assignedGrade, specialization, experience }),
                    ...(role === 'Directivo' && { specificPosition }),
                });
                if (credentials) {
                    setSuccessData(credentials);
                } else {
                     setError('No se pudo registrar al usuario. El nombre de usuario puede que ya exista.');
                }
            } catch (e: any) {
                setError(e.message || 'Ocurrió un error inesperado.');
            }
        }
    };

    const startNewRegistration = () => {
        resetForm();
    };

    if (!isOpen) return null;

    const renderRoleSpecificFields = () => {
        switch (role) {
            case 'Docente':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        <div>
                            <label htmlFor="reg-specialization" className="block text-sm font-medium text-slate-700">Especialidad</label>
                            <input id="reg-specialization" type="text" value={specialization} onChange={e => setSpecialization(e.target.value)} className="mt-1 block w-full input-style" placeholder="Ej: Pedagogía Inclusiva"/>
                        </div>
                        <div>
                            <label htmlFor="reg-experience" className="block text-sm font-medium text-slate-700">Años de Experiencia</label>
                            <input id="reg-experience" type="text" value={experience} onChange={e => setExperience(e.target.value)} className="mt-1 block w-full input-style" placeholder="Ej: 5 años"/>
                        </div>
                    </div>
                );
            case 'Familia':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        <div>
                            <label htmlFor="reg-student" className="block text-sm font-medium text-slate-700">Estudiante Asociado</label>
                            {students.length > 0 ? (
                                <select id="reg-student" value={studentId} onChange={e => setStudentId(e.target.value)} className="mt-1 block w-full select-style">
                                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            ) : (
                                <p className="text-xs text-slate-500 mt-1">No hay estudiantes registrados.</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="reg-relationship" className="block text-sm font-medium text-slate-700">Relación</label>
                            <input id="reg-relationship" type="text" value={relationship} onChange={e => setRelationship(e.target.value)} className="mt-1 block w-full input-style" placeholder="Ej: Madre, Padre, Acudiente"/>
                        </div>
                    </div>
                );
            case 'Directivo':
                return (
                     <div className="animate-fade-in">
                        <label htmlFor="reg-specific-position" className="block text-sm font-medium text-slate-700">Cargo Específico</label>
                        <input id="reg-specific-position" type="text" value={specificPosition} onChange={e => setSpecificPosition(e.target.value)} className="mt-1 block w-full input-style" placeholder="Ej: Rector, Coordinador Académico"/>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in" aria-modal="true" role="dialog">
            <style>{`.input-style { all: unset; box-sizing: border-box; display: block; width: 100%; margin-top: 0.25rem; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); } .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: #38bdf8; box-shadow: 0 0 0 2px var(--tw-ring-color); border-color: #38bdf8; } .select-style { all: unset; box-sizing: border-box; display: block; width: 100%; margin-top: 0.25rem; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; background-color: white; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); } .select-style:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: #38bdf8; box-shadow: 0 0 0 2px var(--tw-ring-color); border-color: #38bdf8; }`}</style>
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg m-4 transform transition-all">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Editar Usuario' : successData ? 'Usuario Creado Exitosamente' : 'Registrar Nuevo Usuario'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {successData ? (
                    <div className="text-center">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                        <p className="text-slate-600 mb-4">El usuario para <span className="font-semibold">{name}</span> ha sido creado. Por favor, comparte estas credenciales de forma segura.</p>
                        <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 space-y-2 text-left text-sm">
                           <p><span className="font-semibold text-slate-700 w-24 inline-block">Usuario:</span> <kbd className="px-2 py-1 text-sm font-semibold text-slate-800 bg-slate-200 rounded-md">{successData.username}</kbd></p>
                           <p><span className="font-semibold text-slate-700 w-24 inline-block">Contraseña:</span> <kbd className="px-2 py-1 text-sm font-semibold text-slate-800 bg-slate-200 rounded-md">{successData.password}</kbd></p>
                        </div>
                         <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cerrar</button>
                            <button type="button" onClick={startNewRegistration} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">Registrar Otro</button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isEditMode && currentUserRole === 'Jefe Maestro' && userToEdit && ['Directivo', 'Docente', 'Familia'].includes(userToEdit.role) && (
                            <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="reg-username-ro" className="block text-sm font-medium text-slate-700">Usuario (No editable)</label>
                                    <input id="reg-username-ro" type="text" readOnly value={userToEdit.username} className="mt-1 block w-full input-style bg-slate-200 cursor-not-allowed"/>
                                </div>
                                 <div>
                                    <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700">Contraseña</label>
                                    <input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full input-style" placeholder="Dejar en blanco para no cambiar"/>
                                </div>
                            </div>
                        )}
                        <div>
                            <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                            <input id="reg-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full input-style" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
                                <input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full input-style" />
                            </div>
                             <div>
                                <label htmlFor="reg-age" className="block text-sm font-medium text-slate-700">Edad</label>
                                <input id="reg-age" type="number" value={age} onChange={e => setAge(e.target.value)} required className="mt-1 block w-full input-style" />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="reg-address" className="block text-sm font-medium text-slate-700">Dirección</label>
                                <input id="reg-address" type="text" value={address} onChange={e => setAddress(e.target.value)} required className="mt-1 block w-full input-style" />
                            </div>
                             <div>
                                <label htmlFor="reg-phone" className="block text-sm font-medium text-slate-700">Teléfono</label>
                                <input id="reg-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full input-style" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="reg-role" className="block text-sm font-medium text-slate-700">Cargo (Rol)</label>
                            <select id="reg-role" value={role} onChange={e => setRole(e.target.value as SettableUserRole)} className="mt-1 block w-full select-style">
                                {creatableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        
                        {renderRoleSpecificFields()}

                        {!isEditMode && role === 'Docente' && (
                            <div className="animate-fade-in">
                                <label htmlFor="reg-grade" className="block text-sm font-medium text-slate-700">Asignar Grado Inicial</label>
                                <select id="reg-grade" value={assignedGrade} onChange={e => setAssignedGrade(e.target.value)} className="mt-1 block w-full select-style">
                                    {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Todos los estudiantes de este grado serán asignados a este docente.</p>
                            </div>
                        )}
                        
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        
                        <div className="mt-6 flex justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">{isEditMode ? 'Guardar Cambios' : 'Crear Usuario'}</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UserRegistrationModal;