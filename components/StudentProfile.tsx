
import React, { useState, useMemo } from 'react';
import type { Student, Document, ProgressEntry, UserRole } from '../types';
import { ArrowLeftIcon, DocumentIcon, ChartBarIcon, WandIcon, UserCircleIcon, UploadIcon } from './icons/Icons';
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
    const [documentTypeFilter, setDocumentTypeFilter] = useState<'all' | 'informe' | 'evaluacion' | 'PIAR'>('all');
    const [documentSortOrder, setDocumentSortOrder] = useState<'desc' | 'asc'>('desc');
    const [newFile, setNewFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState<string>('');


    const handleDocumentAdd = (document: Document) => {
        const updatedStudent = { ...student, documents: [document, ...student.documents] };
        onUpdateStudent(updatedStudent);
    };

    const handleProgressAdd = (entry: ProgressEntry) => {
        const updatedStudent = { ...student, progressEntries: [entry, ...student.progressEntries] };
        onUpdateStudent(updatedStudent);
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUploadError('');
        if (event.target.files && event.target.files.length > 0) {
            setNewFile(event.target.files[0]);
        } else {
            setNewFile(null);
        }
    };

    const handleFileUpload = (event: React.FormEvent) => {
        event.preventDefault();
        if (!newFile) {
            setUploadError('Por favor, selecciona un archivo para subir.');
            return;
        }

        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(newFile.type)) {
            setUploadError('Tipo de archivo no permitido. Sube solo PDF o DOCX.');
            return;
        }

        if (newFile.size > maxSize) {
            setUploadError('El archivo es demasiado grande. El límite es de 5MB.');
            return;
        }

        // Determine document type from name for mock data
        let docType: 'informe' | 'evaluacion' | 'PIAR' = 'informe';
        const fileNameLower = newFile.name.toLowerCase();
        if (fileNameLower.includes('evaluacion')) docType = 'evaluacion';
        if (fileNameLower.includes('piar')) docType = 'PIAR';

        const newDocument: Document = {
            id: `doc_${Date.now()}`,
            name: newFile.name,
            type: docType,
            uploadDate: new Date().toISOString().split('T')[0],
            url: '#', // In a real app, this would be a URL to the stored file
        };

        handleDocumentAdd(newDocument);
        setNewFile(null);
        setUploadError('');
         // Reset the file input visually
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const filteredAndSortedDocuments = useMemo(() => {
        let documents = [...student.documents];

        // Apply type filter
        if (documentTypeFilter !== 'all') {
            documents = documents.filter(doc => doc.type === documentTypeFilter);
        }

        // Apply sort order
        documents.sort((a, b) => {
            const dateA = new Date(a.uploadDate).getTime();
            const dateB = new Date(b.uploadDate).getTime();
            return documentSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return documents;
    }, [student.documents, documentTypeFilter, documentSortOrder]);

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
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h3 className="text-xl font-bold text-slate-800">Documentos</h3>
                         </div>
                         
                        <form onSubmit={handleFileUpload} className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-slate-700 mb-2">Cargar Nuevo Documento</h4>
                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                <div className="flex-1 w-full">
                                    <label htmlFor="file-upload" className="sr-only">Choose file</label>
                                    <input type="file" id="file-upload" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                                </div>
                                <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700">
                                    <UploadIcon className="w-5 h-5 mr-2" />
                                    Subir Archivo
                                </button>
                            </div>
                            {uploadError && <p className="text-sm text-red-600 mt-2">{uploadError}</p>}
                            <p className="text-xs text-slate-500 mt-2">Archivos permitidos: PDF, DOCX. Tamaño máximo: 5MB.</p>
                        </form>

                        <div className="flex items-center gap-4 mb-6">
                            <div>
                                <label htmlFor="doc-type-filter" className="block text-xs font-medium text-slate-700">Filtrar por Tipo</label>
                                <select id="doc-type-filter" value={documentTypeFilter} onChange={(e) => setDocumentTypeFilter(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md">
                                    <option value="all">Todos</option>
                                    <option value="informe">Informe</option>
                                    <option value="evaluacion">Evaluación</option>
                                    <option value="PIAR">PIAR</option>
                                </select>
                            </div>
                            <div>
                                 <label htmlFor="doc-sort-filter" className="block text-xs font-medium text-slate-700">Ordenar por Fecha</label>
                                <select id="doc-sort-filter" value={documentSortOrder} onChange={(e) => setDocumentSortOrder(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md">
                                    <option value="desc">Más recientes</option>
                                    <option value="asc">Más antiguos</option>
                                </select>
                            </div>
                        </div>

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
                                        <tbody className="divide-y divide-slate-200 bg-white">
                                            {filteredAndSortedDocuments.map((doc) => (
                                                <tr key={doc.id}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-sky-600 hover:underline cursor-pointer sm:pl-0">{doc.name}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 capitalize">{doc.type}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{new Date(doc.uploadDate).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                                </tr>
                                            ))}
                                             {filteredAndSortedDocuments.length === 0 && (
                                                <tr><td colSpan={3} className="text-center py-8 text-sm text-slate-500">{student.documents.length === 0 ? 'No hay documentos cargados.' : 'No se encontraron documentos con los filtros aplicados.'}</td></tr>
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
