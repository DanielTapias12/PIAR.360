
import React, { useState } from 'react';
import type { Student, Document, ProgressEntry, UserRole } from '../types';
import { ArrowLeftIcon, DocumentIcon, ChartBarIcon, WandIcon, UserCircleIcon } from './icons/Icons';
import PiarGenerator from './PiarGenerator';
import ProgressTracking from './ProgressTracking';

interface StudentProfileProps {
    student: Student;
    onBack: () => void;
    userRole: UserRole;
    onUpdateStudent: (student: Student) => void;
}

type ProfileTab = 'info' | 'piar' | 'documents' | 'progress';

const TabButton = ({ label, icon, isActive, onClick }: { label: string, icon: React.FC<any>, isActive: boolean, onClick: () => void }) => {
    const Icon = icon;
    const activeClasses = "border-sky-500 text-sky-600";
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

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack, onUpdateStudent }) => {
    const [activeTab, setActiveTab] = useState<ProfileTab>('info');

    const handleDocumentAdd = (document: Document) => {
        const updatedStudent = { ...student, documents: [...student.documents, document] };
        onUpdateStudent(updatedStudent);
    };

    const handleProgressAdd = (entry: ProgressEntry) => {
        const updatedStudent = { ...student, progressEntries: [entry, ...student.progressEntries] };
        onUpdateStudent(updatedStudent);
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return (
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-slate-800">Información del Estudiante</h3>
                        <div className="mt-4 space-y-3 text-sm text-slate-700">
                            <p><span className="font-semibold w-24 inline-block">Nombre:</span> {student.name}</p>
                            <p><span className="font-semibold w-24 inline-block">Grado:</span> {student.grade}</p>
                            <p><span className="font-semibold w-24 inline-block">Docente:</span> {student.teacher}</p>
                            <div>
                                <p className="font-semibold">Diagnóstico / Resumen:</p>
                                <p className="mt-1 text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-200">{student.diagnosis}</p>
                            </div>
                        </div>
                    </div>
                );
            case 'piar':
                return <PiarGenerator student={student} onDocumentAdd={handleDocumentAdd} />;
            case 'documents':
                 return (
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-slate-800">Documentos</h3>
                         <div className="mt-4 flow-root">
                            <div className="-my-2 overflow-x-auto">
                                <div className="inline-block min-w-full py-2 align-middle">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-0">Nombre</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Tipo</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Fecha de Carga</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {student.documents.map((doc) => (
                                                <tr key={doc.id}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-sky-600 hover:underline cursor-pointer sm:pl-0">{doc.name}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{doc.type}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{doc.uploadDate}</td>
                                                </tr>
                                            ))}
                                             {student.documents.length === 0 && (
                                                <tr><td colSpan={3} className="text-center py-8 text-sm text-slate-500">No hay documentos cargados.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'progress':
                return <ProgressTracking student={student} onProgressAdd={handleProgressAdd} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="p-8">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 mr-4 rounded-full hover:bg-slate-200 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6 text-slate-600" />
                </button>
                <img src={student.photoUrl} alt={student.name} className="w-16 h-16 rounded-full" />
                <div className="ml-4">
                    <h1 className="text-3xl font-bold text-slate-800">{student.name}</h1>
                    <p className="text-slate-500">{student.grade}</p>
                </div>
            </header>
            
            <div className="bg-white rounded-xl shadow-sm">
                 <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        <TabButton label="Información" icon={UserCircleIcon} isActive={activeTab === 'info'} onClick={() => setActiveTab('info')} />
                        <TabButton label="Generador PIAR" icon={WandIcon} isActive={activeTab === 'piar'} onClick={() => setActiveTab('piar')} />
                        <TabButton label="Documentos" icon={DocumentIcon} isActive={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
                        <TabButton label="Seguimiento" icon={ChartBarIcon} isActive={activeTab === 'progress'} onClick={() => setActiveTab('progress')} />
                    </nav>
                </div>
                <div>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
