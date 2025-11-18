

export type UserRole = 'Docente' | 'Familia' | 'Director';

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

export interface Document {
    id: string;
    name: string;
    type: 'informe' | 'evaluacion' | 'PIAR';
    uploadDate: string;
    url: string;
    content?: PiarData;
}

export interface ProgressEntry {
    id: string;
    date: string;
    area: string;
    observation: string;
    author: string;
    strategy?: {
        title: string;
        description: string;
    };
}

export interface AuthenticatedUser {
    id: string;
    username: string;
    name: string;
    role: UserRole;
    email?: string;
    photo_url?: string;
    age?: string;
    address?: string;
    phone?: string;
    specialization?: string;
    specificPosition?: string;
    experience?: string;
    relationship?: string;
}

export interface Student {
    id: string;
    name: string;
    age: number;
    photo_url: string;
    grade: string;
    risk_level: 'bajo' | 'medio' | 'alto';
    diagnosis: string;
    teachers: string[];
    documents: Document[];
    progress_entries: ProgressEntry[];
    family_member_ids?: string[] | null;
}

export interface NewStudentData {
    name: string;
    age: number;
    grade: string;
    risk_level: 'bajo' | 'medio' | 'alto';
    diagnosis: string;
}

export interface Strategy {
    title: string;
    description: string;
    areas: string[];
    grades: string[];
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    user_id: string;
}