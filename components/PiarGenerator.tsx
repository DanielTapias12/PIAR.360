

import React, { useState, useCallback, useEffect } from 'react';
import { generatePiar, analyzePiar } from '../services/geminiService';
import { WandIcon, ExportIcon, SaveIcon, TrashIcon, PlusIcon, UploadIcon, CheckCircleIcon } from './icons/Icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { PiarData, Document, Student } from '../types';

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
        <p className="text-sm text-slate-500">Esto puede tardar unos segundos.</p>
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
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisSuccess, setAnalysisSuccess] = useState<boolean>(false);

    useEffect(() => {
        // Load PIAR data from the most recent PIAR document in the student prop
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
            const data = await generatePiar(diagnosisText, student.grade);
            if (data) {
                setPiarData(data);
                const newPiarDocument: Document = {
                    id: `doc_piar_gen_${Date.now()}`,
                    name: `PIAR_IA_${student.name.replace(/\s/g, '_')}.json`,
                    type: 'PIAR',
                    uploadDate: new Date().toISOString().split('T')[0],
                    url: '#',
                    content: data, // Store the generated data within the document
                };
                onDocumentAdd(newPiarDocument);
            } else {
                setError("No se pudo generar el PIAR. La respuesta de la IA fue inválida.");
            }
        } catch (err) {
            setError("Ocurrió un error al contactar el servicio de IA. Por favor, revise la configuración de la API Key.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [diagnosisText, student.grade, student.name, onDocumentAdd]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setUploadedFile(event.target.files[0]);
            setAnalysisResult(null);
            setAnalysisError(null);
            setAnalysisSuccess(false);
        }
    };
    
    const handleAnalyze = async () => {
        if (!uploadedFile) return;
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysisResult(null);
        setAnalysisSuccess(false);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const fileContent = e.target?.result as string;
            if (!fileContent) {
                setAnalysisError("No se pudo leer el contenido del archivo.");
                setIsAnalyzing(false);
                return;
            }

            try {
                const result = await analyzePiar(student.diagnosis, fileContent);
                if (result) {
                    setAnalysisResult(result);
                    onDocumentAdd({
                        id: `doc_analyzed_${Date.now()}`,
                        name: uploadedFile.name,
                        type: 'informe',
                        uploadDate: new Date().toISOString().split('T')[0],
                        url: '#',
                    });
                    setAnalysisSuccess(true);
                } else {
                    setAnalysisError("No se pudo analizar el PIAR.");
                }
            } catch (err) {
                setAnalysisError("Ocurrió un error al contactar el servicio de IA.");
            } finally {
                setIsAnalyzing(false);
            }
        };
        reader.readAsText(uploadedFile);
    };
    
    const handleSaveChanges = () => {
        if (!piarData) return;
        setSaveStatus('saving');
        
        const piarDocs = student.documents.filter(d => d.type === 'PIAR');
        if (piarDocs.length > 0) {
            const latestPiarDoc = piarDocs.sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())[0];
            const updatedDocuments = student.documents.map(doc => 
                doc.id === latestPiarDoc.id ? { ...doc, content: piarData } : doc
            );
            onUpdateStudent({ ...student, documents: updatedDocuments });
        } else {
            onDocumentAdd({
                id: `doc_piar_save_${Date.now()}`,
                name: `PIAR_${student.name.replace(/\s/g, '_')}.json`,
                type: 'PIAR',
                uploadDate: new Date().toISOString().split('T')[0],
                url: '#',
                content: piarData
            });
        }
        
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
    };

    const handleExportPdf = () => {
        if (!piarData) return;
    
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        let y = 15;
    
        // Helper to add sections and manage page breaks
        const addSection = (title: string, content: () => void) => {
            if (y > pageHeight - 40) { // Check if space is enough for a new section
                doc.addPage();
                y = 15;
            }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text(title, 14, y);
            y += 8;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            content();
            y += 10; // Space after section
        };
    
        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`Plan Individualizado de Ajustes Razonables (PIAR)`, 105, y, { align: 'center' });
        y += 8;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Estudiante: ${student.name}`, 105, y, { align: 'center' });
        y += 15;
    
        // Resumen Diagnóstico
        addSection('Resumen del Diagnóstico', () => {
            const text = doc.splitTextToSize(piarData.resumen_diagnostico, 180);
            doc.text(text, 14, y);
            y += text.length * 5;
        });
    
        // Fortalezas y Barreras (side by side)
        addSection('Fortalezas y Barreras', () => {
            (doc as any).autoTable({
                startY: y,
                head: [['Fortalezas', 'Barreras de Aprendizaje']],
                body: [
                    [
                        piarData.fortalezas.map(f => `- ${f}`).join('\n'),
                        piarData.barreras_aprendizaje.map(b => `- ${b}`).join('\n')
                    ]
                ],
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 2 },
                headStyles: { fillColor: [22, 163, 74], textColor: 255 },
            });
            y = (doc as any).lastAutoTable.finalY;
        });
    
        // Ajustes Razonables
        addSection('Ajustes Razonables', () => {
            (doc as any).autoTable({
                startY: y,
                head: [['Área/Materia', 'Ajustes Propuestos']],
                body: piarData.ajustes_razonables.map(item => [
                    item.area,
                    item.ajustes.map(a => `- ${a}`).join('\n')
                ]),
                theme: 'striped',
                styles: { fontSize: 9, cellPadding: 2 },
                headStyles: { fillColor: [8, 145, 178] },
            });
             y = (doc as any).lastAutoTable.finalY;
        });

        // Actividades de Refuerzo
        addSection('Actividades de Refuerzo', () => {
            (doc as any).autoTable({
                startY: y,
                head: [['Área de Refuerzo', 'Actividades Sugeridas']],
                body: piarData.actividades_refuerzo.map(item => [
                    item.area,
                    item.actividades.map(a => `- ${a}`).join('\n')
                ]),
                theme: 'striped',
                styles: { fontSize: 9, cellPadding: 2 },
                headStyles: { fillColor: [8, 145, 178] },
            });
             y = (doc as any).lastAutoTable.finalY;
        });
    
        // Estrategias de Seguimiento
        addSection('Estrategias de Seguimiento', () => {
            const text = doc.splitTextToSize(piarData.estrategias_seguimiento.join('\n'), 180);
            doc.text(text, 14, y);
             y += text.length * 5;
        });
    
        doc.save(`PIAR_${student.name.replace(/\s/g, '_')}.pdf`);
    };
    
    // Editable PIAR handlers
    const handleListUpdate = (field: keyof PiarData, index: number, value: string) => { setPiarData(prev => { if (!prev) return null; if (!Array.isArray(prev[field])) return prev; const list = [...(prev[field] as string[])]; list[index] = value; return { ...prev, [field]: list }; }); };
    const addListItem = (field: keyof PiarData) => { setPiarData(prev => { if (!prev || !Array.isArray(prev[field])) return null; const list = [...(prev[field] as string[]), '']; return { ...prev, [field]: list }; }); };
    const removeListItem = (field: keyof PiarData, index: number) => { setPiarData(prev => { if (!prev || !Array.isArray(prev[field])) return null; const list = (prev[field] as string[]).filter((_, i) => i !== index); return { ...prev, [field]: list }; }); };
    const handleAreaTitleChange = (areaIndex: number, value: string) => { setPiarData(prev => { if (!prev) return null; const updatedAjustes = prev.ajustes_razonables.map((area, i) => i === areaIndex ? { ...area, area: value } : area); return { ...prev, ajustes_razonables: updatedAjustes }; }); };
    const removeAdjustmentArea = (areaIndex: number) => { setPiarData(prev => { if (!prev) return null; const updatedAjustes = prev.ajustes_razonables.filter((_, i) => i !== areaIndex); return { ...prev, ajustes_razonables: updatedAjustes }; }); };
    const addAdjustmentArea = () => { setPiarData(prev => { if (!prev) return null; const newArea = { area: 'Nueva Área', ajustes: [''] }; return { ...prev, ajustes_razonables: [...prev.ajustes_razonables, newArea] }; }); };
    const handleAdjustmentChange = (areaIndex: number, ajusteIndex: number, value: string) => { setPiarData(prev => { if (!prev) return null; const updatedAjustes = JSON.parse(JSON.stringify(prev.ajustes_razonables)); updatedAjustes[areaIndex].ajustes[ajusteIndex] = value; return { ...prev, ajustes_razonables: updatedAjustes }; }); };
    const addAdjustment = (areaIndex: number) => { setPiarData(prev => { if (!prev) return null; const updatedAjustes = JSON.parse(JSON.stringify(prev.ajustes_razonables)); updatedAjustes[areaIndex].ajustes.push(''); return { ...prev, ajustes_razonables: updatedAjustes }; }); };
    const removeAdjustment = (areaIndex: number, ajusteIndex: number) => { setPiarData(prev => { if (!prev) return null; const updatedAjustes = JSON.parse(JSON.stringify(prev.ajustes_razonables)); updatedAjustes[areaIndex].ajustes.splice(ajusteIndex, 1); return { ...prev, ajustes_razonables: updatedAjustes }; }); };
    const handleRefuerzoAreaTitleChange = (areaIndex: number, value: string) => { setPiarData(prev => { if (!prev) return null; const updatedActividades = prev.actividades_refuerzo.map((area, i) => i === areaIndex ? { ...area, area: value } : area); return { ...prev, actividades_refuerzo: updatedActividades }; }); };
    const removeRefuerzoArea = (areaIndex: number) => { setPiarData(prev => { if (!prev) return null; const updatedActividades = prev.actividades_refuerzo.filter((_, i) => i !== areaIndex); return { ...prev, actividades_refuerzo: updatedActividades }; }); };
    const addRefuerzoArea = () => { setPiarData(prev => { if (!prev) return null; const newArea = { area: 'Nueva Área de Refuerzo', actividades: [''] }; return { ...prev, actividades_refuerzo: [...(prev.actividades_refuerzo || []), newArea] }; }); };
    const handleRefuerzoActividadChange = (areaIndex: number, actividadIndex: number, value: string) => { setPiarData(prev => { if (!prev) return null; const updatedActividades = JSON.parse(JSON.stringify(prev.actividades_refuerzo)); updatedActividades[areaIndex].actividades[actividadIndex] = value; return { ...prev, actividades_refuerzo: updatedActividades }; }); };
    const addRefuerzoActividad = (areaIndex: number) => { setPiarData(prev => { if (!prev) return null; const updatedActividades = JSON.parse(JSON.stringify(prev.actividades_refuerzo)); updatedActividades[areaIndex].actividades.push(''); return { ...prev, actividades_refuerzo: updatedActividades }; }); };
    const removeRefuerzoActividad = (areaIndex: number, actividadIndex: number) => { setPiarData(prev => { if (!prev) return null; const updatedActividades = JSON.parse(JSON.stringify(prev.actividades_refuerzo)); updatedActividades[areaIndex].actividades.splice(actividadIndex, 1); return { ...prev, actividades_refuerzo: updatedActividades }; }); };


    const ModeButton = ({ label, targetMode }: { label: string, targetMode: PiarMode }) => {
        const isActive = mode === targetMode;
        const activeClasses = "border-sky-500 text-sky-600";
        const inactiveClasses = "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300";
        return (
            <button
                onClick={() => setMode(targetMode)}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? activeClasses : inactiveClasses}`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="p-6">
            <div className="bg-sky-50 border-l-4 border-sky-500 text-sky-800 p-4 rounded-r-lg mb-6" role="alert">
                <p className="font-bold">Nota sobre Normativa</p>
                <p className="text-sm">La estructura y sugerencias de este PIAR se basan en los lineamientos del Decreto 1421 de 2017 de Colombia para la educación inclusiva.</p>
            </div>
            
             <div className="mb-6 border-b border-slate-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <ModeButton label="Generar con IA" targetMode="generate" />
                    <ModeButton label="Analizar Documento" targetMode="analyze" />
                </nav>
            </div>
            
            {mode === 'generate' && (
                <>
                    <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                        <label htmlFor="diagnosis" className="block text-sm font-medium text-slate-700">Diagnóstico y Fuentes de Información</label>
                        <p className="mt-1 text-xs text-slate-500">Incluya un resumen consolidado de evaluaciones, informes y observaciones para obtener la mejor sugerencia de la IA.</p>
                        <textarea id="diagnosis" rows={4} className="mt-2 block w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" value={diagnosisText} onChange={(e) => setDiagnosisText(e.target.value)} />
                        <div className="mt-3 text-right">
                            <button onClick={handleGenerate} disabled={isLoading} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed">
                                <WandIcon className="w-5 h-5 mr-2" />
                                {isLoading ? 'Generando...' : 'Generar PIAR con IA'}
                            </button>
                        </div>
                    </div>
                    {isLoading && <LoadingSpinner text="Generando borrador del PIAR con IA..." />}
                </>
            )}

            {mode === 'analyze' && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                    <label className="block text-sm font-medium text-slate-700">Analizar PIAR Existente</label>
                    <p className="mt-1 text-xs text-slate-500">Suba un documento de PIAR para que la IA lo analice y le ofrezca recomendaciones de mejora.</p>
                    <div className="mt-4">
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="piar-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-100 hover:bg-slate-200 transition">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadIcon className="w-10 h-10 mb-3 text-slate-400" />
                                    <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click para subir</span> o arrastra y suelta</p>
                                    <p className="text-xs text-slate-400">Solo archivos de texto (.txt) son soportados actualmente.</p>
                                </div>
                                <input id="piar-upload" type="file" className="hidden" onChange={handleFileChange} accept=".txt" />
                            </label>
                        </div>
                        {uploadedFile && <p className="mt-3 text-sm text-slate-600 text-center">Archivo seleccionado: <span className="font-medium">{uploadedFile.name}</span></p>}
                    </div>
                    <div className="mt-4 text-right">
                        <button onClick={handleAnalyze} disabled={!uploadedFile || isAnalyzing} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed">
                            <WandIcon className="w-5 h-5 mr-2" />
                            {isAnalyzing ? 'Analizando...' : 'Analizar PIAR'}
                        </button>
                    </div>
                    {isAnalyzing && <LoadingSpinner text="Analizando documento..." />}
                </div>
            )}
            
            {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
            {analysisError && <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">{analysisError}</div>}
            
            {analysisSuccess && (
                <div className="my-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-r-lg" role="alert">
                    <div className="flex items-center">
                        <CheckCircleIcon className="w-6 h-6 mr-3"/>
                        <div>
                            <p className="font-bold">Análisis completado y documento guardado</p>
                            <p className="text-sm">El archivo '{uploadedFile?.name}' se ha añadido a la pestaña de 'Documentos' del estudiante.</p>
                        </div>
                    </div>
                </div>
            )}

            {analysisResult && (
                 <div className="border border-slate-200 rounded-lg p-6 animate-fade-in">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Recomendaciones de la IA</h3>
                    <p className="text-sm text-slate-500 mb-4">Basado en el documento '{uploadedFile?.name}' y el diagnóstico del estudiante.</p>
                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                        {analysisResult}
                    </div>
                 </div>
            )}

            {piarData && mode === 'generate' && (
                 <div className="border border-slate-200 rounded-lg p-6 animate-fade-in">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Editor del PIAR para {student.name}</h3>
                            <p className="text-sm text-slate-500">Borrador generado por IA. Revise y ajuste según sea necesario.</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={handleSaveChanges} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                                <SaveIcon className="w-4 h-4 mr-2" />
                                {saveStatus === 'saved' ? '¡Guardado!' : 'Guardar Cambios'}
                            </button>
                             <button onClick={handleExportPdf} className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                                <ExportIcon className="w-4 h-4 mr-2" />
                                Exportar a PDF
                            </button>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-lg font-semibold text-sky-700 mb-2">Resumen del Diagnóstico</h4>
                            <textarea value={piarData.resumen_diagnostico} onChange={(e) => setPiarData({...piarData, resumen_diagnostico: e.target.value})} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" rows={3} />
                        </div>
                        {Object.keys(piarData).filter(k => Array.isArray(piarData[k as keyof PiarData]) && k !== 'ajustes_razonables' && k !== 'actividades_refuerzo').map(key => (
                            <div key={key}>
                                <h4 className="text-lg font-semibold text-sky-700 mb-2 capitalize">{key.replace(/_/g, ' ')}</h4>
                                <div className="space-y-2">
                                    {(piarData[key as keyof PiarData] as string[]).map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input type="text" value={item} onChange={(e) => handleListUpdate(key as keyof PiarData, index, e.target.value)} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" />
                                            <button onClick={() => removeListItem(key as keyof PiarData, index)} className="p-1 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-100 transition"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                                 <button onClick={() => addListItem(key as keyof PiarData)} className="mt-2 inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-800"><PlusIcon className="w-4 h-4 mr-1"/> Añadir</button>
                            </div>
                        ))}
                        <div>
                            <h4 className="text-lg font-semibold text-sky-700 mb-2">Ajustes Razonables</h4>
                             <div className="space-y-4">
                                {piarData.ajustes_razonables.map((areaItem, areaIndex) => (
                                    <div key={areaIndex} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <input type="text" value={areaItem.area} onChange={(e) => handleAreaTitleChange(areaIndex, e.target.value)} className="text-md font-semibold text-slate-700 border-none bg-transparent p-1 -m-1 focus:ring-2 focus:ring-sky-500 rounded-md" />
                                            <button onClick={() => removeAdjustmentArea(areaIndex)} className="p-1 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-100 transition"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                        <div className="space-y-2">{areaItem.ajustes.map((ajuste, ajusteIndex) => (<div key={ajusteIndex} className="flex items-center gap-2"><input type="text" value={ajuste} onChange={(e) => handleAdjustmentChange(areaIndex, ajusteIndex, e.target.value)} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" /><button onClick={() => removeAdjustment(areaIndex, ajusteIndex)} className="p-1 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-100 transition"><TrashIcon className="w-4 h-4" /></button></div>))}</div>
                                        <button onClick={() => addAdjustment(areaIndex)} className="mt-3 inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-800"><PlusIcon className="w-4 h-4 mr-1"/> Añadir ajuste</button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addAdjustmentArea} className="mt-4 inline-flex items-center px-3 py-1.5 border border-dashed border-slate-400 text-sm font-medium rounded-md text-slate-600 bg-transparent hover:bg-slate-100"><PlusIcon className="w-4 h-4 mr-2" />Añadir Área</button>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-sky-700 mb-2">Actividades de Refuerzo</h4>
                             <div className="space-y-4">
                                {piarData.actividades_refuerzo?.map((areaItem, areaIndex) => (
                                    <div key={areaIndex} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <input type="text" value={areaItem.area} onChange={(e) => handleRefuerzoAreaTitleChange(areaIndex, e.target.value)} className="text-md font-semibold text-slate-700 border-none bg-transparent p-1 -m-1 focus:ring-2 focus:ring-sky-500 rounded-md"/>
                                            <button onClick={() => removeRefuerzoArea(areaIndex)} className="p-1 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-100 transition"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                        <div className="space-y-2">{areaItem.actividades.map((actividad, actividadIndex) => (<div key={actividadIndex} className="flex items-center gap-2"><input type="text" value={actividad} onChange={(e) => handleRefuerzoActividadChange(areaIndex, actividadIndex, e.target.value)} className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" /><button onClick={() => removeRefuerzoActividad(areaIndex, actividadIndex)} className="p-1 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-100 transition"><TrashIcon className="w-4 h-4" /></button></div>))}</div>
                                        <button onClick={() => addRefuerzoActividad(areaIndex)} className="mt-3 inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-800"><PlusIcon className="w-4 h-4 mr-1"/> Añadir actividad</button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addRefuerzoArea} className="mt-4 inline-flex items-center px-3 py-1.5 border border-dashed border-slate-400 text-sm font-medium rounded-md text-slate-600 bg-transparent hover:bg-slate-100"><PlusIcon className="w-4 h-4 mr-2" />Añadir Área de Refuerzo</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PiarGenerator;