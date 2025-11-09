import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import type { Student, Alert } from '../types';
import { MOCK_INSTITUTIONAL_ALERTS, MOCK_TEACHERS } from '../services/mockData';
import { AlertIcon, StudentsIcon, BriefcaseIcon, GraduationCapIcon } from './icons/Icons';

interface DirectorDashboardProps {
    students: Student[];
    onSelectStudent: (student: Student) => void;
}

const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.FC<any>, color: string }) => {
    const Icon = icon;
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
                <p className="text-slate-500 text-sm">{title}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
};

const InstitutionalAlerts = ({ alerts, students, onSelectStudent }: { alerts: Alert[], students: Student[], onSelectStudent: (student: Student) => void }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Alertas Institucionales</h3>
        <div className="space-y-4">
            {alerts.map(alert => (
                <div key={alert.id} className="flex items-start">
                    <AlertIcon className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="ml-3">
                        <p className="text-sm text-slate-600">
                            <button
                                onClick={() => {
                                    const student = students.find(s => s.id === alert.studentId);
                                    if (student) onSelectStudent(student);
                                }}
                                className="font-semibold text-indigo-600 hover:underline"
                            >
                                {alert.studentName}
                            </button>
                            : {alert.message}
                        </p>
                        <p className="text-xs text-slate-400">{alert.timestamp}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const TeacherProgress = ({ teachers, students }: { teachers: {name: string, photoSeed: string}[], students: Student[] }) => {
    const teacherStats = teachers.map(teacher => {
        const assignedStudents = students.filter(s => s.teacher === teacher.name);
        const piarCompletedCount = assignedStudents.filter(s => {
             // Mock logic: consider PIAR "complete" if they have at least one document
             return s.documents.length > 0;
        }).length;
        const completionRate = assignedStudents.length > 0 ? (piarCompletedCount / assignedStudents.length) * 100 : 0;

        return {
            ...teacher,
            studentCount: assignedStudents.length,
            completionRate
        };
    });

    return (
         <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Progreso por Docente</h3>
            <div className="space-y-4">
                {teacherStats.map(teacher => (
                    <div key={teacher.name}>
                        <div className="flex items-center">
                            <img src={`https://picsum.photos/seed/${teacher.photoSeed}/100`} alt={teacher.name} className="w-10 h-10 rounded-full" />
                            <div className="ml-3 flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-semibold text-slate-700">{teacher.name}</p>
                                    <p className="text-xs text-slate-500">{teacher.studentCount} Estudiantes</p>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${teacher.completionRate}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const DirectorDashboard: React.FC<DirectorDashboardProps> = ({ students, onSelectStudent }) => {
    
    const { gradeData, complianceData } = useMemo(() => {
        const grades = [...new Set(students.map(s => s.grade))].sort();
        const gradeData = grades.map(grade => {
            return {
                name: grade,
                bajo: students.filter(s => s.grade === grade && s.riskLevel === 'bajo').length,
                medio: students.filter(s => s.grade === grade && s.riskLevel === 'medio').length,
                alto: students.filter(s => s.grade === grade && s.riskLevel === 'alto').length,
            };
        });
        const totalPiar = students.length;
        const completedPiar = students.filter(s => s.documents.length > 0).length; // Mock logic
        const complianceData = [
            { name: 'Completados', value: completedPiar },
            { name: 'Pendientes', value: totalPiar - completedPiar },
        ];
        return { gradeData, complianceData };
    }, [students]);
    
    const COLORS = ['#4f46e5', '#a5b4fc'];
    
    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Dashboard Institucional</h1>
                    <p className="text-slate-500 mt-1">Supervisión general de la estrategia de inclusión.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Estudiantes" value={students.length} icon={StudentsIcon} color="bg-indigo-500" />
                <StatCard title="Total Docentes" value={MOCK_TEACHERS.length} icon={BriefcaseIcon} color="bg-slate-500" />
                <StatCard title="PIAR Completados" value={`${complianceData[0].value} de ${students.length}`} icon={GraduationCapIcon} color="bg-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribución de Estudiantes por Grado y Riesgo</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={gradeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                            <Legend wrapperStyle={{fontSize: "12px"}}/>
                            <Bar dataKey="bajo" stackId="a" fill="#4ade80" name="Bajo" />
                            <Bar dataKey="medio" stackId="a" fill="#facc15" name="Medio" />
                            <Bar dataKey="alto" stackId="a" fill="#f87171" name="Alto" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Cumplimiento General PIAR</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={complianceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100} fill="#8884d8" paddingAngle={5} labelLine={false}
                                 label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                    const percent = ((value / students.length) * 100).toFixed(0);
                                    return (
                                        <text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-semibold">
                                            {`${complianceData[index].name} (${percent}%)`}
                                        </text>
                                    );
                                }}
                            >
                                {complianceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                             <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-slate-800">
                                {`${((complianceData[0].value / students.length) * 100).toFixed(0)}%`}
                            </text>
                             <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-slate-500">
                                Completado
                            </text>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <TeacherProgress teachers={MOCK_TEACHERS} students={students} />
                </div>
                <InstitutionalAlerts alerts={MOCK_INSTITUTIONAL_ALERTS} students={students} onSelectStudent={onSelectStudent} />
            </div>

        </div>
    );
};

export default DirectorDashboard;
