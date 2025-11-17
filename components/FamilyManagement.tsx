

import React, { useState, useMemo } from 'react';
import { UserGroupIcon, XMarkIcon, UserPlusIcon, UserMinusIcon, SearchIcon, CheckCircleIcon } from './icons/Icons';
import type { AuthenticatedUser, Student } from '../types';

interface AssignStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (familyId: string, studentId: string) => void;
    family: AuthenticatedUser;
    allStudents: Student[];
}

const AssignStudentModal: React.FC<AssignStudentModalProps> = ({ isOpen, onClose, onConfirm, family, allStudents }) => {
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    // Calculate available and filtered students directly on each render for simplicity and to avoid stale data
    const availableStudents = allStudents.filter(student => 
        !student.family_member_ids?.includes(family.id)
    );

    const filteredStudents = searchTerm.trim()
        ? availableStudents.filter(student => 
            student.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : availableStudents;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudentId) {
            onConfirm(family.id, selectedStudentId);
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
                <p className="text-sm text-slate-700 mb-4">
                    Selecciona un estudiante para asignar a: <span className="font-semibold text-sky-700">{family.name}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="relative mb-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar estudiante por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border bg-white border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
                        />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto bg-slate-50 p-2 rounded-md space-y-1 border border-slate-200">
                       {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <button
                                    type="button"
                                    key={student.id}
                                    onClick={() => setSelectedStudentId(student.id)}
                                    className={`w-full text-left flex items-center justify-between p-2 rounded-md transition-colors ${
                                        selectedStudentId === student.id
                                            ? 'bg-sky-600 text-white shadow-sm'
                                            : 'text-slate-800 hover:bg-slate-200'
                                    }`}
                                >
                                    <span>
                                        {student.name} <span className="text-xs opacity-70">({student.grade})</span>
                                    </span>
                                    {selectedStudentId === student.id && <CheckCircleIcon className="w-5 h-5" />}
                                </button>
                            ))
                        ) : (
                            <div className="text-center p-4">
                                <p className="text-sm text-slate-500">
                                    {searchTerm
                                        ? 'No se encontraron estudiantes con ese nombre.'
                                        : 'No hay estudiantes disponibles para asignar.'
                                    }
                                </p>
                            </div>
                        )}
                    </div>

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
    onAssignStudentToFamily: (familyId: string, studentId: string) => void;
    onUnassignFamilyFromStudent: (familyId: string, studentId: string) => void;
}

const FamilyManagement: React.FC<FamilyManagementProps> = ({ allUsers, allStudents, onAssignStudentToFamily, onUnassignFamilyFromStudent }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<AuthenticatedUser | null>(null);

    const families = useMemo(() => allUsers.filter(u => u.role === 'Familia'), [allUsers]);
    
    const handleOpenModal = (family: AuthenticatedUser) => {
        setSelectedFamily(family);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFamily(null);
    };

    const handleConfirmAssignment = (familyId: string, studentId: string) => {
        onAssignStudentToFamily(familyId, studentId);
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
                    allStudents={allStudents}
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
                        const assignedStudents = allStudents.filter(s => s.family_member_ids && s.family_member_ids.includes(family.id));
                        return (
                            <li key={family.id} className="p-4 flex flex-col sm:flex-row items-start sm:justify-between gap-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                        <UserGroupIcon className="w-6 h-6 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">{family.name}</p>
                                        <p className="text-sm text-slate-500">{family.email}</p>
                                    </div>
                                </div>

                                <div className="flex-grow w-full sm:w-auto sm:min-w-[250px] space-y-2">
                                    {assignedStudents.length > 0 ? (
                                        assignedStudents.map(student => (
                                            <div key={student.id} className="flex items-center justify-between gap-3 bg-slate-100 p-2 rounded-lg border border-slate-200">
                                                <div className="flex items-center gap-3">
                                                    <img src={student.photo_url} alt={student.name} className="w-10 h-10 rounded-full"/>
                                                    <div>
                                                        <p className="font-medium text-sm text-slate-700">{student.name}</p>
                                                        <p className="text-xs text-slate-500">{student.grade}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onUnassignFamilyFromStudent(family.id, student.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors flex-shrink-0"
                                                    title={`Quitar asignación de ${student.name}`}
                                                >
                                                    <UserMinusIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-slate-500 italic p-2 h-[58px] flex items-center">Sin asignar</div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                                    <button
                                        onClick={() => handleOpenModal(family)}
                                        className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600 transition-colors"
                                    >
                                        <UserPlusIcon className="w-4 h-4 mr-2" />
                                        Asignar Estudiante
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
