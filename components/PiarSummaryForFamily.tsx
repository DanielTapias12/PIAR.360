
import React, { useState, useEffect } from 'react';
import type { Student, PiarData } from '../types';

interface PiarSummaryForFamilyProps {
    student: Student;
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

const PiarSummaryForFamily: React.FC<PiarSummaryForFamilyProps> = ({ student }) => {
    const [piarData, setPiarData] = useState<PiarData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In a real app, this would be an API call.
        // Here, we simulate loading PIAR data from localStorage.
        setIsLoading(true);
        try {
            const savedData = localStorage.getItem(`piar_data_${student.id}`);
            if (savedData) {
                setPiarData(JSON.parse(savedData));
            } else {
                 // Create some mock data if none exists
                 const mockPiar: PiarData = {
                    resumen_diagnostico: student.diagnosis,
                    fortalezas: ["Interés en temas de ciencia", "Habilidad para construir con bloques", "Memoria visual"],
                    barreras_aprendizaje: ["Dificultad para iniciar interacciones sociales", "Ansiedad ante cambios en la rutina"],
                    ajustes_razonables: [{area: "Lenguaje", ajustes: ["Proporcionar apoyos visuales", "Dar más tiempo para responder preguntas"]}],
                    actividades_refuerzo: [{area: "Habilidades sociales en casa", actividades: ["Practicar saludos", "Jugar juegos de mesa en familia"]}],
                    estrategias_seguimiento: ["Reuniones trimestrales", "Comunicación semanal vía agenda"]
                 };
                 setPiarData(mockPiar);
            }
        } catch (e) {
            console.error("Failed to load PIAR data", e);
        } finally {
            setIsLoading(false);
        }
    }, [student.id, student.diagnosis]);

    if (isLoading) {
        return <div className="p-6 text-center text-slate-500">Cargando resumen del PIAR...</div>;
    }
    
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
        </div>
    );
};

export default PiarSummaryForFamily;
