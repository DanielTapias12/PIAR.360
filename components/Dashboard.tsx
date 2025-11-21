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

const StatCard = ({ title, value, icon, gradientFrom, gradientTo, onClick }: { title: string, value: string | number, icon: React.FC<any>, gradientFrom: string, gradientTo: string, onClick?: () => void }) => {
    const Icon = icon;
    const isClickable = !!onClick;
    return (
        <button
            onClick={onClick}
            disabled={!isClickable}
            className={`bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.06)] border border-slate-100 flex items-center w-full text-left ${isClickable ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer' : 'cursor-default'}`}
        >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-md`}>
                <Icon className="w-7 h-7 text-white" />
            </div>
            <div className="ml-5">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-0.5">{value}</p>
            </div>
        </button>
    );
};

const Alerts = ({ alerts, students, onSelectStudent }: { alerts: Alert[], students: Student[], onSelectStudent: (student: Student) => void }) => (
    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.06)] border border-slate-100 h-full">
        <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-slate-800">Alertas Tempranas</h3>
             <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{alerts.length} Nuevas</span>
        </div>
        <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {alerts.length > 0 ? alerts.map(alert => (
                <div key={alert.id} className="flex items-start p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="mt-1 p-1.5 bg-amber-50 text-amber-500 rounded-full flex-shrink-0">
                        <AlertIcon className="w-4 h-4" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-slate-600 leading-relaxed">
                            <button
                                onClick={() => {
                                    const student = students.find(s => s.id === alert.studentId);
                                    if(student) onSelectStudent(student);
                                }}
                                className="font-bold text-slate-800 hover:text-sky-600 transition-colors"
                            >
                                {alert.studentName}
                            </button>
                            <span className="text-slate-500">: {alert.message}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1 font-medium">{alert.timestamp}</p>
                    </div>
                </div>
            )) : (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <ShieldCheckIcon className="w-12 h-12 opacity-20 mb-2"/>
                    <p className="text-sm">Todo está tranquilo.</p>
                </div>
            )}
        </div>
    </div>
);


const CriteriaExplanation: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.06)] border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <LightbulbIcon className="w-6 h-6 mr-2 text-yellow-500" />
                Guía de Criterios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start p-4 rounded-xl bg-red-50/50 border border-red-100">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100 flex-shrink-0 shadow-sm">
                        <AlertIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="ml-4">
                        <h4 className="font-bold text-slate-800">Riesgo Alto</h4>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                            Basado en diagnóstico inicial y barreras de aprendizaje que requieren ajustes urgentes.
                        </p>
                    </div>
                </div>
                 <div className="flex items-start p-4 rounded-xl bg-green-50/50 border border-green-100">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100 flex-shrink-0 shadow-sm">
                         <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="ml-4">
                        <h4 className="font-bold text-slate-800">PIAR Completado</h4>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                            El plan de ajustes ha sido formalizado y se encuentra documentado en el sistema.
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
        { name: 'Bajo', count: (students || []).filter(s => s.risk_level === 'bajo').length, fill: '#4ade80' }, // green-400
        { name: 'Medio', count: (students || []).filter(s => s.risk_level === 'medio').length, fill: '#facc15' }, // yellow-400
        { name: 'Alto', count: (students || []).filter(s => s.risk_level === 'alto').length, fill: '#f87171' }, // red-400
    ];

    return (
        <div className="space-y-8 pb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Bienvenido de nuevo</h1>
                <p className="text-slate-500 mt-2 text-lg">Aquí tienes un resumen del estado de inclusión en tu aula.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Estudiantes" 
                    value={students.length} 
                    icon={StudentsIcon} 
                    gradientFrom="from-sky-500"
                    gradientTo="to-blue-600"
                    onClick={() => onNavigateWithFilter('students', {})} 
                />
                <StatCard 
                    title="Riesgo Alto" 
                    value={highRiskStudents.length} 
                    icon={AlertIcon} 
                    gradientFrom="from-rose-500"
                    gradientTo="to-red-600"
                    onClick={() => onNavigateWithFilter('students', { risk_level: 'alto' })}
                />
                <StatCard 
                    title="PIAR Completados" 
                    value={`${completedPiarCount} / ${students.length}`} 
                    icon={CheckCircleIcon} 
                    gradientFrom="from-emerald-400"
                    gradientTo="to-green-600"
                    onClick={() => onNavigateWithFilter('students', { piar_status: 'completed' })}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.06)] border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Distribución por Nivel de Riesgo</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={60}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    allowDecimals={false} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 12 }} 
                                />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}} 
                                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} 
                                />
                                <Bar dataKey="count" name="Estudiantes" radius={[6, 6, 0, 0]} animationDuration={1500} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <Alerts alerts={[]} students={students} onSelectStudent={onSelectStudent}/>
            </div>
            
            <CriteriaExplanation />
        </div>
    );
};

export default Dashboard;