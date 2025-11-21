
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in px-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Administrar Acudientes</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="mt-4 max-h-60 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1 bg-slate-50">
                    {allFamilies.map(family => (
                        <label key={family.id} className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(family.id)}
                                onChange={() => handleSelect(family.id)}
                                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                            />
                            <span className="ml-3 text-sm text-slate-700">{family.name}</span>
                        </label>
                    ))}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
                    <button onClick={() => onSave(selectedIds)} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700">Guardar</button>
                </div>
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in px-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Editar Documento</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nombre del Archivo</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Tipo</label>
                        <select value={type} onChange={(e) => setType(e.target.value as any)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md">
                            <option value="informe">Informe</option>
                            <option value="evaluacion">Evaluación</option>
                            <option value="PIAR">PIAR</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md">Cancelar</button>
                        <button onClick={() => { onSave(document.id, name, type); onClose(); }} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md">Guardar</button>
                    </div>
                </div>
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

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack, onUpdateStudent, allUsers, onUpdateStudentFamily }) => {
    const [activeTab, setActiveTab] = useState<ProfileTab>('info');
    const [isEditing, setIsEditing] = useState(false);
    const [editableStudent, setEditableStudent] = useState<Student>(student);
    const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
    const [newFile, setNewFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);

    const assignedFamilyMembers = allUsers.filter(user => user.role === 'Familia' && student.family_member_ids?.includes(user.id));

    const handleDocumentAdd = (document: Document) => {
        onUpdateStudent({ ...student, documents: [document, ...student.documents] });
    };

    const handleDeleteDocument = (docId: string) => {
        if (window.confirm('¿Eliminar este documento?')) {
            const updatedDocs = student.documents.filter(d => d.id !== docId);
            onUpdateStudent({ ...student, documents: updatedDocs });
        }
    };

    const handleUpdateDocument = (docId: string, name: string, type: 'informe' | 'evaluacion' | 'PIAR') => {
        const updatedDocs = student.documents.map(d => d.id === docId ? { ...d, name, type } : d);
        onUpdateStudent({ ...student, documents: updatedDocs });
    };

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFile) return;
        setIsUploading(true);
        try {
            const filePath = `${student.id}/${Date.now()}_${newFile.name}`;
            const { error } = await supabase.storage.from('student_documents').upload(filePath, newFile);
            if (error) throw error;
            
            const { data } = supabase.storage.from('student_documents').getPublicUrl(filePath);
            const newDoc: Document = {
                id: `doc_${Date.now()}`,
                name: newFile.name,
                type: newFile.name.toLowerCase().includes('piar') ? 'PIAR' : 'informe',
                uploadDate: new Date().toISOString().split('T')[0],
                url: data.publicUrl
            };
            handleDocumentAdd(newDoc);
            setNewFile(null);
        } catch (err) {
            console.error(err);
            alert("Error al subir archivo");
        } finally {
            setIsUploading(false);
        }
    };

    const renderDocumentsTab = () => (
        <div className="p-4 md:p-6">
            <div className="flex justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Documentos</h3>
            </div>
            <form onSubmit={handleFileUpload} className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subir Documento (PDF/DOCX)</label>
                    <input type="file" onChange={(e) => setNewFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                </div>
                <button type="submit" disabled={!newFile || isUploading} className="w-full md:w-auto px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium disabled:bg-slate-400">
                    {isUploading ? 'Subiendo...' : 'Subir'}
                </button>
            </form>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                        <tr>
                            <th className="px-3 py-3 text-left text-sm font-semibold text-slate-900">Nombre</th>
                            <th className="px-3 py-3 text-left text-sm font-semibold text-slate-900">Tipo</th>
                            <th className="px-3 py-3 text-left text-sm font-semibold text-slate-900">Fecha</th>
                            <th className="px-3 py-3 text-right text-sm font-semibold text-slate-900">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {student.documents.map((doc) => (
                            <tr key={doc.id}>
                                <td className="px-3 py-4 text-sm font-medium text-sky-600 max-w-[150px] truncate" title={doc.name}>
                                    <a href={doc.url} target="_blank" rel="noreferrer">{doc.name}</a>
                                </td>
                                <td className="px-3 py-4 text-sm text-slate-500 capitalize">{doc.type}</td>
                                <td className="px-3 py-4 text-sm text-slate-500 whitespace-nowrap">{doc.uploadDate}</td>
                                <td className="px-3 py-4 text-sm text-right whitespace-nowrap">
                                    <div className="flex justify-end gap-2">
                                        <a href={doc.url} target="_blank" rel="noreferrer" className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-full" title="Ver">
                                            <EyeIcon className="w-4 h-4" />
                                        </a>
                                        <button onClick={() => setEditingDoc(doc)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full" title="Editar">
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteDocument(doc.id)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full" title="Eliminar">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {student.documents.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-3 py-8 text-center text-sm text-slate-500">No hay documentos guardados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <EditDocumentModal isOpen={!!editingDoc} onClose={() => setEditingDoc(null)} document={editingDoc} onSave={handleUpdateDocument} />
        </div>
    );

    return (
        <div className="p-4 md:p-8">
            <header className="flex flex-col md:flex-row md:items-center mb-6 gap-4">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 mr-2 rounded-full hover:bg-slate-200 transition-colors flex-shrink-0">
                        <ArrowLeftIcon className="w-6 h-6 text-slate-600" />
                    </button>
                    <img src={student.photo_url} alt={student.name} className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover flex-shrink-0" />
                    <div className="ml-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">{student.name}</h1>
                        <p className="text-slate-500">{student.grade}</p>
                    </div>
                </div>
            </header>
            
            <div className="bg-white rounded-xl shadow-sm w-full overflow-hidden">
                <div className="border-b border-slate-200 overflow-x-auto">
                    <nav className="-mb-px flex space-x-8 px-6 min-w-max">
                        <button onClick={() => setActiveTab('info')} className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'info' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500'}`}>Información</button>
                        <button onClick={() => setActiveTab('piar')} className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'piar' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500'}`}>Generador PIAR</button>
                        <button onClick={() => setActiveTab('documents')} className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'documents' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500'}`}>Documentos</button>
                        <button onClick={() => setActiveTab('progress')} className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'progress' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500'}`}>Seguimiento</button>
                    </nav>
                </div>
                
                {activeTab === 'info' && (
                    <div className="p-4 md:p-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">Información del Estudiante</h3>
                            <button onClick={() => setIsEditing(!isEditing)} className="text-sky-600 text-sm font-medium">{isEditing ? 'Cancelar' : 'Editar'}</button>
                        </div>
                        {isEditing ? (
                            <div className="mt-4 space-y-4">
                                <input value={editableStudent.name} onChange={e => setEditableStudent({...editableStudent, name: e.target.value})} className="block w-full border border-slate-300 rounded-md p-2 text-sm"/>
                                <textarea value={editableStudent.diagnosis} onChange={e => setEditableStudent({...editableStudent, diagnosis: e.target.value})} className="block w-full border border-slate-300 rounded-md p-2 text-sm" rows={3}/>
                                <button onClick={() => { onUpdateStudent(editableStudent); setIsEditing(false); }} className="bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-medium">Guardar</button>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3 text-sm text-slate-700">
                                <p className="break-words"><span className="font-bold block md:inline md:w-24">Nombre:</span> {student.name}</p>
                                <p className="break-words"><span className="font-bold block md:inline md:w-24">Edad:</span> {student.age}</p>
                                <p className="break-words"><span className="font-bold block md:inline md:w-24">Grado:</span> {student.grade}</p>
                                <p className="break-words"><span className="font-bold block md:inline md:w-24">Diagnóstico:</span> {student.diagnosis}</p>
                            </div>
                        )}
                        <div className="mt-8 pt-6 border-t border-slate-200">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-slate-800">Acudientes</h3>
                                <button onClick={() => setIsFamilyModalOpen(true)} className="text-sm text-sky-600 font-medium">Administrar</button>
                             </div>
                             {assignedFamilyMembers.length > 0 ? assignedFamilyMembers.map(f => (
                                 <div key={f.id} className="p-3 bg-slate-50 rounded-lg mb-2 border border-slate-200 text-sm">
                                     <span className="font-semibold">{f.name}</span> ({f.relationship || 'Familiar'}) - <span className="break-all">{f.email}</span>
                                 </div>
                             )) : <p className="text-sm text-slate-500 italic">No hay acudientes asignados.</p>}
                        </div>
                    </div>
                )}
                {activeTab === 'piar' && <PiarGenerator student={student} onDocumentAdd={handleDocumentAdd} onUpdateStudent={onUpdateStudent} />}
                {activeTab === 'documents' && renderDocumentsTab()}
                {activeTab === 'progress' && <ProgressTracking student={student} onProgressAdd={(entry) => onUpdateStudent({ ...student, progress_entries: [entry, ...student.progress_entries] })} />}
            </div>
            <ManageFamilyModal isOpen={isFamilyModalOpen} onClose={() => setIsFamilyModalOpen(false)} student={student} allFamilies={allUsers.filter(u => u.role === 'Familia')} onSave={(ids) => { onUpdateStudentFamily(student.id, ids); setIsFamilyModalOpen(false); }} />
        </div>
    );
};

export default StudentProfile;
