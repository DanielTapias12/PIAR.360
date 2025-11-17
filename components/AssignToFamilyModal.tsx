import React, { useState } from 'react';
import { XMarkIcon } from './icons/Icons';
import type { AuthenticatedUser } from '../types';

// Abridged student type for this component's specific needs
interface SimpleStudent {
    id: string;
    name: string;
}

interface AssignToFamilyModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: SimpleStudent;
    families: AuthenticatedUser[];
    onConfirm: (familyUsername: string, studentId: string) => void;
}

const AssignToFamilyModal: React.FC<AssignToFamilyModalProps> = ({ isOpen, onClose, student, families, onConfirm }) => {
    const [selectedFamilyUsername, setSelectedFamilyUsername] = useState<string>('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFamilyUsername) {
            onConfirm(selectedFamilyUsername, student.id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Asignar a Familia</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                    Estudiante registrado: <span className="font-semibold text-sky-700">{student.name}</span>.
                    <br/>
                    Opcionalmente, puedes asignarlo a una familia ahora.
                </p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="family-select" className="block text-sm font-medium text-slate-700 mb-2">
                        Seleccionar Familia
                    </label>
                    <select
                        id="family-select"
                        value={selectedFamilyUsername}
                        onChange={(e) => setSelectedFamilyUsername(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 bg-slate-50 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                    >
                        <option value="" disabled>-- Elige una familia --</option>
                        {families.map(family => (
                            <option key={family.id} value={family.username}>{family.name}</option>
                        ))}
                    </select>
                    {families.length === 0 && (
                        <p className="text-xs text-slate-500 mt-2">No hay familias registradas disponibles.</p>
                    )}
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                            Omitir por ahora
                        </button>
                        <button type="submit" disabled={!selectedFamilyUsername} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 disabled:bg-slate-400">
                            Confirmar Asignación
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignToFamilyModal;