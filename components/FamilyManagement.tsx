

import React, { useState, useMemo } from 'react';
import { UserGroupIcon, XMarkIcon, UserPlusIcon, UserMinusIcon } from './icons/Icons';
import type { AuthenticatedUser, Student } from '../types';

interface AssignStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (familyUsername: string, studentId: string) => void;
    family: AuthenticatedUser;
    assignableStudents: Student[];
}

const AssignStudentModal: React.FC<AssignStudentModalProps> = ({ isOpen, onClose, onConfirm, family, assignableStudents }) => {
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudentId) {
            onConfirm(family.username, selectedStudentId);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Asignar Estudiante</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                    Selecciona un estudiante para asignar a: <span className="font-semibold text-sky-700">{family.name}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="student-select" className="block text-sm font-medium text-slate-700 mb-2">
                        Estudiantes Disponibles
                    </label>
                    <select
                        id="student-select"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 bg-slate-50 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                    >
                        <option value="" disabled>-- Elige un estudiante --</option>
                        {assignableStudents.map(student => (
                            <option key={student.id} value={student.id}>{student.name} ({student.grade})</option>
                        ))}
                    </select>
                    {assignableStudents.length === 0 && (
                        <p className="text-xs text-slate-500 mt-2">No hay estudiantes sin asignar disponibles.</p>
                    )}
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={!selectedStudentId} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 disabled:bg-slate-400">
                            Confirmar Asignación
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface FamilyManagementProps {
    allUsers: AuthenticatedUser[];
    allStudents: Student[];
    onAssignStudentToFamily: (familyUsername: string, studentId: string) => void;
    onUnassignStudentFromFamily: (familyUsername: string) => void;
}

const FamilyManagement: React.FC<FamilyManagementProps> = ({ allUsers, allStudents, onAssignStudentToFamily, onUnassignStudentFromFamily }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<AuthenticatedUser | null>(null);

    const families = useMemo(() => allUsers.filter(u => u.role === 'Familia'), [allUsers]);
    
    const studentsById = useMemo(() => {
        return allStudents.reduce((acc, student) => {
            acc[student.id] = student;
            return acc;
        }, {} as Record<string, Student>);
    }, [allStudents]);

    const assignedStudentIds = useMemo(() => new Set(
        allUsers.filter(u => u.role === 'Familia' && u.student_id).map(u => u.student_id)
    ), [allUsers]);

    const assignableStudents = useMemo(() =>
        allStudents.filter(s => !assignedStudentIds.has(s.id)),
        [allStudents, assignedStudentIds]
    );

    const handleOpenModal = (family: AuthenticatedUser) => {
        setSelectedFamily(family);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFamily(null);
    };

    const handleConfirmAssignment = (familyUsername: string, studentId: string) => {
        onAssignStudentToFamily(familyUsername, studentId);
        handleCloseModal();
    };

    return (
        <div className="p-8">
            {selectedFamily && (
                <AssignStudentModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmAssignment}
                    family={selectedFamily}
                    assignableStudents={assignableStudents}
                />
            )}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Gestión de Familias</h1>
                    <p className="text-slate-500 mt-1">Asigna estudiantes a las cuentas de sus familias o acudientes.</p>
                </div>
            </header>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                <ul className="divide-y divide-slate-200">
                    {families.map(family => {
                        const assignedStudent = family.student_id ? studentsById[family.student_id] : null;
                        return (
                            <li key={family.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                        <UserGroupIcon className="w-6 h-6 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">{family.name}</p>
                                        <p className="text-sm text-slate-500">{family.email}</p>
                                    </div>
                                </div>

                                <div className="flex-grow w-full sm:w-auto sm:min-w-[250px]">
                                    {assignedStudent ? (
                                        <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-lg border border-slate-200">
                                            <img src={assignedStudent.photo_url} alt={assignedStudent.name} className="w-10 h-10 rounded-full"/>
                                            <div>
                                                <p className="font-medium text-sm text-slate-700">{assignedStudent.name}</p>
                                                <p className="text-xs text-slate-500">{assignedStudent.grade}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-500 italic p-2 h-[58px] flex items-center">Sin asignar</div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                                    <button
                                        onClick={() => handleOpenModal(family)}
                                        disabled={!!assignedStudent}
                                        className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <UserPlusIcon className="w-4 h-4 mr-2" />
                                        Asignar
                                    </button>
                                    <button
                                        onClick={() => onUnassignStudentFromFamily(family.username)}
                                        disabled={!assignedStudent}
                                        className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <UserMinusIcon className="w-4 h-4 mr-2" />
                                        Quitar
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
            {families.length === 0 && (
                 <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
                    <p className="text-slate-500">No hay familias/acudientes registrados en el sistema.</p>
                </div>
            )}
        </div>
    );
};

export default FamilyManagement;