import React, { useState } from 'react';
import type { Student, AuthenticatedUser, NewStudentData } from '../types';
import { SearchIcon, UserPlusIcon, XMarkIcon, CheckCircleIcon } from './icons/Icons';

interface StudentCardProps {
    student: Student;
    onSelect: (student: Student) => void;
    user: AuthenticatedUser;
    onAssign: (studentId: string) => void;
    showAssignControls: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onSelect, user, onAssign, showAssignControls }) => {
    const riskColorMap = {
        bajo: 'bg-green-100 text-green-800',
        medio: 'bg-yellow-100 text-yellow-800',
        alto: 'bg-red-100 text-red-800',
    };
    const isAssignedToMe = student.teacher === user.name;

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col justify-between hover:shadow-md hover:scale-[1.02] transition-all duration-200 space-y-3">
            <div 
                className="flex items-center space-x-4 cursor-pointer"
                onClick={() => onSelect(student)}
            >
                <img src={student.photoUrl} alt={student.name} className="w-16 h-16 rounded-full" />
                <div className="flex-1">
                    <p className="font-semibold text-slate-800">{student.name}</p>
                    <p className="text-sm text-slate-500">{student.grade}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${riskColorMap[student.riskLevel]}`}>
                    Riesgo {student.riskLevel}
                </span>
            </div>
             
            {(user.role === 'Directivo' || showAssignControls) && student.teacher && (
                <p className="text-xs text-slate-500 border-t border-slate-100 pt-2 mt-auto">Docente: {student.teacher}</p>
            )}
            {!student.teacher && (user.role === 'Directivo' || showAssignControls) && (
                 <p className="text-xs text-slate-400 font-style: italic border-t border-slate-100 pt-2 mt-auto">Estudiante sin asignar</p>
            )}

            {showAssignControls && user.role === 'Docente' && (
                <div className="pt-2 border-t border-slate-100">
                    <button
                        onClick={() => onAssign(student.id)}
                        disabled={isAssignedToMe}
                        className="w-full flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <UserPlusIcon className="w-4 h-4 mr-2" />
                        {isAssignedToMe ? 'Asignado a mí' : 'Asignarme'}
                    </button>
                </div>
            )}
        </div>
    );
};


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
        onSubmit({ name, grade, riskLevel, diagnosis });
        // Reset form for next time
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
                        <input id="student-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="student-grade" className="block text-sm font-medium text-slate-700">Grado</label>
                             <select id="student-grade" value={grade} onChange={e => setGrade(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                                {grades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="student-risk" className="block text-sm font-medium text-slate-700">Nivel de Riesgo</label>
                            <select id="student-risk" value={riskLevel} onChange={e => setRiskLevel(e.target.value as any)} className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                                <option value="bajo">Bajo</option>
                                <option value="medio">Medio</option>
                                <option value="alto">Alto</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="student-diagnosis" className="block text-sm font-medium text-slate-700">Diagnóstico / Resumen Inicial</label>
                        <textarea id="student-diagnosis" rows={4} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">Registrar Estudiante</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface StudentListProps {
    students: Student[];
    allStudents: Student[];
    onSelectStudent: (student: Student) => void;
    user: AuthenticatedUser;
    onAssignStudent: (studentId: string) => void;
    onRegisterStudent: (data: NewStudentData) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, allStudents, onSelectStudent, user, onAssignStudent, onRegisterStudent }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'mine' | 'all'>('mine');
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [registerSuccess, setRegisterSuccess] = useState('');

    const isDirector = user.role === 'Directivo';
    
    // Director always sees all students
    const studentsToDisplay = isDirector || viewMode === 'all' ? allStudents : students;

    const filteredStudents = studentsToDisplay.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const handleRegisterSubmit = (data: NewStudentData) => {
        onRegisterStudent(data);
        setIsRegisterModalOpen(false);
        setRegisterSuccess(`¡Estudiante ${data.name} registrado con éxito!`);
        setTimeout(() => setRegisterSuccess(''), 4000);
    };

    const ModeButton = ({ label, targetMode }: { label: string; targetMode: 'mine' | 'all' }) => {
        const isActive = viewMode === targetMode;
        const activeClasses = "border-sky-500 text-sky-600";
        const inactiveClasses = "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300";
        return (
            <button
                onClick={() => setViewMode(targetMode)}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? activeClasses : inactiveClasses}`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="p-8">
            <RegisterStudentModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onSubmit={handleRegisterSubmit}
            />
            <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{isDirector ? 'Directorio Institucional' : 'Estudiantes'}</h1>
                    <p className="text-slate-500 mt-1">{isDirector ? 'Supervise todos los perfiles y PIAR de la institución.' : 'Gestiona los perfiles y PIAR de tus estudiantes.'}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="relative w-full max-w-xs">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar estudiante..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
                        />
                    </div>
                     {(user.role === 'Docente' || user.role === 'Directivo') && (
                        <button 
                            onClick={() => setIsRegisterModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                        >
                            <UserPlusIcon className="w-5 h-5 mr-2 -ml-1"/>
                            Registrar Estudiante
                        </button>
                     )}
                </div>
            </div>

            {registerSuccess && (
                 <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-r-lg flex items-center animate-fade-in" role="alert">
                    <CheckCircleIcon className="w-6 h-6 mr-3"/>
                    <p className="font-semibold text-sm">{registerSuccess}</p>
                </div>
            )}
            
             {user.role === 'Docente' && (
                <div className="mb-6 border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <ModeButton label="Mis Estudiantes" targetMode="mine" />
                        <ModeButton label="Directorio Institucional" targetMode="all" />
                    </nav>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStudents.map(student => (
                    <StudentCard 
                        key={student.id} 
                        student={student} 
                        onSelect={onSelectStudent}
                        user={user}
                        onAssign={onAssignStudent}
                        showAssignControls={viewMode === 'all'}
                    />
                ))}
            </div>
             {filteredStudents.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-sm">
                    <p className="text-slate-500">No se encontraron estudiantes que coincidan con la búsqueda.</p>
                </div>
            )}
        </div>
    );
};

export default StudentList;