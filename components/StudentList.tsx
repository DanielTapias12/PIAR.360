
import React, { useState } from 'react';
import type { Student, UserRole } from '../types';
import { SearchIcon } from './icons/Icons';

interface StudentCardProps {
    student: Student;
    onSelect: (student: Student) => void;
    userRole: UserRole;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onSelect, userRole }) => {
    const riskColorMap = {
        bajo: 'bg-green-100 text-green-800',
        medio: 'bg-yellow-100 text-yellow-800',
        alto: 'bg-red-100 text-red-800',
    };

    return (
        <div 
            className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-4 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200"
            onClick={() => onSelect(student)}
        >
            <img src={student.photoUrl} alt={student.name} className="w-16 h-16 rounded-full" />
            <div className="flex-1">
                <p className="font-semibold text-slate-800">{student.name}</p>
                <p className="text-sm text-slate-500">{student.grade}</p>
                 {userRole === 'Directivo' && student.teacher && (
                    <p className="text-xs text-slate-400 mt-1">Docente: {student.teacher}</p>
                )}
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${riskColorMap[student.riskLevel]}`}>
                Riesgo {student.riskLevel}
            </span>
        </div>
    );
};


interface StudentListProps {
    students: Student[];
    onSelectStudent: (student: Student) => void;
    userRole: UserRole;
}

const StudentList: React.FC<StudentListProps> = ({ students, onSelectStudent, userRole }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isDirector = userRole === 'Directivo';

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{isDirector ? 'Directorio Institucional' : 'Estudiantes'}</h1>
                    <p className="text-slate-500 mt-1">{isDirector ? 'Supervise todos los perfiles y PIAR de la institución.' : 'Gestiona los perfiles y PIAR de tus estudiantes.'}</p>
                </div>
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map(student => (
                    <StudentCard key={student.id} student={student} onSelect={onSelectStudent} userRole={userRole} />
                ))}
            </div>
        </div>
    );
};

export default StudentList;
