
import React, { useState, useCallback, useEffect } from 'react';
import { generatePiar, analyzePiar } from '../services/geminiService';
import { WandIcon, ExportIcon, SaveIcon, TrashIcon, PlusIcon, UploadIcon, CheckCircleIcon, SparklesIcon } from './icons/Icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { PiarData, Document, Student } from '../types';
import { supabase } from '../services/supabaseClient';

type PiarMode = 'generate' | 'analyze';

interface PiarGeneratorProps {
    student: Student;
    onDocumentAdd: (document: Document) => void;
    onUpdateStudent: (student: Student) => void;
}

const LoadingSpinner = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center text-center p-8">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-slate-600 font-medium">{text}</p>
    </div>
);

const PiarGenerator: React.FC<PiarGeneratorProps> = ({ student, onDocumentAdd, onUpdateStudent }) => {
    const [piarData, setPiarData] = useState<PiarData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [diagnosisText, setDiagnosisText] = useState(student.diagnosis);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    
    const [mode, setMode] = useState<PiarMode>('generate');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisSuccess, setAnalysisSuccess] = useState<boolean>(false);

    useEffect(() => {
        const piarDoc = student.documents
            .filter(d => d.type === 'PIAR' && d.content)
            .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())[0];
        
        if (piarDoc && piarDoc.content) {
            setPiarData(piarDoc.content as PiarData);
        } else {
            setPiarData(null);
        }
    }, [student.documents]);

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setPiarData(null);
        try {
            const data = await generatePiar(diagnosisText, student.grade, student.age);
            if (data) {
                setPiarData(data);
            } else {
                setError("No se pudo generar el PIAR.");
            }
        } catch (err) {
            setError("Error al contactar el servicio de IA.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [diagnosisText, student.grade, student.age]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setUploadedFile(event.target.files[0]);
            setAnalysisError(null);
            setAnalysisSuccess(false);
        }
    };
    
    const handleAnalyze = async () => {
        if (!uploadedFile) return;
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysisSuccess(false);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const fileContent = e.target?.result as string;
            if (!fileContent) {
                setAnalysisError("No se pudo leer el archivo.");
                setIsAnalyzing(false);
                return;
            }

            try {
                // Use Gemini 3 Pro to structure the document into editable JSON
                const improvedPiarData = await analyzePiar(student.diagnosis, fileContent);
                
                if (improvedPiarData) {
                    setPiarData(improvedPiarData);
                    setAnalysisSuccess(true);
                    // Switch to editor mode to let user review before saving
                    setTimeout(() => {
                        setMode('generate');
                        setAnalysisSuccess(false); 
                    }, 1500);
                } else {
                    setAnalysisError("No se pudo estructurar el PIAR.");
                }
            } catch (err) {
                setAnalysisError("Error al analizar el documento.");
                console.error(err);
            } finally {
                setIsAnalyzing(false);
            }
        };
        reader.readAsText(uploadedFile);
    };
    
    const generatePdfBlob = (data: PiarData): Blob => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        let y = 15;
    
        const addSection = (title: string, content: () => void) => {
            if (y > pageHeight - 40) {
                doc.addPage();
                y = 15;
            }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(30, 41, 59);
            doc.text(title, 14, y);
            y += 8;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(51, 65, 85);
            content();
            y += 10; 
        };
    
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`PIAR - ${student.name}`, 105, y, { align: 'center' });
        y += 15;
    
        addSection('Resumen del Diagnóstico', () => {
            const text = doc.splitTextToSize(data.resumen_diagnostico, 180);
            doc.text(text, 14, y);
            y += text.length * 5;
        });
    
        addSection('Fortalezas y Barreras', () => {
            (doc as any).autoTable({
                startY: y,
                head: [['Fortalezas', 'Barreras']],
                body: [[
                    data.fortalezas.map(f => `• ${f}`).join('\n'),
                    data.barreras_aprendizaje.map(b => `• ${b}`).join('\n')
                ]],
                theme: 'grid',
                headStyles: { fillColor: [2, 132, 199] },
            });
            y = (doc as any).lastAutoTable.finalY + 10;
        });
    
        addSection('Ajustes Razonables', () => {
            (doc as any).autoTable({
                startY: y,
                head: [['Área', 'Ajustes']],
                body: data.ajustes_razonables.map(i => [i.area, i.ajustes.map(a => `• ${a}`).join('\n')]),
                theme: 'striped',
                headStyles: { fillColor: [2, 132, 199] },
            });
            y = (doc as any).lastAutoTable.finalY + 10;
        });

        if (data.actividades_refuerzo) {
            addSection('Actividades de Refuerzo', () => {
                 (doc as any).autoTable({
                    startY: y,
                    head: [['Área', 'Actividades']],
                    body: data.actividades_refuerzo.map(i => [i.area, i.actividades.map(a => `• ${a}`).join('\n')]),
                    theme: 'striped',
                    headStyles: { fillColor: [2, 132, 199] },
                });
                y = (doc as any).lastAutoTable.finalY + 10;
            });
        }
    
        addSection('Seguimiento', () => {
            const text = doc.splitTextToSize(data.estrategias_seguimiento.join('\n• '), 180);
            doc.text(text, 14, y);
            y += text.length * 5;
        });

        return doc.output('blob');
    };

    const handleSaveChanges = async () => {
        if (!piarData) return;
        setSaveStatus('saving');
        
        try {
            // 1. Generate PDF
            const pdfBlob = generatePdfBlob(piarData);
            const fileName = `PIAR_${student.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
            const filePath = `${student.id}/${fileName}`;

            // 2. Upload to Supabase
            const { error: uploadError } = await supabase.storage
                .from('student_documents')
                .upload(filePath, pdfBlob, { contentType: 'application/pdf' });

            if (uploadError) throw uploadError;

            // 3. Get URL
            const { data: urlData } = supabase.storage.from('student_documents').getPublicUrl(filePath);

            // 4. Save Metadata
            const newDocument: Document = {
                id: `doc_piar_${Date.now()}`,
                name: fileName,
                type: 'PIAR',
                uploadDate: new Date().toISOString().split('T')[0],
                url: urlData.publicUrl,
                content: piarData
            };

            const updatedDocuments = [newDocument, ...student.documents];
            onUpdateStudent({ ...student, documents: updatedDocuments });
            onDocumentAdd(newDocument);

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);

        } catch (error) {
            console.error("Error saving PIAR:", error);
            setError("Error al guardar el documento.");
            setSaveStatus('idle');
        }
    };

    const handleExportPdf = () => {
        if (!piarData) return;
        const blob = generatePdfBlob(piarData);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `PIAR_${student.name}.pdf`;
        link.click();
    };
    
    // Helper functions for editing state
    const handleListUpdate = (field: keyof PiarData, index: number, value: string) => { setPiarData(prev => { if (!prev) return null; if (!Array.isArray(prev[field])) return prev; const list = [...(prev[field] as string[])]; list[index] = value; return { ...prev, [field]: list }; }); };
    const addListItem = (field: keyof PiarData) => { setPiarData(prev => { if (!prev || !Array.isArray(prev[field])) return null; const list = [...(prev[field] as string[]), '']; return { ...prev, [field]: list }; }); };
    const removeListItem = (field: keyof PiarData, index: number) => { setPiarData(prev => { if (!prev || !Array.isArray(prev[field])) return null; const list = (prev[field] as string[]).filter((_, i) => i !== index); return { ...prev, [field]: list }; }); };
    const handleAdjustmentChange = (areaIndex: number, ajusteIndex: number, value: string) => { setPiarData(prev => { if (!prev) return null; const updated = JSON.parse(JSON.stringify(prev.ajustes_razonables)); updated[areaIndex].ajustes[ajusteIndex] = value; return { ...prev, ajustes_razonables: updated }; }); };
    const addAdjustment = (areaIndex: number) => { setPiarData(prev => { if (!prev) return null; const updated = JSON.parse(JSON.stringify(prev.ajustes_razonables)); updated[areaIndex].ajustes.push(''); return { ...prev, ajustes_razonables: updated }; }); };
    const removeAdjustment = (areaIndex: number, ajusteIndex: number) => { setPiarData(prev => { if (!prev) return null; const updated = JSON.parse(JSON.stringify(prev.ajustes_razonables)); updated[areaIndex].ajustes.splice(ajusteIndex, 1); return { ...prev, ajustes_razonables: updated }; }); };
    
    // UI Components
    const ModeButton = ({ label, targetMode }: { label: string, targetMode: PiarMode }) => {
        const isActive = mode === targetMode;
        return (
            <button
                onClick={() => setMode(targetMode)}
                className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors flex-shrink-0 ${isActive ? 'border-sky-500 text-sky-600 bg-sky-50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="p-4 md:p-6">
            <div className="mb-6 flex border-b border-slate-200 overflow-x-auto">
                <ModeButton label="Editor PIAR (Generador)" targetMode="generate" />
                <ModeButton label="Analizar y Mejorar Documento" targetMode="analyze" />
            </div>
            
            {mode === 'generate' && (
                <>
                    {!piarData && (
                        <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                            <label className="block text-sm font-medium text-slate-700">Diagnóstico para generar con IA</label>
                            <textarea rows={4} className="mt-2 block w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" value={diagnosisText} onChange={(e) => setDiagnosisText(e.target.value)} />
                            <div className="mt-3 text-right">
                                <button onClick={handleGenerate} disabled={isLoading} className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400">
                                    <WandIcon className="w-5 h-5 mr-2" />
                                    {isLoading ? 'Generando...' : 'Generar PIAR'}
                                </button>
                            </div>
                        </div>
                    )}
                    {isLoading && <LoadingSpinner text="Generando borrador..." />}
                </>
            )}

            {mode === 'analyze' && (
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 text-center">
                    <UploadIcon className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">Analizar Documento Existente</h3>
                    <p className="text-sm text-slate-500 mb-4">Sube un archivo de texto (.txt) para que Gemini 3 Pro lo analice y estructure en el editor.</p>
                    <input type="file" onChange={handleFileChange} accept=".txt" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 mx-auto max-w-xs"/>
                    <button onClick={handleAnalyze} disabled={!uploadedFile || isAnalyzing} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400">
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        {isAnalyzing ? 'Analizando...' : 'Analizar y Editar'}
                    </button>
                    {isAnalyzing && <LoadingSpinner text="Procesando documento..." />}
                    {analysisError && <p className="text-red-600 mt-2">{analysisError}</p>}
                </div>
            )}
            
            {analysisSuccess && (
                <div className="my-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-r-lg flex items-center">
                    <CheckCircleIcon className="w-6 h-6 mr-3 flex-shrink-0"/>
                    <p>¡Análisis completado! Editando contenido...</p>
                </div>
            )}

            {piarData && mode === 'generate' && (
                 <div className="border border-slate-200 rounded-lg p-4 md:p-6 bg-white shadow-sm mt-4 animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h3 className="text-xl font-bold text-slate-800">Editor PIAR</h3>
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                             <button onClick={handleSaveChanges} disabled={saveStatus === 'saving'} className="flex-1 md:flex-none inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400">
                                <SaveIcon className="w-4 h-4 mr-2" />
                                {saveStatus === 'saving' ? 'Guardando...' : 'Guardar'}
                            </button>
                             <button onClick={handleExportPdf} className="flex-1 md:flex-none inline-flex justify-center items-center px-3 py-1.5 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                                <ExportIcon className="w-4 h-4 mr-2" />
                                Vista Previa
                            </button>
                             <button onClick={() => setPiarData(null)} className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-sky-700 mb-2">Resumen Diagnóstico</h4>
                            <textarea value={piarData.resumen_diagnostico} onChange={(e) => setPiarData({...piarData, resumen_diagnostico: e.target.value})} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 p-2 border" rows={3} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sky-700 mb-2">Fortalezas</h4>
                            {piarData.fortalezas.map((item, i) => (
                                <div key={i} className="flex gap-2 mb-2"><input value={item} onChange={(e) => handleListUpdate('fortalezas', i, e.target.value)} className="w-full text-sm border-slate-300 rounded-md p-2 border"/><button onClick={() => removeListItem('fortalezas', i)}><TrashIcon className="w-4 h-4 text-slate-400"/></button></div>
                            ))}
                            <button onClick={() => addListItem('fortalezas')} className="text-sm text-sky-600 font-medium">+ Añadir Fortaleza</button>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sky-700 mb-2">Ajustes Razonables</h4>
                            {piarData.ajustes_razonables.map((area, ai) => (
                                <div key={ai} className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
                                    <h5 className="font-bold text-slate-700 mb-2">{area.area}</h5>
                                    {area.ajustes.map((aj, ji) => (
                                        <div key={ji} className="flex gap-2 mb-2"><input value={aj} onChange={(e) => handleAdjustmentChange(ai, ji, e.target.value)} className="w-full text-sm border-slate-300 rounded-md p-2 border"/><button onClick={() => removeAdjustment(ai, ji)}><TrashIcon className="w-4 h-4 text-slate-400"/></button></div>
                                    ))}
                                    <button onClick={() => addAdjustment(ai)} className="text-sm text-sky-600 font-medium">+ Añadir Ajuste</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PiarGenerator;
