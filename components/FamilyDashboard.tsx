import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeftIcon, DocumentIcon, ChatBubbleOvalLeftEllipsisIcon } from './icons/Icons';
import PiarSummaryForFamily from './PiarSummaryForFamily';
import FamilyAIAssistant from './FamilyAIAssistant';
import type { Student, AuthenticatedUser } from '../types';

interface FamilyDashboardProps {
    user: AuthenticatedUser;
    students: Student[];
    onUpdateStudent: (student: Student) => void;
    onNavigate: (view: string) => void;
    initialTab?: FamilyTab;
}

type FamilyTab = 'summary' | 'assistant';

const TabButton = ({ label, icon, isActive, onClick }: { label: string, icon: React.FC<any>, isActive: boolean, onClick: () => void }) => {
    const Icon = icon;
    const activeClasses = "border-emerald-500 text-emerald-600";
    const inactiveClasses = "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300";
    return (
        <button
            onClick={onClick}
            className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? activeClasses : inactiveClasses}`}
        >
            <Icon className="w-5 h-5 mr-2" />
            {label}
        </button>
    );
};

const FamilyDashboard: React.FC<FamilyDashboardProps> = ({ user, students, onUpdateStudent, onNavigate, initialTab }) => {
    const [activeTab, setActiveTab] = useState<FamilyTab>(initialTab || 'summary');
    // State to track the user's explicit choice when multiple students are available
    const [chosenStudentId, setChosenStudentId] = useState<string | null>(null);

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    // This is the currently active student, derived from props and state.
    // This logic robustly handles all possible scenarios.
    const selectedStudent = useMemo(() => {
        // SCENARIO 1: The family is assigned to exactly one student.
        // We automatically select this student to save the user a click.
        if (students.length === 1) {
            return students[0];
        }
        // SCENARIO 2: The family has multiple students, and they have chosen one from the list.
        // We find and select that specific student.
        if (chosenStudentId) {
            return students.find(s => s.id === chosenStudentId) || null;
        }
        // SCENARIO 3: The family has multiple students but hasn't chosen one yet,
        // or has 0 students. In this case, no student is actively selected.
        return null;
    }, [students, chosenStudentId]);

    // This effect keeps the state consistent. If the chosen student is no longer
    // in the list (e.g., unassigned), the choice is reset.
    useEffect(() => {
        if (chosenStudentId && !students.some(s => s.id === chosenStudentId)) {
            setChosenStudentId(null);
        }
    }, [students, chosenStudentId]);


    const handleBackToList = () => {
        setChosenStudentId(null);
        setActiveTab('summary'); // Reset tab to default when changing student
    };

    // RENDER LOGIC: Handles the three main states of this dashboard.

    // State 1: No students are associated with this family account.
    // This happens if the `students` prop is an empty array. The most common reason for this
    // is that the database's Row-Level Security (RLS) policies are not correctly configured
    // to allow this user to view any students. Once the policies in `policies.sql` are applied,
    // this component will receive the correct students and this view will no longer show incorrectly.
    if (students.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500 h-full flex flex-col justify-center items-center">
                <h1 className="text-2xl font-bold text-slate-700">Bienvenido al Portal Familiar</h1>
                <p className="mt-2 max-w-md">Actualmente no tiene un estudiante asociado a esta cuenta. Por favor, contacte a la institución para vincular a su hijo/a.</p>
            </div>
        );
    }

    // State 2: A student IS selected (either automatically or by choice).
    // We show the detailed view with tabs for this student.
    if (selectedStudent) {
        return (
            <div className="p-8">
                <header className="flex items-start justify-between mb-6">
                    <div className="flex items-center">
                        <img src={selectedStudent.photo_url} alt={selectedStudent.name} className="w-16 h-16 rounded-full" />
                        <div className="ml-4">
                            <h1 className="text-3xl font-bold text-slate-800">Portal Familiar</h1>
                            <p className="text-slate-500">Resumen para {selectedStudent.name}</p>
                        </div>
                    </div>
                    {students.length > 1 && (
                        <button onClick={handleBackToList} className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />
                            Cambiar de Estudiante
                        </button>
                    )}
                </header>
                
                <div className="bg-white rounded-xl shadow-sm">
                     <div className="border-b border-slate-200">
                        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                            <TabButton label="Resumen PIAR" icon={DocumentIcon} isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
                            <TabButton label="Asistente IA" icon={ChatBubbleOvalLeftEllipsisIcon} isActive={activeTab === 'assistant'} onClick={() => setActiveTab('assistant')} />
                        </nav>
                    </div>
                    <div>
                        {activeTab === 'summary' && <PiarSummaryForFamily student={selectedStudent} user={user} onNavigate={onNavigate} onUpdateStudent={onUpdateStudent} />}
                        {activeTab === 'assistant' && <FamilyAIAssistant student={selectedStudent} />}
                    </div>
                </div>
            </div>
        );
    }
    
    // State 3: No student is selected yet, and there are multiple options. Show the selection list.
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-800">Portal Familiar</h1>
            <p className="text-slate-500 mt-1">Selecciona un estudiante para ver su resumen.</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map(student => (
                    <button key={student.id} onClick={() => setChosenStudentId(student.id)} className="bg-white rounded-xl shadow-md p-4 flex items-center space-x-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out text-left w-full">
                        <img src={student.photo_url} alt={student.name} className="w-16 h-16 rounded-full" />
                        <div>
                            <p className="font-semibold text-slate-800">{student.name}</p>
                            <p className="text-sm text-slate-500">{student.grade}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FamilyDashboard;