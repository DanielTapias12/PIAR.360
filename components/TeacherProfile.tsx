

import React, { useMemo, useState } from 'react';
import { ArrowLeftIcon, UserCircleIcon, BriefcaseIcon, AcademicCapIcon, UsersIcon } from './icons/Icons';
import type { AuthenticatedUser, Student } from '../types';

interface TeacherProfileProps {
    teacher: AuthenticatedUser;
    allStudents: Student[];
    onBack: () => void;
    onSelectStudent: (student: Student) => void;
}

const InfoItem = ({ label, value, icon }: { label: string, value: string | undefined, icon: React.FC<any> }) => {
    const Icon = icon;
    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 w-full">
            <div className="flex items-center text-sm text-slate-500 mb-1">
                <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{label}</span>
            </div>
            <p className="text-base font-semibold text-slate-800 ml-6">{value || 'No especificado'}</p>
        </div>
    );
};


interface FilterButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}
const FilterButton: React.FC<FilterButtonProps> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            isActive ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
        }`}
    >
        {label}
    </button>
);


const TeacherProfile: React.FC<TeacherProfileProps> = ({ teacher, allStudents, onBack, onSelectStudent }) => {
    
    const [gradeFilter, setGradeFilter] = useState('all');
    const [riskFilter, setRiskFilter] = useState<'all' | 'bajo' | 'medio' | 'alto'>('all');
    
    const assignedStudents = useMemo(() => {
        return allStudents.filter(student => student.teachers?.includes(teacher.name));
    }, [allStudents, teacher.name]);

    const availableGrades = useMemo(() => [...new Set(assignedStudents.map(s => s.grade))].sort(), [assignedStudents]);

    const riskLevels: { value: 'all' | 'bajo' | 'medio' | 'alto'; label: string }[] = [
        { value: 'all', label: 'Todo Riesgo' },
        { value: 'bajo', label: 'Bajo' },
        { value: 'medio', label: 'Medio' },
        { value: 'alto', label: 'Alto' }
    ];

    const filteredStudents = useMemo(() => assignedStudents.filter(student => {
        const gradeMatch = gradeFilter === 'all' || student.grade === gradeFilter;
        const riskMatch = riskFilter === 'all' || student.risk_level === riskFilter;
        return gradeMatch && riskMatch;
    }), [assignedStudents, gradeFilter, riskFilter]);

    const riskColorMap = {
        bajo: 'bg-green-100 text-green-800',
        medio: 'bg-yellow-100 text-yellow-800',
        alto: 'bg-red-100 text-red-800',
    };

    return (
        <div className="p-8">
            <header className="flex items-center mb-8">
                <button onClick={onBack} className="p-2 mr-4 rounded-full hover:bg-slate-200 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{teacher.name}</h1>
                    <p className="text-slate-500">Perfil del Docente</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Teacher Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Información de Contacto</h3>
                        <div className="space-y-4">
                            <InfoItem label="Username" value={teacher.username} icon={UserCircleIcon} />
                            <InfoItem label="Email" value={teacher.email} icon={UserCircleIcon} />
                            <InfoItem label="Teléfono" value={teacher.phone} icon={UserCircleIcon} />
                            <InfoItem label="Dirección" value={teacher.address} icon={UserCircleIcon} />
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Perfil Profesional</h3>
                        <div className="space-y-4">
                            <InfoItem label="Especialización" value={teacher.specialization} icon={BriefcaseIcon} />
                            <InfoItem label="Experiencia" value={teacher.experience} icon={AcademicCapIcon} />
                        </div>
                    </div>
                </div>

                {/* Right Column - Assigned Students */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
                         <div className="flex items-center gap-3 mb-4">
                             <UsersIcon className="w-6 h-6 text-sky-600" />
                            <h3 className="text-xl font-bold text-slate-800">Estudiantes Asignados ({filteredStudents.length} de {assignedStudents.length})</h3>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-4 mb-6 p-3 bg-slate-100 rounded-xl">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-slate-700 shrink-0">Grado:</span>
                                <div className="flex items-center bg-slate-200/70 rounded-lg p-1 flex-wrap gap-1">
                                    <FilterButton label="Todos" isActive={gradeFilter === 'all'} onClick={() => setGradeFilter('all')} />
                                    {availableGrades.map(g => (
                                        <FilterButton key={g} label={g} isActive={gradeFilter === g} onClick={() => setGradeFilter(g)} />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-slate-700 shrink-0">Riesgo:</span>
                                <div className="flex items-center bg-slate-200/70 rounded-lg p-1 flex-wrap gap-1">
                                    {riskLevels.map(level => (
                                        <FilterButton key={level.value} label={level.label} isActive={riskFilter === level.value} onClick={() => setRiskFilter(level.value)} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {assignedStudents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredStudents.map(student => (
                                    <div key={student.id} onClick={() => onSelectStudent(student)} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-sky-50 hover:border-sky-300 cursor-pointer transition-colors">
                                        <img src={student.photo_url} alt={student.name} className="w-12 h-12 rounded-full"/>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-slate-800">{student.name}</p>
                                            <p className="text-sm text-slate-500">{student.grade}</p>
                                        </div>
                                         <span className={`px-2 py-1 text-xs font-medium rounded-full ${riskColorMap[student.risk_level]}`}>
                                            {student.risk_level}
                                        </span>
                                    </div>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <p className="col-span-full text-center text-slate-500 py-8">No hay estudiantes que coincidan con los filtros.</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-slate-500 py-8">
                                <p>Este docente no tiene estudiantes asignados.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherProfile;