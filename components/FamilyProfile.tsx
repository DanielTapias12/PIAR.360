import React from 'react';
import { ArrowLeftIcon, UserCircleIcon, UsersIcon } from './icons/Icons';
import type { AuthenticatedUser, Student } from '../types';

interface FamilyProfileProps {
    family: AuthenticatedUser;
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

const FamilyProfile: React.FC<FamilyProfileProps> = ({ family, allStudents, onBack, onSelectStudent }) => {
    
    const assignedStudent = allStudents.find(student => student.id === family.student_id);

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
                    <h1 className="text-3xl font-bold text-slate-800">{family.name}</h1>
                    <p className="text-slate-500">Perfil del Acudiente</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Family Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Información de Contacto</h3>
                        <div className="space-y-4">
                            <InfoItem label="Email" value={family.email} icon={UserCircleIcon} />
                            <InfoItem label="Teléfono" value={family.phone} icon={UserCircleIcon} />
                            <InfoItem label="Parentesco" value={family.relationship} icon={UserCircleIcon} />
                        </div>
                    </div>
                </div>

                {/* Right Column - Assigned Student */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
                         <div className="flex items-center gap-3 mb-4">
                             <UsersIcon className="w-6 h-6 text-sky-600" />
                            <h3 className="text-xl font-bold text-slate-800">Estudiante Vinculado</h3>
                        </div>

                        {assignedStudent ? (
                            <div onClick={() => onSelectStudent(assignedStudent)} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-sky-50 hover:border-sky-300 cursor-pointer transition-colors">
                                <img src={assignedStudent.photo_url} alt={assignedStudent.name} className="w-12 h-12 rounded-full"/>
                                <div className="flex-grow">
                                    <p className="font-semibold text-slate-800">{assignedStudent.name}</p>
                                    <p className="text-sm text-slate-500">{assignedStudent.grade}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${riskColorMap[assignedStudent.risk_level]}`}>
                                    {assignedStudent.risk_level}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-slate-500 py-8">
                                <p>Este acudiente no tiene un estudiante vinculado.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FamilyProfile;
