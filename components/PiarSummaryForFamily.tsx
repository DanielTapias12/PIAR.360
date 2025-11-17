
import React, { useState, useEffect, useMemo } from 'react';
import type { Student, PiarData, AuthenticatedUser } from '../types';


interface PiarSummaryForFamilyProps {
    student: Student;
    user: AuthenticatedUser;
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

const PiarSummaryForFamily: React.FC<PiarSummaryForFamilyProps> = ({ student, user }) => {

    const piarData = useMemo(() => {
        // Find the most recent PIAR document that has content
        const piarDocuments = student.documents
            .filter(doc => doc.type === 'PIAR' && doc.content)
            .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

        return piarDocuments.length > 0 ? (piarDocuments[0].content as PiarData) : null;
    }, [student.documents]);
    
    if (!piarData) {
        return <div className="p-6 text-center text-slate-500">Aún no se ha generado un PIAR para {student.name}.</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-slate-800">Resumen del Plan de Apoyos para {student.name}</h3>
                <p className="text-sm text-slate-500 mt-1">Este es un resumen del Plan Individualizado de Ajustes Razonables (PIAR).</p>
            </div>

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

            <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">Datos del Acudiente</h3>
                 <div className="mt-4 space-y-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p><span className="font-semibold w-24 inline-block">Nombre:</span> {user.name}</p>
                    <p><span className="font-semibold w-24 inline-block">Parentesco:</span> {user.relationship || 'No especificado'}</p>
                    <p><span className="font-semibold w-24 inline-block">Email:</span> <a href={`mailto:${user.email}`} className="text-sky-600 hover:underline">{user.email}</a></p>
                    <p><span className="font-semibold w-24 inline-block">Teléfono:</span> {user.phone || 'No especificado'}</p>
                </div>
            </div>
        </div>
    );
};

export default PiarSummaryForFamily;
