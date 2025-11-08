export type UserRole = 'Docente' | 'Directivo' | 'Familia';

export interface AuthenticatedUser {
    username: string;
    name: string;
    role: UserRole;
    studentId?: string; // Specific to Family role
}

export interface Student {
    id: string;
    name: string;
    photoUrl: string;
    grade: string;
    riskLevel: 'bajo' | 'medio' | 'alto';
    diagnosis: string;
    teacher?: string; // Optional for family view
    documents: Document[];
    progressEntries: ProgressEntry[];
}

export interface Document {
    id: string;
    name: string;
    type: 'informe' | 'evaluacion' | 'PIAR';
    uploadDate: string;
    url: string;
}

export interface Alert {
    id: string;
    studentId: string;
    studentName: string;
    message: string;
    timestamp: string;
}

export interface PiarData {
    resumen_diagnostico: string;
    barreras_aprendizaje: string[];
    fortalezas: string[];
    ajustes_razonables: {
        area: string;
        ajustes: string[];
    }[];
    actividades_refuerzo: {
        area: string;
        actividades: string[];
    }[];
    estrategias_seguimiento: string[];
}

export interface ProgressEntry {
    id: string;
    date: string;
    area: string;
    observation: string;
    author: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export interface Strategy {
    title: string;
    description: string;
    areas: string[];
    grades: string[];
}

export interface FamilyMessage {
    id: string;
    sender: 'user' | 'ia';
    text: string;
    timestamp: string;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'ia';
    text: string;
    timestamp: string;
}
