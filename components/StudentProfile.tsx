
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeftIcon, DocumentIcon, ChartBarIcon, WandIcon, UserCircleIcon, UploadIcon, PencilIcon, XMarkIcon, TrashIcon, EyeIcon } from './icons/Icons';
import PiarGenerator from './PiarGenerator';
import ProgressTracking from './ProgressTracking';
import { supabase } from '../services/supabaseClient';
import type { Student, Document, ProgressEntry, UserRole, AuthenticatedUser } from '../types';


interface ManageFamilyModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    allFamilies: AuthenticatedUser[];
    onSave: (familyIds: string[]) => void;
}

const ManageFamilyModal: React.FC<ManageFamilyModalProps> = ({ isOpen, onClose, student, allFamilies, onSave }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>(() => student.family_member_ids || []);

    if (!isOpen) return null;
    
    const handleSelect = (familyId: string) => {
        setSelectedIds(prev =>
            prev.includes(familyId)
                ? prev.filter(id => id !== familyId)
                : [...prev, familyId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(selectedIds);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Administrar Acudientes</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                    Selecciona los acudientes para: <span className="font-semibold text-sky-700">{student.name}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mt-4 max-h-60 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1 bg-slate-50">
                        {allFamilies.map(family => (
                            <label key={family.id} htmlFor={`family-checkbox-${family.id}`} className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer">
                                <input
                                    type="checkbox"
                                    id={`family-checkbox-${family.id}`}
                                    checked={selectedIds.includes(family.id)}
                                    onChange={() => handleSelect(family.id)}
                                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                />
                                <span className="ml-3 text-sm text-slate-700">{family.name}</span>
                            </label>
                        ))}
                         {allFamilies.length === 0 && (
                            <p className="text-xs text-slate-500 text-center p-4">No hay familiares registrados en el sistema.</p>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface EditDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: Document | null;
    onSave: (docId: string, name: string, type: 'informe' | 'evaluacion' | 'PIAR') => void;
}

const EditDocumentModal: React.FC<EditDocumentModalProps> = ({ isOpen, onClose, document, onSave }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'informe' | 'evaluacion' | 'PIAR'>('informe');

    useEffect(() => {
        if (document) {
            setName(document.name);
            setType(document.type);
        }
    }, [document]);

    if (!isOpen || !document) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(document.id, name, type);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Editar Documento</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="doc-name" className="block text-sm font-medium text-slate-700">Nombre del Archivo</label>
                        <input 
                            type="text" 
                            id="doc-name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="doc-type" className="block text-sm font-medium text-slate-700">Tipo de Documento</label>
                        <select 
                            id="doc-type" 
                            value={type} 
                            onChange={(e) => setType(e.target.value as any)} 
                            className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm"
                        >
                            <option value="informe">Informe</option>
                            <option value="evaluacion">Evaluación</option>
                            <option value="PIAR">PIAR</option>
                        </select>
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface StudentProfileProps {
    student: Student;
    onBack: () => void;
    userRole: UserRole;
    onUpdateStudent: (student: Student) => void;
    allUsers: AuthenticatedUser[];
    onUpdateStudentFamily: (studentId: string, familyIds: string[] | null) => void;
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

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack, onUpdateStudent, allUsers, onUpdateStudentFamily }) => {
    const [activeTab, setActiveTab] = useState<ProfileTab>('info');
    const [documentTypeFilter, setDocumentTypeFilter] = useState<'all' | 'informe' | 'evaluacion' | 'PIAR'>('all');
    const [documentSortOrder, setDocumentSortOrder] = useState<'desc' | 'asc'>('desc');
    const [newFile, setNewFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState<string>('');
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editableStudent, setEditableStudent] = useState<Student>(student);
    const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
    
    // Document Editing State
    const [editingDocument, setEditingDocument] = useState<Document | null>(null);

    const assignedFamilyMembers = useMemo(() => {
        if (!student.family_member_ids) return [];
        return allUsers.filter(user => user.role === 'Familia' && student.family_member_ids!.includes(user.id));
    }, [allUsers, student.family_member_ids]);


    const handleDocumentAdd = (document: Document) => {
        const updatedStudent = { ...student, documents: [document, ...student.documents] };
        onUpdateStudent(updatedStudent);
    };

    const handleDeleteDocument = (docId: string) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.')) {
            const updatedDocuments = student.documents.filter(d => d.id !== docId);
            // Note: Actual file deletion from Supabase Storage would happen here in a real implementation
            onUpdateStudent({ ...student, documents: updatedDocuments });
        }
    };

    const handleUpdateDocument = (docId: string, name: string, type: 'informe' | 'evaluacion' | 'PIAR') => {
        const updatedDocuments = student.documents.map(d => 
            d.id === docId ? { ...d, name, type } : d
        );
        onUpdateStudent({ ...student, documents: updatedDocuments });
    };

    const handleProgressAdd = (entry: ProgressEntry) => {
        const updatedStudent = { ...student, progress_entries: [entry, ...student.progress_entries] };
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

    const handleFileUpload = async (event: React.FormEvent) => {
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
        
        setIsUploading(true);
        setUploadError('');

        try {
            const filePath = `${student.id}/${Date.now()}_${newFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('student_documents')
                .upload(filePath, newFile);

            if (uploadError) {
                throw uploadError;
            }

            const { data: urlData } = supabase.storage
                .from('student_documents')
                .getPublicUrl(filePath);

            if (!urlData || !urlData.publicUrl) {
                throw new Error("No se pudo obtener la URL pública del archivo.");
            }

            let docType: 'informe' | 'evaluacion' | 'PIAR' = 'informe';
            const fileNameLower = newFile.name.toLowerCase();
            if (fileNameLower.includes('evaluacion')) docType = 'evaluacion';
            if (fileNameLower.includes('piar')) docType = 'PIAR';

            const newDocument: Document = {
                id: `doc_${Date.now()}`,
                name: newFile.name,
                type: docType,
                uploadDate: new Date().toISOString().split('T')[0],
                url: urlData.publicUrl,
            };

            handleDocumentAdd(newDocument);
            setNewFile(null);
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (error: any) {
            console.error("Error uploading file:", error);
            setUploadError(`Error al subir el archivo: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
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

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'age') {
            setEditableStudent(prev => ({ ...prev, age: parseInt(value, 10) || 0 }));
        } else {
            setEditableStudent(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveChanges = () => {
        onUpdateStudent(editableStudent);
        setIsEditing(false);
    };

    const renderInfoTabContent = () => {
        if (isEditing) {
            return (
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                        <input type="text" id="name" name="name" value={editableStudent.name} onChange={handleEditChange} className="mt-1 input-field" />
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <div>
                            <label htmlFor="age" className="block text-sm font-medium text-slate-700">Edad</label>
                            <input type="number" id="age" name="age" value={editableStudent.age || ''} onChange={handleEditChange} className="mt-1 input-field" />
                        </div>
                         <div>
                            <label htmlFor="grade" className="block text-sm font-medium text-slate-700">Grado</label>
                            <input type="text" id="grade" name="grade" value={editableStudent.grade} onChange={handleEditChange} className="mt-1 input-field" />
                        </div>
                         <div>
                            <label htmlFor="risk_level" className="block text-sm font-medium text-slate-700">Nivel de Riesgo</label>
                            <select id="risk_level" name="risk_level" value={editableStudent.risk_level} onChange={handleEditChange} className="mt-1 input-field">
                                <option value="bajo">Bajo</option>
                                <option value="medio">Medio</option>
                                <option value="alto">Alto</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="diagnosis" className="block text-sm font-medium text-slate-700">Diagnóstico / Resumen</label>
                        <textarea id="diagnosis" name="diagnosis" rows={4} value={editableStudent.diagnosis} onChange={handleEditChange} className="mt-1 input-field" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
                        <button onClick={handleSaveChanges} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">Guardar Cambios</button>
                    </div>
                </div>
            )
        }
        
        return (
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-slate-800">Información del Estudiante</h3>
                    <button onClick={() => setIsEditing(true)} className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Editar Perfil
                    </button>
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <p><span className="font-semibold w-24 inline-block">Nombre:</span> {student.name}</p>
                    <p><span className="font-semibold w-24 inline-block">Edad:</span> {student.age} años</p>
                    <p><span className="font-semibold w-24 inline-block">Grado:</span> {student.grade}</p>
                    <p><span className="font-semibold w-24 inline-block">Docentes:</span> {student.teachers && student.teachers.length > 0 ? student.teachers.join(', ') : 'Sin Asignar'}</p>
                    <div>
                        <p className="font-semibold">Diagnóstico / Resumen:</p>
                        <p className="mt-1 text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-200">{student.diagnosis}</p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-800">Acudientes Asignados</h3>
                         <button onClick={() => setIsFamilyModalOpen(true)} className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                            Administrar Acudientes
                        </button>
                    </div>

                    {assignedFamilyMembers.length > 0 ? (
                        <div className="mt-4 space-y-4">
                            {assignedFamilyMembers.map(familyMember => (
                                <div key={familyMember.id} className="text-sm text-slate-700 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                                    <p><span className="font-semibold w-24 inline-block">Nombre:</span> {familyMember.name}</p>
                                    <p><span className="font-semibold w-24 inline-block">Parentesco:</span> {familyMember.relationship || 'No especificado'}</p>
                                    <p><span className="font-semibold w-24 inline-block">Email:</span> <a href={`mailto:${familyMember.email}`} className="text-sky-600 hover:underline">{familyMember.email}</a></p>
                                    <p><span className="font-semibold w-24 inline-block">Teléfono:</span> {familyMember.phone || 'No especificado'}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-slate-500">No hay acudientes asignados a este estudiante.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return renderInfoTabContent();
            case 'piar':
                return <PiarGenerator student={student} onDocumentAdd={handleDocumentAdd} onUpdateStudent={onUpdateStudent} />;
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
                                <button type="submit" disabled={isUploading || !newFile} className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400">
                                    {isUploading ? (
                                        'Subiendo...'
                                    ) : (
                                        <>
                                            <UploadIcon className="w-5 h-5 mr-2" />
                                            Subir Archivo
                                        </>
                                    )}
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
                                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 bg-white">
                                            {filteredAndSortedDocuments.map((doc) => (
                                                <tr key={doc.id}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-sky-600 sm:pl-0">
                                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                            {doc.name}
                                                        </a>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 capitalize">{doc.type}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{new Date(doc.uploadDate).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-500">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <a 
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1 text-slate-400 hover:text-sky-600 rounded-full hover:bg-sky-50 transition-colors"
                                                                title="Ver Documento"
                                                            >
                                                                <EyeIcon className="w-4 h-4" />
                                                            </a>
                                                            <button 
                                                                onClick={() => setEditingDocument(doc)}
                                                                className="p-1 text-slate-400 hover:text-sky-600 rounded-full hover:bg-sky-50 transition-colors"
                                                                title="Editar"
                                                            >
                                                                <PencilIcon className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteDocument(doc.id)}
                                                                className="p-1 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                                                title="Eliminar"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                             {filteredAndSortedDocuments.length === 0 && (
                                                <tr><td colSpan={4} className="text-center py-8 text-sm text-slate-500">{student.documents.length === 0 ? 'No hay documentos cargados.' : 'No se encontraron documentos con los filtros aplicados.'}</td></tr>
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
            <style>{`
                .input-field {
                    display: block;
                    width: 100%;
                    border-radius: 0.375rem;
                    border: 1px solid #cbd5e1;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    background-color: #f8fafc;
                    color: #1e293b;
                    transition: box-shadow 0.15s ease-in-out, border-color 0.15s ease-in-out;
                }
                .input-field:focus {
                    outline: 2px solid transparent;
                    outline-offset: 2px;
                    border-color: #0ea5e9;
                    box-shadow: 0 0 0 2px #38bdf8;
                }
            `}</style>
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 mr-4 rounded-full hover:bg-slate-200 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6 text-slate-600" />
                </button>
                <img src={student.photo_url} alt={student.name} className="w-16 h-16 rounded-full" />
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
             <ManageFamilyModal
                isOpen={isFamilyModalOpen}
                onClose={() => setIsFamilyModalOpen(false)}
                student={student}
                allFamilies={allUsers.filter(u => u.role === 'Familia')}
                onSave={(familyIds) => {
                    onUpdateStudentFamily(student.id, familyIds);
                    setIsFamilyModalOpen(false);
                }}
            />
            
            <EditDocumentModal 
                isOpen={!!editingDocument}
                onClose={() => setEditingDocument(null)}
                document={editingDocument}
                onSave={handleUpdateDocument}
            />
        </div>
    );
};

export default StudentProfile;
