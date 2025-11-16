import React, { useState } from 'react';
import type { NewStudentData } from '../types';
import { XMarkIcon } from './icons/Icons';

const RegisterStudentModal = ({
    isOpen,
    onClose,
    onSubmit,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: NewStudentData) => void;
}) => {
    const [name, setName] = useState('');
    const [grade, setGrade] = useState('Tercero');
    const [riskLevel, setRiskLevel] = useState<'bajo' | 'medio' | 'alto'>('bajo');
    const [diagnosis, setDiagnosis] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim() || !diagnosis.trim()) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        onSubmit({ name, grade, risk_level: riskLevel, diagnosis });
        // Reset form for next time, parent will handle closing
        setName('');
        setGrade('Tercero');
        setRiskLevel('bajo');
        setDiagnosis('');
    };
    
    const grades = ['Tercero', 'Cuarto', 'Quinto', 'Sexto'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Registrar Nuevo Estudiante</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="student-name" className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                        <input id="student-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="student-grade" className="block text-sm font-medium text-slate-700">Grado</label>
                             <select id="student-grade" value={grade} onChange={e => setGrade(e.target.value)} className="mt-1 block w-full px-3 py-2 border-transparent bg-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm">
                                {grades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="student-risk" className="block text-sm font-medium text-slate-700">Nivel de Riesgo</label>
                            <select id="student-risk" value={riskLevel} onChange={e => setRiskLevel(e.target.value as any)} className="mt-1 block w-full px-3 py-2 border-transparent bg-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm">
                                <option value="bajo">Bajo</option>
                                <option value="medio">Medio</option>
                                <option value="alto">Alto</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="student-diagnosis" className="block text-sm font-medium text-slate-700">Diagnóstico / Resumen Inicial</label>
                        <textarea id="student-diagnosis" rows={4} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-100 border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm" />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-500 border border-transparent rounded-md shadow-sm hover:bg-sky-600">Registrar Estudiante</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterStudentModal;