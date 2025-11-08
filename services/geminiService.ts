
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { PiarData, Student, AuthenticatedUser, Strategy } from "../types";

// Per guidelines, initialize with a named apiKey object.
// The API key MUST be obtained exclusively from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

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

export const generatePiar = async (diagnosis: string, grade: string): Promise<PiarData | null> => {
    const prompt = `
        Basado en el Decreto 1421 de 2017 de Colombia, genera una propuesta de Plan Individualizado de Ajustes Razonables (PIAR) para un estudiante de ${grade}.
        Diagnóstico y contexto proporcionado: "${diagnosis}".
        La respuesta DEBE ser un objeto JSON que siga el esquema proporcionado. No incluyas "json" ni \`\`\` en la respuesta.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            // Per guidelines, use gemini-2.5-pro for complex text tasks.
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: piarSchema,
                temperature: 0.7,
            },
        });

        const text = response.text.trim();
        const parsed = JSON.parse(text);
        
        // Basic validation to ensure the response is in the expected format.
        if (parsed && parsed.resumen_diagnostico && parsed.ajustes_razonables) {
            return parsed as PiarData;
        }
        console.warn("Parsed PIAR data is missing required fields.", parsed);
        return null;
    } catch (error) {
        console.error("Error generating PIAR with Gemini API:", error);
        throw new Error("Failed to generate PIAR with Gemini API.");
    }
};

export const analyzePiar = async (diagnosis: string, piarContent: string): Promise<string | null> => {
    const prompt = `
        Actúa como un experto en educación inclusiva bajo el Decreto 1421 de 2017 de Colombia.
        El diagnóstico del estudiante es: "${diagnosis}".
        A continuación, se presenta un PIAR existente para este estudiante:
        ---
        ${piarContent}
        ---
        Analiza el PIAR proporcionado y ofrece una lista de recomendaciones puntuales y accionables para mejorarlo.
        Enfócate en la coherencia entre el diagnóstico y los ajustes propuestos, la claridad de las estrategias y si se alinea con la normativa.
        Formatea tu respuesta en Markdown, usando títulos y listas para mayor claridad.
    `;

    try {
        const response = await ai.models.generateContent({
            // Per guidelines, use gemini-2.5-pro for complex text tasks.
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                temperature: 0.5,
            },
        });
        return response.text;
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
            description: "A list of inclusive educational strategies.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A concise, descriptive title for the strategy." },
                    description: { type: Type.STRING, description: "A detailed explanation of the strategy, how to implement it, and its benefits." },
                    areas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of applicable educational areas (e.g., Matemáticas, Habilidades Sociales)." },
                    grades: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of applicable grade levels (e.g., Tercero, Cuarto)." }
                },
                required: ['title', 'description', 'areas', 'grades']
            }
        }
    },
    required: ['strategies']
};

export const getInclusiveStrategies = async (query: string, area: string, grade: string): Promise<Strategy[]> => {
    const prompt = `
        Actúa como un experto en pedagogía y educación inclusiva.
        Busca estrategias educativas inclusivas basadas en la siguiente consulta.
        Consulta del usuario: "${query}"
        ${area !== 'todos' ? `Filtra por el área: "${area}".` : ''}
        ${grade !== 'todos' ? `Filtra por el grado: "${grade}".` : ''}
        
        Proporciona al menos 5 estrategias relevantes y variadas. Para cada una, incluye un título claro, una descripción detallada de su implementación, las áreas de aplicación y los grados recomendados.
        La respuesta DEBE ser un objeto JSON que siga el esquema proporcionado. No incluyas "json" ni \`\`\` en la respuesta.
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: strategySchema,
                temperature: 0.5,
            },
        });

        const text = response.text.trim();
        const parsed = JSON.parse(text);

        if (parsed && parsed.strategies && Array.isArray(parsed.strategies)) {
            return parsed.strategies as Strategy[];
        }
        console.warn("Parsed strategies data is not in the expected format.", parsed);
        return [];

    } catch (error) {
        console.error("Error getting strategies from Gemini API:", error);
        throw new Error("Failed to get strategies from Gemini API.");
    }
};

export const getFamilyAssistantResponse = async (student: Student, messageHistory: {role: string, parts: {text: string}[]}[]): Promise<string> => {
    const systemInstruction = `Eres un asistente de IA amigable y empático para familiares de estudiantes con necesidades educativas especiales. Estás ayudando a la familia de ${student.name}, quien está en ${student.grade} y tiene el siguiente diagnóstico: "${student.diagnosis}". Tu objetivo es proporcionar información clara, sencilla y útil sobre el PIAR y cómo apoyar al estudiante en casa. NO des consejos médicos ni diagnósticos. Si te preguntan algo fuera de tu alcance, redirige a los profesionales del colegio. Sé breve y directo en tus respuestas.`;

    try {
        const chat = ai.chats.create({
             // Per guidelines, use gemini-2.5-flash for basic text tasks/chat.
             model: 'gemini-2.5-flash',
             history: messageHistory.slice(0, -1), // History is all but the last message
             config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
             }
        });

        const lastMessage = messageHistory[messageHistory.length - 1];
        const response = await chat.sendMessage({message: lastMessage.parts[0].text});

        return response.text;

    } catch (error) {
        console.error("Error in Family AI Assistant:", error);
        throw new Error("Failed to get response from AI assistant.");
    }
};

export const getPedagogicalAgentResponse = async (
    messageHistory: {role: string, parts: {text: string}[]}[],
    user: AuthenticatedUser,
    students: Student[]
): Promise<string> => {
    
    // Create a concise summary of students for context
    const studentContext = students.map(s => ({
        id: s.id,
        name: s.name,
        grade: s.grade,
        diagnosis: s.diagnosis,
        risk: s.riskLevel,
        teacher: s.teacher,
        progress: s.progressEntries.slice(0, 2).map(p => `${p.date}: ${p.observation}`).join('; ') || 'No hay registros recientes.'
    }));

    const systemInstruction = `
        Eres un Agente Pedagógico Virtual experto en educación inclusiva, basado en la normativa colombiana (Decreto 1421).
        Tu misión es asistir a un usuario con el rol de "${user.role}" llamado ${user.name}.
        
        **Tus capacidades son:**
        1.  **Sugerir Estrategias:** Ofrecer estrategias pedagógicas, de evaluación y de comunicación personalizadas para los estudiantes.
        2.  **Resumir Información:** Sintetizar el progreso, las alertas y los datos clave de uno o varios estudiantes.
        3.  **Facilitar la Comunicación:** Ayudar a redactar mensajes claros, empáticos y profesionales entre docentes y familias.
        4.  **Resolver Dudas:** Contestar preguntas sobre la plataforma PIAR.ai y conceptos de educación inclusiva.

        **Contexto Actual:**
        - Rol del Usuario: ${user.role}
        - Nombre del Usuario: ${user.name}
        - Estudiantes a cargo/visibles: ${JSON.stringify(studentContext, null, 2)}

        **Reglas Importantes:**
        - Basa tus respuestas en el contexto proporcionado.
        - Si te piden información sobre un estudiante no listado, indica que no tienes acceso a sus datos.
        - **NUNCA** inventes información, diagnósticos o registros de progreso. Si no tienes datos, dilo explícitamente.
        - **NO** ofrezcas consejos médicos. Siempre redirige esas consultas a profesionales de la salud.
        - Sé siempre profesional, empático y constructivo. Formatea tus respuestas con Markdown para mayor claridad.
    `;

    try {
        const chat = ai.chats.create({
             // Using a more powerful model for complex reasoning
             model: 'gemini-2.5-pro',
             history: messageHistory.slice(0, -1),
             config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
             }
        });

        const lastMessage = messageHistory[messageHistory.length - 1];
        const response = await chat.sendMessage({message: lastMessage.parts[0].text});

        return response.text;

    } catch (error) {
        console.error("Error in Pedagogical Agent:", error);
        throw new Error("Failed to get response from AI agent.");
    }
};
