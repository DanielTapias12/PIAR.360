
import { GoogleGenAI, Type, GenerateContentResponse, FunctionDeclaration, Chat } from "@google/genai";
import type { PiarData, Strategy, Student, AuthenticatedUser } from '../types';

// Per guidelines, initialize with a named apiKey object.
// The API key MUST be obtained exclusively from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const piarSchema = {
    type: Type.OBJECT,
    properties: {
        resumen_diagnostico: { type: Type.STRING, description: "Breve resumen del diagnóstico y necesidades del estudiante." },
        barreras_aprendizaje: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de barreras para el aprendizaje y la participación identificadas." },
        fortalezas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de habilidades y fortalezas del estudiante." },
        ajustes_razonables: {
            type: Type.ARRAY,
            description: "Ajustes curriculares, metodológicos y evaluativos.",
            items: {
                type: Type.OBJECT,
                properties: {
                    area: { type: Type.STRING, description: "Área o materia del ajuste (ej. Matemáticas, Lenguaje)." },
                    ajustes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de ajustes específicos para esa área." }
                },
                required: ['area', 'ajustes']
            }
        },
        actividades_refuerzo: {
             type: Type.ARRAY,
            description: "Actividades de refuerzo específicas para el hogar o la escuela.",
            items: {
                type: Type.OBJECT,
                properties: {
                    area: { type: Type.STRING, description: "Área de refuerzo (ej. Habilidades sociales, Lectoescritura)." },
                    actividades: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de actividades de refuerzo para esa área." }
                },
                required: ['area', 'actividades']
            }
        },
        estrategias_seguimiento: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Estrategias para el seguimiento y evaluación del PIAR." },
    },
    required: ['resumen_diagnostico', 'barreras_aprendizaje', 'fortalezas', 'ajustes_razonables', 'actividades_refuerzo', 'estrategias_seguimiento']
};

export const generatePiar = async (diagnosis: string, grade: string, age: number): Promise<PiarData | null> => {
    const prompt = `
        Basado en el Decreto 1421 de 2017 de Colombia, genera una propuesta de Plan Individualizado de Ajustes Razonables (PIAR) para un estudiante de ${grade} que tiene ${age} años.
        Diagnóstico y contexto proporcionado: "${diagnosis}".
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: piarSchema,
                temperature: 0.7,
            },
        });

        const text = response.text;
        if (!text) return null;
        
        const parsed = JSON.parse(text);
        
        if (parsed && parsed.resumen_diagnostico && parsed.ajustes_razonables) {
            return parsed as PiarData;
        }
        return null;
    } catch (error) {
        console.error("Error generating PIAR with Gemini API:", error);
        throw new Error("Failed to generate PIAR with Gemini API.");
    }
};

export const analyzePiar = async (diagnosis: string, piarContent: string): Promise<PiarData | null> => {
    const prompt = `
        Actúa como un experto en educación inclusiva bajo el Decreto 1421 de 2017 de Colombia.
        Tienes dos tareas:
        1. Analizar el contenido del documento PIAR subido.
        2. REESTRUCTURAR y MEJORAR dicho contenido basándote en el diagnóstico del estudiante: "${diagnosis}".

        Documento PIAR Original:
        ---
        ${piarContent}
        ---

        Instrucciones:
        - Extrae la información relevante.
        - Si las estrategias son vagas, hazlas más específicas (SMART).
        - Organiza todo estrictamente en la estructura JSON solicitada para que pueda ser editada.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: piarSchema,
                temperature: 0.4,
            },
        });
        
        const text = response.text;
        if (!text) return null;
        
        const parsed = JSON.parse(text);

        if (parsed && parsed.resumen_diagnostico && parsed.ajustes_razonables) {
            return parsed as PiarData;
        }
        return null;
    } catch (error) {
        console.error("Error analyzing PIAR with Gemini API:", error);
        throw new Error("Failed to analyze PIAR with Gemini API.");
    }
};

const strategySchema = {
    type: Type.OBJECT,
    properties: {
        strategies: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    areas: { type: Type.ARRAY, items: { type: Type.STRING } },
                    grades: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['title', 'description', 'areas', 'grades']
            }
        }
    },
    required: ['strategies']
};

export const getInclusiveStrategies = async (query: string, area: string, grade: string): Promise<Strategy[]> => {
    const prompt = `
        Busca estrategias educativas inclusivas para: "${query}"
        ${area !== 'todos' ? `Filtra por el área: "${area}".` : ''}
        ${grade !== 'todos' ? `Filtra por el grado: "${grade}".` : ''}
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: strategySchema,
                temperature: 0.5,
            },
        });

        const text = response.text;
        if (!text) return [];
        
        const parsed = JSON.parse(text);
        if (parsed && parsed.strategies && Array.isArray(parsed.strategies)) {
            return parsed.strategies as Strategy[];
        }
        return [];

    } catch (error) {
        console.error("Error getting strategies:", error);
        throw new Error("Failed to get strategies.");
    }
};

const suitabilitySchema = {
    type: Type.OBJECT,
    properties: {
        isSuitable: { type: Type.BOOLEAN, description: "True si la estrategia es adecuada, False si contradice el diagnóstico." },
        reason: { type: Type.STRING, description: "Explicación pedagógica y clínica de por qué es o no adecuada." },
        riskLevel: { type: Type.STRING, description: "Nivel de riesgo de aplicar esta estrategia: 'Nulo', 'Bajo', 'Medio', 'Alto'." }
    },
    required: ['isSuitable', 'reason', 'riskLevel']
};

export const validateStrategySuitability = async (studentDiagnosis: string, strategy: Strategy): Promise<{ isSuitable: boolean; reason: string; riskLevel: string }> => {
    const prompt = `
        Actúa como un Coordinador Clínico y Pedagógico.
        
        Estudiante Diagnóstico: "${studentDiagnosis}"
        Estrategia Propuesta: "${strategy.title}: ${strategy.description}"

        TAREA: Evalúa si la estrategia es adecuada para este estudiante específico.
        - ¿La estrategia aprovecha sus fortalezas o choca con sus limitaciones?
        - ¿Existe algún riesgo contraproducente (ej. pedir lectura visual a un niño con baja visión, o tareas de memoria largas a un niño con TDAH sin apoyos)?

        Responde estrictamente en JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: suitabilitySchema,
                temperature: 0.2, // Low temperature for strict logical analysis
            }
        });

        const text = response.text;
        if (!text) return { isSuitable: true, reason: "Análisis no disponible", riskLevel: "Desconocido" };
        return JSON.parse(text);
    } catch (error) {
        console.error("Error validating strategy:", error);
        return { isSuitable: true, reason: "Error de conexión con IA", riskLevel: "Desconocido" };
    }
};

export const getFamilyAssistantResponse = async (student: Student, messageHistory: {role: string, parts: {text: string}[]}[]): Promise<string> => {
    const systemInstruction = `Eres un asistente de IA para familiares de estudiantes con necesidades educativas. Estudiante: ${student.name}, Grado: ${student.grade}, Diagnóstico: "${student.diagnosis}". Sé breve y empático. No des consejos médicos.`;

    try {
        // Ensure history is valid
        const validHistory = messageHistory.slice(0, -1).filter(m => m.parts && m.parts.length > 0 && m.parts[0].text);
        
        const chat = ai.chats.create({
             model: 'gemini-2.5-flash',
             history: validHistory,
             config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
             }
        });

        const lastMessage = messageHistory[messageHistory.length - 1];
        if (!lastMessage || !lastMessage.parts || !lastMessage.parts[0].text) {
            return "Lo siento, no entendí el mensaje.";
        }

        const response = await chat.sendMessage({message: lastMessage.parts[0].text});
        return response.text || "No pude generar una respuesta.";

    } catch (error) {
        console.error("Error in Family AI Assistant:", error);
        return "Lo siento, hubo un error al procesar tu solicitud.";
    }
};

// --- Pedagogical Agent ---

const addStudentObservationFunction: FunctionDeclaration = {
    name: 'addStudentObservation',
    description: "Añade una nueva observación o registro de progreso para un estudiante.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            studentName: { type: Type.STRING },
            observation: { type: Type.STRING },
            area: { type: Type.STRING }
        },
        required: ['studentName', 'observation', 'area']
    }
};

const assignStrategyToStudentFunction: FunctionDeclaration = {
    name: 'assignStrategyToStudent',
    description: "Asigna una estrategia pedagógica recomendada a un estudiante. Usa esto cuando el usuario confirme que quiere aplicar una estrategia.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            studentName: { type: Type.STRING },
            strategyTitle: { type: Type.STRING },
            strategyDescription: { type: Type.STRING },
            area: { type: Type.STRING }
        },
        required: ['studentName', 'strategyTitle', 'strategyDescription', 'area']
    }
};

export const createPedagogicalAgentChatSession = (user: AuthenticatedUser, students: Student[]): Chat => {
    const studentContext = students.map(s => ({
        id: s.id,
        name: s.name,
        grade: s.grade,
        diagnosis: s.diagnosis,
    }));

    const systemInstruction = `
        Eres un Agente Pedagógico Virtual experto en educación inclusiva (Decreto 1421).
        Tu objetivo es ser un copiloto estratégico y riguroso.
        Usuario: ${user.name} (${user.role}).
        Estudiantes: ${JSON.stringify(studentContext)}

        ESTRUCTURA DE RESPUESTA OBLIGATORIA:
        Cuando sugieras estrategias, usa siempre este formato Markdown:
        
        ### 1. Análisis del Caso
        (Breve análisis de la necesidad vs diagnóstico).

        ### 2. Estrategia Propuesta
        (Nombre y detalle de la estrategia).

        ### 3. Justificación Clínica/Pedagógica
        (Por qué esto funciona específicamente para este diagnóstico y no otro).

        CAPACIDADES Y REGLAS:
        1. **Filtro de Seguridad:** Antes de sugerir nada, verifica internamente si la estrategia es compatible con el diagnóstico. Si el usuario pide algo contraproducente, adivierte el riesgo.
        2. **Acción Directa:** Si el usuario acepta una sugerencia (ej: "Sí, hazlo", "Asígnala"), EJECUTA la herramienta 'assignStrategyToStudent' inmediatamente.
        3. **Gestión:** Puedes usar 'addStudentObservation' para tomar notas rápidas.
    `;
    
    return ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.5, // Lower temp for more structured adherence
            tools: [{ functionDeclarations: [addStudentObservationFunction, assignStrategyToStudentFunction] }]
        }
    });
};
