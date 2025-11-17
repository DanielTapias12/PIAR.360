

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertIcon, StudentsIcon, CheckCircleIcon, LightbulbIcon, ShieldCheckIcon } from './icons/Icons';
import type { Student } from '../types';

interface Alert {
    id: string;
    studentId: string;
    studentName: string;
    message: string;
    timestamp: string;
}

interface DashboardProps {
    students: Student[];
    onSelectStudent: (student: Student) => void;
    onNavigateWithFilter: (view: string, filter: Record<string, any>) => void;
}

const StatCard = ({ title, value, icon, color, onClick }: { title: string, value: string | number, icon: React.FC<any>, color: string, onClick?: () => void }) => {
    const Icon = icon;
    const isClickable = !!onClick;
    return (
        <button
            onClick={onClick}
            disabled={!isClickable}
            className={`bg-white p-6 rounded-xl shadow-sm flex items-center w-full text-left ${isClickable ? 'hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 ease-in-out cursor-pointer' : 'cursor-default'}`}
        >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
                <p className="text-slate-500 text-sm">{title}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </button>
    );
};

const Alerts = ({ alerts, students, onSelectStudent }: { alerts: Alert[], students: Student[], onSelectStudent: (student: Student) => void }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Alertas Tempranas</h3>
        <div className="space-y-4">
            {alerts.length > 0 ? alerts.map(alert => (
                <div key={alert.id} className="flex items-start">
                    <AlertIcon className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="ml-3">
                        <p className="text-sm text-slate-600">
                            <button
                                onClick={() => {
                                    const student = students.find(s => s.id === alert.studentId);
                                    if(student) onSelectStudent(student);
                                }}
                                className="font-semibold text-sky-600 hover:underline"
                            >
                                {alert.studentName}
                            </button>
                            : {alert.message}
                        </p>
                        <p className="text-xs text-slate-400">{alert.timestamp}</p>
                    </div>
                </div>
            )) : <p className="text-sm text-slate-400 text-center py-4">No hay alertas recientes.</p>}
        </div>
    </div>
);


const CriteriaExplanation: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <LightbulbIcon className="w-5 h-5 mr-2 text-sky-500" />
                Criterios de Medición
            </h3>
            <div className="space-y-4">
                <div className="flex items-start">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 flex-shrink-0">
                        <AlertIcon className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="ml-4">
                        <h4 className="font-semibold text-slate-700">Estudiantes en Riesgo Alto</h4>
                        <p className="text-sm text-slate-500 mt-1">
                            Se considera que un estudiante está en "Riesgo Alto" según la valoración inicial del docente al momento del registro. Este criterio se basa en el diagnóstico, barreras de aprendizaje evidentes y la necesidad urgente de ajustes razonables.
                        </p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 flex-shrink-0">
                         <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="ml-4">
                        <h4 className="font-semibold text-slate-700">PIAR Completados</h4>
                        <p className="text-sm text-slate-500 mt-1">
                            Un PIAR se marca como "Completado" cuando existe al menos un documento de tipo "PIAR" generado o subido en el perfil del estudiante. Esto indica que el plan inicial de ajustes ha sido formalizado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ students, onSelectStudent, onNavigateWithFilter }) => {
    const highRiskStudents = (students || []).filter(s => s.risk_level === 'alto');
    const completedPiarCount = (students || []).filter(s => (s.documents || []).some(d => d.type === 'PIAR')).length;

    const chartData = [
        { name: 'Bajo', count: (students || []).filter(s => s.risk_level === 'bajo').length, fill: '#4ade80' },
        { name: 'Medio', count: (students || []).filter(s => s.risk_level === 'medio').length, fill: '#facc15' },
        { name: 'Alto', count: (students || []).filter(s => s.risk_level === 'alto').length, fill: '#f87171' },
    ];

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-slate-500 mt-1">Resumen del estado de tus estudiantes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Estudiantes" 
                    value={students.length} 
                    icon={StudentsIcon} 
                    color="bg-sky-500" 
                    onClick={() => onNavigateWithFilter('students', {})} 
                />
                <StatCard 
                    title="Estudiantes en Riesgo Alto" 
                    value={highRiskStudents.length} 
                    icon={AlertIcon} 
                    color="bg-red-500" 
                    onClick={() => onNavigateWithFilter('students', { risk_level: 'alto' })}
                />
                <StatCard 
                    title="PIAR Completados" 
                    value={`${completedPiarCount} de ${students.length}`} 
                    icon={CheckCircleIcon} 
                    color="bg-green-500" 
                    onClick={() => onNavigateWithFilter('students', { piar_status: 'completed' })}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribución por Nivel de Riesgo</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip cursor={{fill: 'rgba(241, 245, 249, 0.5)'}} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                            <Bar dataKey="count" name="Estudiantes" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <Alerts alerts={[]} students={students} onSelectStudent={onSelectStudent}/>
            </div>
            
            <div>
                <CriteriaExplanation />
            </div>
        </div>
    );
};

export default Dashboard;