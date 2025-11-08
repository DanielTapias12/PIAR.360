import React, { useState } from 'react';
import { getInclusiveStrategies } from '../services/geminiService';
import type { Strategy } from '../types';
import { SearchIcon, LightbulbIcon } from './icons/Icons';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <svg className="animate-spin h-8 w-8 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

// FIX: Defined a props interface for StrategyCard to resolve typing issues with the 'key' prop in lists.
interface StrategyCardProps {
    strategy: Strategy;
}

const StrategyCard = ({ strategy }: StrategyCardProps) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-sky-700">{strategy.title}</h3>
        <p className="mt-2 text-sm text-slate-600 leading-6">{strategy.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
            {strategy.areas.map(area => (
                <span key={area} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{area}</span>
            ))}
            {strategy.grades.map(grade => (
                <span key={grade} className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">{grade}</span>
            ))}
        </div>
    </div>
);

const StrategyBank: React.FC = () => {
    const [query, setQuery] = useState('');
    const [area, setArea] = useState('todos');
    const [grade, setGrade] = useState('todos');
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

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

    const areas = ['Lectoescritura', 'Matemáticas', 'Habilidades Sociales', 'Ciencias', 'Comunicación'];
    const grades = ['Tercero', 'Cuarto', 'Quinto', 'Sexto'];

    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Banco de Estrategias Inclusivas</h1>
                <p className="text-slate-500 mt-1">Encuentra estrategias pedagógicas para apoyar a tus estudiantes, potenciado por IA.</p>
            </header>

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
                {strategies.map((strategy, index) => <StrategyCard key={index} strategy={strategy} />)}
            </div>
        </div>
    );
};

export default StrategyBank;