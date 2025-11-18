

import React, { useState, useEffect, useMemo } from 'react';
import type { Student, PiarData, AuthenticatedUser } from '../types';
import { PencilIcon } from './icons/Icons';


interface PiarSummaryForFamilyProps {
    student: Student;
    user: AuthenticatedUser;
    onNavigate: (view: string) => void;
    onUpdateStudent: (student: Student) => void;
}

const SummarySection = ({ title, items }: { title: string, items: string[] }) => (
    <div>
        <h4 className="text-lg font-semibold text-emerald-700 mb-2">{title}</h4>
        {items && items.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-slate-700">
                {items.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        ) : <p className="text-sm text-slate-500">No hay información disponible.</p>}
    </div>
);

const AdjustmentSection = ({ title, areas }: { title: string, areas: { area: string, ajustes: string[] }[] | { area: string, actividades: string[] }[] }) => (
    <div>
        <h4 className="text-lg font-semibold text-emerald-700 mb-3">{title}</h4>
        <div className="space-y-4">
            {areas && areas.length > 0 ? (
                areas.map((areaItem, index) => (
                    <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h5 className="font-semibold text-slate-800">{areaItem.area}</h5>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-slate-600">
                           {'ajustes' in areaItem ? areaItem.ajustes.map((ajuste, i) => <li key={i}>{ajuste}</li>) 
                            : 'actividades' in areaItem ? areaItem.actividades.map((act, i) => <li key={i}>{act}</li>)
                            : null}
                        </ul>
                    </div>
                ))
            ) : <p className="text-sm text-slate-500">No hay información disponible.</p>}
        </div>
    </div>
);

const PiarSummaryForFamily: React.FC<PiarSummaryForFamilyProps> = ({ student, user, onNavigate, onUpdateStudent }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableStudent, setEditableStudent] = useState<Student>(student);

    useEffect(() => {
        setEditableStudent(student);
        setIsEditing(false); // Reset edit mode when student changes
    }, [student]);

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'age') {
            setEditableStudent(prev => ({ ...prev, age: parseInt(value, 10) || 0 }));
        } else {
            setEditableStudent(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveChanges = () => {
        onUpdateStudent(editableStudent);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditableStudent(student);
        setIsEditing(false);
    }

    const piarData = useMemo(() => {
        const piarDocuments = student.documents
            .filter(doc => doc.type === 'PIAR' && doc.content)
            .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

        return piarDocuments.length > 0 ? (piarDocuments[0].content as PiarData) : null;
    }, [student.documents]);
    
    return (
        <div className="p-6 space-y-6">
            <style>{`
                .input-field {
                    display: block;
                    width: 100%;
                    border-radius: 0.375rem;
                    border: 1px solid #cbd5e1;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    background-color: #f8fafc;
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
            
            <div className="pt-2">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Datos del Estudiante</h3>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                        >
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Editar Datos
                        </button>
                    )}
                </div>
                 {isEditing ? (
                     <div className="mt-4 p-4 space-y-4 bg-slate-50 rounded-lg border border-slate-200 animate-fade-in">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                            <input type="text" id="name" name="name" value={editableStudent.name} onChange={handleEditChange} className="mt-1 input-field" />
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="age" className="block text-sm font-medium text-slate-700">Edad</label>
                                <input type="number" id="age" name="age" value={editableStudent.age || ''} onChange={handleEditChange} className="mt-1 input-field" />
                            </div>
                             <div>
                                <label htmlFor="grade" className="block text-sm font-medium text-slate-700">Grado</label>
                                <input type="text" id="grade" name="grade" value={editableStudent.grade} disabled className="mt-1 input-field bg-slate-200 cursor-not-allowed" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="diagnosis" className="block text-sm font-medium text-slate-700">Diagnóstico / Resumen</label>
                            <textarea id="diagnosis" name="diagnosis" rows={4} value={editableStudent.diagnosis} onChange={handleEditChange} className="mt-1 input-field" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
                            <button onClick={handleSaveChanges} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">Guardar Cambios</button>
                        </div>
                    </div>
                 ) : (
                    <div className="mt-4 space-y-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p><span className="font-semibold w-24 inline-block">Nombre:</span> {student.name}</p>
                        <p><span className="font-semibold w-24 inline-block">Edad:</span> {student.age} años</p>
                        <p><span className="font-semibold w-24 inline-block">Grado:</span> {student.grade}</p>
                         <div>
                            <p className="font-semibold">Diagnóstico / Resumen:</p>
                            <p className="mt-1 text-slate-600">{student.diagnosis}</p>
                        </div>
                    </div>
                 )}
            </div>

            {piarData ? (
                 <div className="mt-8 pt-6 border-t border-slate-200 space-y-6">
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-r-lg" role="alert">
                        <p className="font-bold">¿Qué es el PIAR?</p>
                        <p className="text-sm">Es una herramienta para planificar los apoyos y ajustes que {student.name} necesita en el colegio para aprender y participar, reconociendo sus fortalezas y desafíos.</p>
                    </div>
                    
                    <div className="space-y-6">
                        <SummarySection title="Fortalezas de tu hijo/a" items={piarData.fortalezas} />
                        <SummarySection title="Barreras que buscamos superar" items={piarData.barreras_aprendizaje} />
                        <AdjustmentSection title="Ajustes y Apoyos en el Colegio" areas={piarData.ajustes_razonables} />
                        <AdjustmentSection title="Actividades para Apoyar en Casa" areas={piarData.actividades_refuerzo} />
                        <SummarySection title="¿Cómo haremos seguimiento?" items={piarData.estrategias_seguimiento} />
                    </div>
                </div>
            ) : (
                <div className="mt-8 pt-6 border-t border-slate-200 text-center text-slate-500">
                    <p className="py-8">Aún no se ha generado un Resumen PIAR para {student.name}.</p>
                </div>
            )}


            <div className="mt-8 pt-6 border-t border-slate-200">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Datos del Acudiente</h3>
                    <button 
                        onClick={() => onNavigate('settings')}
                        className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Editar Mis Datos
                    </button>
                </div>
                 <div className="mt-4 space-y-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p><span className="font-semibold w-24 inline-block">Nombre:</span> {user.name}</p>
                    <p><span className="font-semibold w-24 inline-block">Parentesco:</span> {user.relationship || 'No especificado'}</p>
                    <p><span className="font-semibold w-24 inline-block">Email:</span> {user.email ? <a href={`mailto:${user.email}`} className="text-sky-600 hover:underline">{user.email}</a> : 'No especificado'}</p>
                    <p><span className="font-semibold w-24 inline-block">Teléfono:</span> {user.phone || 'No especificado'}</p>
                </div>
            </div>
        </div>
    );
};

export default PiarSummaryForFamily;