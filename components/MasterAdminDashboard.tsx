import React, { useState, useMemo } from 'react';
import type { Student, AuthenticatedUser, UserRole } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// FIX: Imported `Cog6ToothIcon` to resolve 'Cannot find name' error on line 49.
import { UserPlusIcon, UsersIcon, GraduationCapIcon, TrashIcon, ServerIcon, ShieldCheckIcon, PencilIcon, Cog6ToothIcon } from './icons/Icons';
import UserRegistrationModal from './UserRegistrationModal';

interface MasterAdminDashboardProps {
    students: Student[];
    users: AuthenticatedUser[];
    onAssignGradeToTeacher: (teacherName: string, grade: string) => void;
    onDeleteUser: (username: string) => void;
    onRegisterUser: (data: any) => { username: string, password: string } | null;
    onUpdateUser: (user: AuthenticatedUser) => void;
    currentView: 'performance' | 'management';
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

// Mock data for performance chart
const perfData = [
  { name: '10:00', ms: 120 }, { name: '10:05', ms: 150 },
  { name: '10:10', ms: 130 }, { name: '10:15', ms: 180 },
  { name: '10:20', ms: 160 }, { name: '10:25', ms: 210 },
  { name: '10:30', ms: 190 },
];


const PerformanceView: React.FC<{users: AuthenticatedUser[]}> = ({ users }) => (
    <div className="space-y-8">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Rendimiento del Sistema</h2>
            <p className="text-slate-500 mt-1">Vista general del estado y actividad de la plataforma.</p>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Usuarios Activos (simulado)" value={Math.floor(users.length / 2) + 1} icon={UsersIcon} color="bg-green-500" />
            <StatCard title="Tiempo de Respuesta API" value="180 ms" icon={ServerIcon} color="bg-blue-500" />
            <StatCard title="Uso de Memoria" value="256 MB" icon={Cog6ToothIcon} color="bg-yellow-500" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Latencia de API (últimos 30 min)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={perfData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} unit="ms" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                    <Line type="monotone" dataKey="ms" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4, fill: '#0ea5e9' }} activeDot={{ r: 8 }} name="Latencia" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);


const ManagementView: React.FC<Omit<MasterAdminDashboardProps, 'currentView'>> = ({ students, users, onAssignGradeToTeacher, onDeleteUser, onRegisterUser, onUpdateUser, currentUser }) => {
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AuthenticatedUser | null>(null);
    
    const directors = users.filter(u => u.role === 'Directivo');
    const teachers = users.filter(u => u.role === 'Docente');
    const families = users.filter(u => u.role === 'Familia');

    const availableGrades = useMemo(() => [...new Set(students.map(s => s.grade))].sort(), [students]);
    
    const gradeAssignments = useMemo(() => {
        const assignments = new Map<string, string | undefined>();
        availableGrades.forEach(grade => {
            const studentInGrade = students.find(s => s.grade === grade);
            assignments.set(grade, studentInGrade?.teacher);
        });
        return assignments;
    }, [students, availableGrades]);

    const handleDelete = (username: string, name: string) => {
        if (username === 'JefeMaestro') {
            alert('No se puede eliminar al superadministrador.');
            return;
        }
        if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${name} (${username})? Esta acción no se puede deshacer.`)) {
            onDeleteUser(username);
        }
    };

    const UserTable = ({ title, users }: { title: string, users: AuthenticatedUser[] }) => (
         <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{title} ({users.length})</h3>
            <ul className="divide-y divide-slate-200">
                {users.map(user => (
                    <li key={user.username} className="py-3 flex items-center justify-between">
                        <div className="flex items-center">
                            <img className="h-10 w-10 rounded-full" src={`https://picsum.photos/seed/${user.username}/100`} alt={user.name} />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                                <p className="text-sm text-slate-500">{user.username}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                             <button onClick={() => setEditingUser(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" aria-label={`Editar a ${user.name}`}>
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(user.username, user.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" aria-label={`Eliminar a ${user.name}`}>
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
    
    return (
        <div className="space-y-8">
             <UserRegistrationModal
                isOpen={isRegisterModalOpen || !!editingUser}
                onClose={() => { setIsRegisterModalOpen(false); setEditingUser(null); }}
                students={students}
                onRegister={onRegisterUser}
                onUpdate={onUpdateUser}
                creatableRoles={['Directivo', 'Docente', 'Familia']}
                userToEdit={editingUser}
                currentUserRole={currentUser.role}
            />
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Administración Total del Sistema</h2>
                    <p className="text-slate-500 mt-1">Gestiona usuarios, roles y asignaciones de la institución.</p>
                </div>
                <button 
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <UserPlusIcon className="w-5 h-5 mr-2 -ml-1"/>
                    Registrar Usuario
                </button>
            </div>
            
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <UserTable title="Directivos" users={directors} />
                <UserTable title="Docentes" users={teachers} />
                <UserTable title="Familias" users={families} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Asignación de Docentes por Grado</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Grado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Docente Asignado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cambiar Asignación</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {Array.from(gradeAssignments.entries()).map(([grade, teacherName]) => (
                                <tr key={grade}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{grade}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{teacherName || 'Sin asignar'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <select
                                            onChange={(e) => onAssignGradeToTeacher(e.target.value, grade)}
                                            value={teacherName || ''}
                                            className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        >
                                            <option value="">Quitar asignación</option>
                                            {teachers.map(t => (
                                                <option key={t.username} value={t.name}>{t.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const MasterAdminDashboard: React.FC<MasterAdminDashboardProps> = (props) => {
    return (
        <div className="p-8">
            <header className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Panel del Jefe Maestro</h1>
                    <p className="text-slate-500 mt-1">Control y supervisión total de la plataforma PIAR.360.</p>
                </div>
            </header>
            
            {props.currentView === 'performance' && <PerformanceView users={props.users} />}
            {props.currentView === 'management' && <ManagementView {...props} />}
        </div>
    );
};

export default MasterAdminDashboard;