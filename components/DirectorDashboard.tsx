import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import type { Student, Alert, AuthenticatedUser } from '../types';
import { AlertIcon, StudentsIcon, BriefcaseIcon, GraduationCapIcon, UserPlusIcon } from './icons/Icons';

interface DirectorDashboardProps {
    students: Student[];
    users: AuthenticatedUser[];
    onSelectStudent: (student: Student) => void;
    onRegisterUserClick: () => void;
    currentUser: AuthenticatedUser;
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
             {alerts.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No hay alertas institucionales.</p>}
        </div>
    </div>
);

const UserManagement = ({ users, onRegisterUserClick }: { users: AuthenticatedUser[], onRegisterUserClick: () => void }) => {
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Gestión de Usuarios</h3>
                <button 
                    onClick={onRegisterUserClick}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <UserPlusIcon className="w-4 h-4 mr-2"/>
                    Registrar Nuevo Usuario
                </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {users.map(user => (
                    <div key={user.username} className="flex items-center p-2 bg-slate-50 rounded-md">
                         <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm">
                           {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-semibold text-slate-700">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DirectorDashboard: React.FC<DirectorDashboardProps> = ({ students, users, onSelectStudent, onRegisterUserClick }) => {
    
    const { gradeData, complianceData, teachers } = useMemo(() => {
        const grades = [...new Set(students.map(s => s.grade))].sort();
        const gradeData = grades.map(grade => {
            return {
                name: grade,
                bajo: students.filter(s => s.grade === grade && s.risk_level === 'bajo').length,
                medio: students.filter(s => s.grade === grade && s.risk_level === 'medio').length,
                alto: students.filter(s => s.grade === grade && s.risk_level === 'alto').length,
            };
        });
        const totalPiar = students.length;
        const completedPiar = students.filter(s => s.documents.some(d => d.type === 'PIAR')).length;
        const complianceData = [
            { name: 'Completados', value: completedPiar },
            { name: 'Pendientes', value: totalPiar - completedPiar },
        ];
        const teachers = users.filter(u => u.role === 'Docente');

        return { gradeData, complianceData, teachers };
    }, [students, users]);
    
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
                <StatCard title="Total Docentes" value={teachers.length} icon={BriefcaseIcon} color="bg-slate-500" />
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
                                    if (value === 0) return null;
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
                                {students.length > 0 ? `${((complianceData[0].value / students.length) * 100).toFixed(0)}%` : 'N/A'}
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
                     <UserManagement users={users} onRegisterUserClick={onRegisterUserClick} />
                </div>
                <InstitutionalAlerts alerts={[]} students={students} onSelectStudent={onSelectStudent} />
            </div>

        </div>
    );
};

export default DirectorDashboard;