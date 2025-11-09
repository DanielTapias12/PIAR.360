
import React, { useState, useMemo } from 'react';
import type { Student, AuthenticatedUser } from '../types';
import { MOCK_TEACHERS } from '../services/mockData';
import { UserPlusIcon, UsersIcon, GraduationCapIcon, TrashIcon } from './icons/Icons';
import UserRegistrationModal from './UserRegistrationModal';

interface AdminPanelProps {
    students: Student[];
    users: AuthenticatedUser[];
    onAssignGradeToTeacher: (teacherName: string, grade: string) => void;
    onDeleteUser: (username: string) => void;
    onRegisterUser: (data: any) => { username: string, password: string } | null;
}

type AdminTab = 'users' | 'grades';

const TabButton = ({ label, icon, isActive, onClick }: { label: string, icon: React.FC<any>, isActive: boolean, onClick: () => void }) => {
    const Icon = icon;
    const activeClasses = "border-indigo-500 text-indigo-600";
    const inactiveClasses = "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300";
    return (
        <button
            onClick={onClick}
            className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? activeClasses : inactiveClasses}`}
        >
            <Icon className="w-5 h-5 mr-2" />
            {label}
        </button>
    );
};

const AdminPanel: React.FC<AdminPanelProps> = ({ students, users, onAssignGradeToTeacher, onDeleteUser, onRegisterUser }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('users');
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    
    const teachers = users.filter(u => u.role === 'Docente');
    const families = users.filter(u => u.role === 'Familia');

    const availableGrades = useMemo(() => [...new Set(students.map(s => s.grade))].sort(), [students]);
    
    const gradeAssignments = useMemo(() => {
        const assignments = new Map<string, string | undefined>();
        availableGrades.forEach(grade => {
            const studentInGrade = students.find(s => s.grade === grade);
            assignments.set(grade, studentInGrade?.teacher);
        });
        return assignments;
    }, [students, availableGrades]);

    const handleDelete = (username: string, name: string) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${name} (${username})? Esta acción no se puede deshacer.`)) {
            onDeleteUser(username);
        }
    };

    return (
        <div className="p-8">
            <UserRegistrationModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                students={students}
                onRegister={onRegisterUser}
            />

            <header className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Panel de Administración</h1>
                    <p className="text-slate-500 mt-1">Gestiona usuarios, roles y asignaciones de la institución.</p>
                </div>
                {activeTab === 'users' && (
                     <button 
                        onClick={() => setIsRegisterModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <UserPlusIcon className="w-5 h-5 mr-2 -ml-1"/>
                        Registrar Usuario
                    </button>
                )}
            </header>

            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton label="Gestión de Usuarios" icon={UsersIcon} isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                    <TabButton label="Gestión de Grados" icon={GraduationCapIcon} isActive={activeTab === 'grades'} onClick={() => setActiveTab('grades')} />
                </nav>
            </div>
            
            <div className="mt-8">
                {activeTab === 'users' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Directorio de Docentes ({teachers.length})</h3>
                            <ul className="divide-y divide-slate-200">
                                {teachers.map(teacher => {
                                    const assignedStudents = students.filter(s => s.teacher === teacher.name);
                                    return (
                                        <li key={teacher.username} className="py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <img className="h-10 w-10 rounded-full" src={`https://picsum.photos/seed/${teacher.username}/100`} alt={teacher.name} />
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-slate-900">{teacher.name}</p>
                                                        <p className="text-sm text-slate-500">{teacher.username}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDelete(teacher.username, teacher.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" aria-label={`Eliminar a ${teacher.name}`}>
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                             {assignedStudents.length > 0 && (
                                                <div className="pl-12 pt-3 mt-3 border-t border-slate-100">
                                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estudiantes Asignados</h4>
                                                    <ul className="mt-2 space-y-1">
                                                        {assignedStudents.map(student => {
                                                            const family = families.find(f => f.studentId === student.id);
                                                            return (
                                                                <li key={student.id} className="text-sm text-slate-600 flex justify-between items-center">
                                                                    <span>{student.name}</span>
                                                                    <span className="text-xs text-slate-500">
                                                                        Familia: {family ? family.name : 'No asignada'}
                                                                    </span>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                             <h3 className="text-lg font-semibold text-slate-800 mb-4">Directorio de Familias ({families.length})</h3>
                              <ul className="divide-y divide-slate-200">
                                {families.map(family => {
                                    const student = students.find(s => s.id === family.studentId);
                                    return (
                                        <li key={family.username} className="py-3 flex items-center justify-between">
                                            <div className="flex items-center flex-1 min-w-0">
                                                <img className="h-10 w-10 rounded-full" src={`https://picsum.photos/seed/${family.username}/100`} alt={family.name} />
                                                <div className="ml-3 min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 truncate">{family.name}</p>
                                                    <p className="text-sm text-slate-500 truncate">{family.username}</p>
                                                </div>
                                            </div>
                                            {student && <p className="text-sm text-slate-600 ml-2 shrink-0">Acudiente de: <span className="font-semibold">{student.name}</span></p>}
                                             <button onClick={() => handleDelete(family.username, family.name)} className="p-2 ml-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" aria-label={`Eliminar a ${family.name}`}>
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                )}
                {activeTab === 'grades' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Asignación de Docentes por Grado</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Grado</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Docente Asignado</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cambiar Asignación</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {Array.from(gradeAssignments.entries()).map(([grade, teacherName]) => (
                                        <tr key={grade}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{grade}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{teacherName || 'Sin asignar'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                <select
                                                    onChange={(e) => onAssignGradeToTeacher(e.target.value, grade)}
                                                    value={teacherName || ''}
                                                    className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                >
                                                    <option value="">Quitar asignación</option>
                                                    {teachers.map(t => (
                                                        <option key={t.username} value={t.name}>{t.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default AdminPanel;