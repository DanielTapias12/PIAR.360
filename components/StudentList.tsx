import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon, UserPlusIcon, XMarkIcon, CheckCircleIcon, UserMinusIcon, UserCircleIcon } from './icons/Icons';
import type { AuthenticatedUser, Student } from '../types';

interface StudentCardProps {
    student: Student;
    onSelect: (student: Student) => void;
    user: AuthenticatedUser;
    onAssign: (studentId: string) => void;
    onUnassign: (studentId: string) => void;
    showAssignControls: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onSelect, user, onAssign, onUnassign, showAssignControls }) => {
    const riskConfig = {
        bajo: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
        medio: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
        alto: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    };
    
    const config = riskConfig[student.risk_level] || riskConfig.bajo;
    const isAssignedToMe = student.teachers && student.teachers.includes(user.name);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out group h-full">
            <div 
                className="flex flex-col items-center text-center cursor-pointer mb-4"
                onClick={() => onSelect(student)}
            >
                <div className="relative mb-3">
                     <img src={student.photo_url} alt={student.name} className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-md group-hover:border-sky-50 transition-colors" />
                     <span className={`absolute bottom-0 right-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full border ${config.bg} ${config.text} ${config.border}`}>
                        {student.risk_level}
                     </span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg group-hover:text-sky-600 transition-colors line-clamp-1">
                    {student.name}
                </h3>
                <p className="text-sm text-slate-500 font-medium">{student.grade}</p>
            </div>
             
            <div className="mt-auto space-y-3">
                {showAssignControls ? (
                    <div className="min-h-[20px]">
                        {student.teachers && student.teachers.length > 0 ? (
                            <p className="text-xs text-slate-500 text-center bg-slate-50 py-1 px-2 rounded-md truncate">
                                <span className="font-medium">Docente:</span> {student.teachers[0]} {student.teachers.length > 1 && `+${student.teachers.length - 1}`}
                            </p>
                        ) : (
                             <p className="text-xs text-slate-400 italic text-center py-1">Sin docente asignado</p>
                        )}
                    </div>
                ) : <div className="h-1"></div>}

                {showAssignControls && user.role === 'Docente' && (
                    <div className="pt-2 border-t border-slate-100">
                        {isAssignedToMe ? (
                             <button
                                onClick={() => onUnassign(student.id)}
                                className="w-full flex items-center justify-center px-3 py-2 border border-amber-200 text-xs font-bold rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                            >
                                <UserMinusIcon className="w-3.5 h-3.5 mr-1.5" />
                                Quitar
                            </button>
                        ) : (
                            <button
                                onClick={() => onAssign(student.id)}
                                className="w-full flex items-center justify-center px-3 py-2 border border-sky-200 text-xs font-bold rounded-lg text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors"
                            >
                                <UserPlusIcon className="w-3.5 h-3.5 mr-1.5" />
                                Asignarme
                            </button>
                        )}
                    </div>
                )}
                {!showAssignControls && (
                    <button 
                        onClick={() => onSelect(student)}
                        className="w-full py-2 text-xs font-bold text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                    >
                        Ver Perfil
                    </button>
                )}
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
    onUnassignStudent: (studentId: string) => void;
    onRegisterStudentClick: () => void;
    initialFilter: Record<string, any> | null;
    onClearInitialFilter: () => void;
}

interface FilterButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}
const FilterButton: React.FC<FilterButtonProps> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
            isActive 
            ? 'bg-sky-600 text-white shadow-md shadow-sky-200 transform scale-105' 
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
        }`}
    >
        {label}
    </button>
);


const StudentList: React.FC<StudentListProps> = ({ students, allStudents, onSelectStudent, user, onAssignStudent, onUnassignStudent, onRegisterStudentClick, initialFilter, onClearInitialFilter }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'mine' | 'all'>('mine');
    const [gradeFilter, setGradeFilter] = useState('all');
    const [riskFilter, setRiskFilter] = useState<'all' | 'bajo' | 'medio' | 'alto'>('all');
    const [piarFilter, setPiarFilter] = useState<'all' | 'completed' | 'pending'>('all');

    useEffect(() => {
        if (initialFilter) {
            setRiskFilter('all');
            setPiarFilter('all');
            setGradeFilter('all');

            if (initialFilter.risk_level) {
                setRiskFilter(initialFilter.risk_level);
            }
            if (initialFilter.piar_status) {
                setPiarFilter(initialFilter.piar_status);
            }
            onClearInitialFilter();
        }
    }, [initialFilter, onClearInitialFilter]);
    
    const studentsToDisplay = viewMode === 'all' ? allStudents : students;
    const availableGrades = useMemo(() => [...new Set(allStudents.map(s => s.grade))].sort(), [allStudents]);
    
    const riskLevels: { value: 'all' | 'bajo' | 'medio' | 'alto'; label: string }[] = [
        { value: 'all', label: 'Todos' },
        { value: 'bajo', label: 'Riesgo Bajo' },
        { value: 'medio', label: 'Riesgo Medio' },
        { value: 'alto', label: 'Riesgo Alto' }
    ];

    const piarStatuses: { value: 'all' | 'completed' | 'pending'; label: string }[] = [
        { value: 'all', label: 'Todos' },
        { value: 'completed', label: 'PIAR Listo' },
        { value: 'pending', label: 'Pendiente' }
    ];

    const filteredStudents = useMemo(() => studentsToDisplay.filter(student => {
        const nameMatch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
        const gradeMatch = gradeFilter === 'all' || student.grade === gradeFilter;
        const riskMatch = riskFilter === 'all' || student.risk_level === riskFilter;
        const piarMatch = piarFilter === 'all' ||
            (piarFilter === 'completed' && student.documents.some(d => d.type === 'PIAR')) ||
            (piarFilter === 'pending' && !student.documents.some(d => d.type === 'PIAR'));
        return nameMatch && gradeMatch && riskMatch && piarMatch;
    }), [studentsToDisplay, searchTerm, gradeFilter, riskFilter, piarFilter]);

    const ModeButton = ({ label, targetMode }: { label: string; targetMode: 'mine' | 'all' }) => {
        const isActive = viewMode === targetMode;
        return (
            <button
                onClick={() => setViewMode(targetMode)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive 
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="space-y-6 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Directorio de Estudiantes</h1>
                    <p className="text-slate-500 mt-1">Gestiona y monitorea el progreso de cada alumno.</p>
                </div>
                 <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar estudiante..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition shadow-sm"
                        />
                    </div>
                    {user.role === 'Docente' && (
                        <button 
                            onClick={onRegisterStudentClick}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-md shadow-sky-500/20 text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-transform active:scale-95"
                        >
                            <UserPlusIcon className="w-5 h-5 mr-2"/>
                            Nuevo Estudiante
                        </button>
                    )}
                </div>
            </div>

            {user.role === 'Docente' && (
                <div className="bg-slate-100/50 p-1 rounded-xl inline-flex w-full md:w-auto border border-slate-200/50">
                   <ModeButton label="Mis Estudiantes" targetMode="mine" />
                   <ModeButton label="Todos los Estudiantes" targetMode="all" />
                </div>
            )}

            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Filtros:</span>
                    <div className="flex flex-wrap gap-2">
                         <FilterButton label="Todos los Grados" isActive={gradeFilter === 'all'} onClick={() => setGradeFilter('all')} />
                         {availableGrades.map(g => (
                            <FilterButton key={g} label={g} isActive={gradeFilter === g} onClick={() => setGradeFilter(g)} />
                        ))}
                    </div>
                </div>
                 <div className="flex flex-wrap gap-2 pl-12 sm:pl-16">
                    {riskLevels.map(level => (
                        <FilterButton key={level.value} label={level.label} isActive={riskFilter === level.value} onClick={() => setRiskFilter(level.value)} />
                    ))}
                     <div className="w-px h-6 bg-slate-300 mx-2 hidden sm:block"></div>
                    {piarStatuses.map(status => (
                        <FilterButton key={status.value} label={status.label} isActive={piarFilter === status.value} onClick={() => setPiarFilter(status.value)} />
                    ))}
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                {filteredStudents.map(student => (
                    <StudentCard 
                        key={student.id} 
                        student={student} 
                        onSelect={onSelectStudent}
                        user={user}
                        onAssign={onAssignStudent}
                        onUnassign={onUnassignStudent}
                        showAssignControls={viewMode === 'all'}
                    />
                ))}
            </div>
             {filteredStudents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100 border-dashed">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <SearchIcon className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No se encontraron resultados</h3>
                    <p className="text-slate-500 mt-1">Intenta ajustar los filtros o tu búsqueda.</p>
                    <button onClick={() => {setSearchTerm(''); setGradeFilter('all'); setRiskFilter('all'); setPiarFilter('all');}} className="mt-4 text-sky-600 hover:text-sky-700 font-medium text-sm">
                        Limpiar todos los filtros
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentList;