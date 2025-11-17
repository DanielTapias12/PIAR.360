

import React, { useState } from 'react';
import { getInclusiveStrategies } from '../services/geminiService';
import { SearchIcon, LightbulbIcon, XMarkIcon, AcademicCapIcon, CheckCircleIcon, ChevronDownIcon } from './icons/Icons';
import type { Student, Strategy } from '../types';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <svg className="animate-spin h-8 w-8 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const AssignStrategyModal = ({
    isOpen,
    onClose,
    students,
    onConfirm,
    strategyTitle,
} : {
    isOpen: boolean;
    onClose: () => void;
    students: Student[];
    onConfirm: (studentIds: string[]) => void;
    strategyTitle: string;
}) => {
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

    if (!isOpen) return null;

    const handleStudentSelect = (studentId: string) => {
        setSelectedStudentIds(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudentIds.length > 0) {
            onConfirm(selectedStudentIds);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Asignar Estrategia</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                    Estás asignando la estrategia: <span className="font-semibold text-sky-700">{strategyTitle}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Selecciona uno o más estudiantes:
                    </label>
                    <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1 bg-slate-50">
                        {students.length > 0 ? (
                            students.map(s => (
                                <label key={s.id} htmlFor={`student-${s.id}`} className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id={`student-${s.id}`}
                                        checked={selectedStudentIds.includes(s.id)}
                                        onChange={() => handleStudentSelect(s.id)}
                                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                    />
                                    <span className="ml-3 text-sm text-slate-700">{s.name}</span>
                                </label>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 p-4 text-center">No tienes estudiantes asignados.</p>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={selectedStudentIds.length === 0} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 disabled:bg-slate-400">
                            Confirmar Asignación
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface StrategyCardProps {
    strategy: Strategy;
    onAssign: (strategy: Strategy) => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onAssign }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sky-700 pr-4">{strategy.title}</h3>
                    <ChevronDownIcon
                        className={`w-5 h-5 text-slate-400 flex-shrink-0 mt-1 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </div>
                <p className={`mt-2 text-sm text-slate-600 leading-6 ${!isExpanded ? 'line-clamp-3' : ''}`}>
                    {strategy.description}
                </p>
                <div className="mt-4 space-y-3">
                    {strategy.areas.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Áreas de Aplicación</h4>
                            <div className="flex flex-wrap gap-2">
                                {strategy.areas.map(area => (
                                    <span key={area} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{area}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {strategy.grades.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Grados Sugeridos</h4>
                            <div className="flex flex-wrap gap-2">
                                {strategy.grades.map(grade => (
                                    <span key={grade} className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">{grade}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 text-right">
                 <button
                    onClick={() => onAssign(strategy)}
                    className="inline-flex items-center px-3 py-1.5 border border-sky-200 text-sm font-medium rounded-md text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors"
                >
                    <AcademicCapIcon className="w-4 h-4 mr-2"/>
                    Asignar a Estudiante
                </button>
            </div>
        </div>
    );
};

interface StrategyBankProps {
    students: Student[];
    onAssignStrategy: (studentIds: string[], strategy: Strategy) => void;
}

const StrategyBank: React.FC<StrategyBankProps> = ({ students, onAssignStrategy }) => {
    const [query, setQuery] = useState('');
    const [area, setArea] = useState('todos');
    const [grade, setGrade] = useState('todos');
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
    const [assignmentSuccess, setAssignmentSuccess] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setHasSearched(true);
        setStrategies([]);

        try {
            const results = await getInclusiveStrategies(query, area, grade);
            setStrategies(results);
        } catch (err) {
            setError('No se pudieron obtener las estrategias. Por favor, intente más tarde.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (strategy: Strategy) => {
        setSelectedStrategy(strategy);
        setIsModalOpen(true);
    };

    const handleConfirmAssignment = (studentIds: string[]) => {
        if (selectedStrategy && studentIds.length > 0) {
            onAssignStrategy(studentIds, selectedStrategy);
            const plural = studentIds.length > 1;
            setAssignmentSuccess(`Estrategia "${selectedStrategy.title}" asignada a ${studentIds.length} estudiante${plural ? 's' : ''}.`);
            setTimeout(() => setAssignmentSuccess(''), 4000);
        }
        setIsModalOpen(false);
        setSelectedStrategy(null);
    };

    const areas = ['Lectoescritura', 'Matemáticas', 'Habilidades Sociales', 'Ciencias', 'Comunicación'];
    const grades = ['Tercero', 'Cuarto', 'Quinto', 'Sexto'];

    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Banco de Estrategias Inclusivas</h1>
                <p className="text-slate-500 mt-1">Encuentra y asigna estrategias pedagógicas para apoyar a tus estudiantes.</p>
            </header>
            
            {assignmentSuccess && (
                 <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-r-lg flex items-center animate-fade-in" role="alert">
                    <CheckCircleIcon className="w-6 h-6 mr-3"/>
                    <p className="font-semibold text-sm">{assignmentSuccess}</p>
                </div>
            )}
            
            <AssignStrategyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                students={students}
                onConfirm={handleConfirmAssignment}
                strategyTitle={selectedStrategy?.title || ''}
            />

            <form onSubmit={handleSearch} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                        <label htmlFor="search-query" className="block text-sm font-medium text-slate-700">¿Qué necesitas?</label>
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                id="search-query"
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Ej: actividades para TDAH, mejorar concentración..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="area-filter" className="block text-sm font-medium text-slate-700">Área</label>
                        <select id="area-filter" value={area} onChange={e => setArea(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md">
                            <option value="todos">Todas las áreas</option>
                            {areas.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="grade-filter" className="block text-sm font-medium text-slate-700">Grado</label>
                        <select id="grade-filter" value={grade} onChange={e => setGrade(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md">
                            <option value="todos">Todos los grados</option>
                            {grades.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                     <div className="self-end">
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400">
                            {isLoading ? 'Buscando...' : 'Buscar Estrategias'}
                        </button>
                    </div>
                </div>
            </form>
            
            <div className="space-y-6">
                {isLoading && <LoadingSpinner />}
                {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-lg">{error}</p>}
                {!isLoading && hasSearched && strategies.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-xl shadow-sm">
                        <LightbulbIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-lg font-medium text-slate-900">No se encontraron estrategias</h3>
                        <p className="mt-1 text-sm text-slate-500">Intenta con una búsqueda diferente o filtros más amplios.</p>
                    </div>
                )}
                {strategies.map((strategy, index) => <StrategyCard key={index} strategy={strategy} onAssign={handleOpenModal} />)}
            </div>
        </div>
    );
};

export default StrategyBank;