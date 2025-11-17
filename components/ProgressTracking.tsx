

import React, { useState } from 'react';
import { PlusIcon, AcademicCapIcon } from './icons/Icons';
import type { Student, ProgressEntry } from '../types';

interface ProgressTrackingProps {
    student: Student;
    onProgressAdd: (entry: ProgressEntry) => void;
}

const ProgressTracking: React.FC<ProgressTrackingProps> = ({ student, onProgressAdd }) => {
    const [showForm, setShowForm] = useState(false);
    const [area, setArea] = useState('');
    const [observation, setObservation] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!area.trim() || !observation.trim()) return;

        const newEntry: ProgressEntry = {
            id: `prog_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            area,
            observation,
            author: 'Ana Morales' // In a real app, this would come from the logged-in user
        };

        onProgressAdd(newEntry);
        setArea('');
        setObservation('');
        setShowForm(false);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Seguimiento de Progreso</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Nuevo Registro
                </button>
            </div>

            {showForm && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 animate-fade-in">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="area" className="block text-sm font-medium text-slate-700">Área o Competencia</label>
                            <input
                                type="text"
                                id="area"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                className="mt-1 block w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                                placeholder="Ej: Lectoescritura, Habilidades Sociales..."
                            />
                        </div>
                        <div>
                            <label htmlFor="observation" className="block text-sm font-medium text-slate-700">Observación</label>
                            <textarea
                                id="observation"
                                rows={4}
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                                className="mt-1 block w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                                placeholder="Describa el progreso, los logros o las dificultades observadas."
                            />
                        </div>
                        <div className="text-right space-x-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">Guardar Registro</button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="space-y-4">
                {student.progress_entries.length > 0 ? (
                    student.progress_entries.map(entry => {
                        if (entry.strategy) {
                            return (
                                <div key={entry.id} className="bg-sky-50 p-4 rounded-lg border-l-4 border-sky-500 animate-fade-in">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            <AcademicCapIcon className="w-8 h-8 text-sky-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sky-800">{entry.area}</p>
                                            <p className="text-xs text-slate-500 mb-2">
                                                {new Date(entry.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })} por {entry.author}
                                            </p>
                                            <div className="text-sm text-slate-700 bg-white/60 p-3 rounded-md border border-sky-200/80">
                                                <p className="font-bold">{entry.strategy.title}</p>
                                                <p className="mt-1 text-slate-600">{entry.strategy.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        
                        return (
                            <div key={entry.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-sky-700">{entry.area}</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(entry.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })} por {entry.author}
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-2 text-sm text-slate-600">{entry.observation}</p>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-10">
                        <p className="text-slate-500">No hay registros de seguimiento.</p>
                        <p className="text-sm text-slate-400">Añade el primer registro para iniciar el historial de progreso.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressTracking;