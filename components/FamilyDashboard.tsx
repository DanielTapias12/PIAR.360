
import React, { useState } from 'react';
import { ArrowLeftIcon, DocumentIcon, ChartBarIcon, WandIcon } from './icons/Icons';
import PiarSummaryForFamily from './PiarSummaryForFamily';
import FamilyAIAssistant from './FamilyAIAssistant';
import type { Student, AuthenticatedUser } from '../types';

interface FamilyDashboardProps {
    user: AuthenticatedUser;
    student: Student;
    onBack: () => void;
    onUpdateStudent: (student: Student) => void;
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

const FamilyDashboard: React.FC<FamilyDashboardProps> = ({ user, student, onBack }) => {
    const [activeTab, setActiveTab] = useState<FamilyTab>('summary');

    return (
        <div className="p-8">
            <header className="flex items-center mb-6">
                 <img src={student.photo_url} alt={student.name} className="w-16 h-16 rounded-full" />
                <div className="ml-4">
                    <h1 className="text-3xl font-bold text-slate-800">Portal Familiar</h1>
                    <p className="text-slate-500">Resumen para {student.name}</p>
                </div>
            </header>
            
            <div className="bg-white rounded-xl shadow-sm">
                 <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        <TabButton label="Resumen PIAR" icon={DocumentIcon} isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
                        <TabButton label="Asistente IA" icon={WandIcon} isActive={activeTab === 'assistant'} onClick={() => setActiveTab('assistant')} />
                    </nav>
                </div>
                <div>
                    {activeTab === 'summary' && <PiarSummaryForFamily student={student} user={user} />}
                    {activeTab === 'assistant' && <FamilyAIAssistant student={student} />}
                </div>
            </div>
        </div>
    );
};

export default FamilyDashboard;
