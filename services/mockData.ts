import type { Student, Alert, Notification, ProgressEntry, AuthenticatedUser } from '../types';

const MOCK_PROGRESS: ProgressEntry[] = [
    { id: 'p1', date: '2023-10-26', area: 'Lectoescritura', observation: 'Mostró mayor fluidez al leer en voz alta textos cortos. Aún presenta dificultades con palabras polisílabas.', author: 'Ana Morales' },
    { id: 'p2', date: '2023-10-24', area: 'Matemáticas', observation: 'Completó el 80% de los ejercicios de suma sin reagrupación de forma independiente.', author: 'Ana Morales' },
    { id: 'p3', date: '2023-10-20', area: 'Habilidades Sociales', observation: 'Participó activamente en un juego grupal, compartiendo materiales con un compañero.', author: 'Psicorientación' },
];

export const MOCK_STUDENTS: Student[] = [
    {
        id: 'st_01',
        name: 'Carlos Valderrama',
        photoUrl: 'https://picsum.photos/seed/cvalderrama/200',
        grade: 'Tercero',
        riskLevel: 'alto',
        diagnosis: 'Trastorno del Espectro Autista (TEA) Nivel 1, con dificultades en la comunicación social y patrones de comportamiento repetitivos. Requiere apoyos en la interacción con pares y en la flexibilidad cognitiva.',
        teacher: 'Ana Morales',
        documents: [
            { id: 'doc1', name: 'Informe Fonoaudiología 2023.pdf', type: 'informe', uploadDate: '2023-08-15', url: '#' },
        ],
        progressEntries: MOCK_PROGRESS,
    },
    {
        id: 'st_02',
        name: 'Sofia Vergara',
        photoUrl: 'https://picsum.photos/seed/svergara/200',
        grade: 'Tercero',
        riskLevel: 'medio',
        diagnosis: 'Dislexia. Presenta dificultades específicas en la decodificación de palabras y fluidez lectora. Su comprensión oral es adecuada para su edad.',
        teacher: 'Ana Morales',
        documents: [
            { id: 'doc2', name: 'Evaluación Psicopedagógica.pdf', type: 'evaluacion', uploadDate: '2023-09-01', url: '#' },
            { id: 'doc3', name: 'PIAR v1.docx', type: 'PIAR', uploadDate: '2023-09-20', url: '#' },
        ],
        progressEntries: [],
    },
    {
        id: 'st_03',
        name: 'Juan Pablo Montoya',
        photoUrl: 'https://picsum.photos/seed/jpmontoya/200',
        grade: 'Cuarto',
        riskLevel: 'bajo',
        diagnosis: 'Trastorno por Déficit de Atención e Hiperactividad (TDAH), tipo inatento. Requiere estrategias para mantener la concentración en tareas extensas y para la organización de materiales.',
        teacher: 'Carlos Ruiz',
        documents: [],
        progressEntries: [],
    },
    {
        id: 'st_04',
        name: 'Mariana Pajón',
        photoUrl: 'https://picsum.photos/seed/mpajon/200',
        grade: 'Quinto',
        riskLevel: 'medio',
        diagnosis: 'Altas capacidades en el área lógico-matemática. Requiere enriquecimiento curricular para mantener la motivación y desarrollar su potencial.',
        teacher: 'Carlos Ruiz',
        documents: [
            { id: 'doc4', name: 'Valoración Potencial Intelectual.pdf', type: 'informe', uploadDate: '2023-05-10', url: '#' },
        ],
        progressEntries: [],
    },
    {
        id: 'st_05',
        name: 'Egan Bernal',
        photoUrl: 'https://picsum.photos/seed/ebernal/200',
        grade: 'Quinto',
        riskLevel: 'alto',
        diagnosis: 'Trastorno de Ansiedad Generalizada. Manifiesta preocupación excesiva ante situaciones evaluativas y sociales, lo que interfiere con su rendimiento y participación.',
        teacher: 'Sandra Peña',
        documents: [],
        progressEntries: [],
    },
    {
        id: 'st_06',
        name: 'Nairo Quintana',
        photoUrl: 'https://picsum.photos/seed/nquintana/200',
        grade: 'Cuarto',
        riskLevel: 'bajo',
        diagnosis: 'Dificultades leves de procesamiento auditivo. Se beneficia de instrucciones claras y apoyos visuales.',
        teacher: 'Carlos Ruiz', // Assigned to another teacher
        documents: [],
        progressEntries: [],
    },
    {
        id: 'st_07',
        name: 'Shakira Mebarak',
        photoUrl: 'https://picsum.photos/seed/smebarak/200',
        grade: 'Tercero',
        riskLevel: 'medio',
        diagnosis: 'Recién diagnosticada con discalculia. Requiere evaluación psicopedagógica completa para determinar los apoyos necesarios.',
        teacher: undefined, // Unassigned student
        documents: [],
        progressEntries: [],
    }
];

// Changed to `let` to allow adding new users on registration
export let MOCK_USERS: AuthenticatedUser[] = [
    {
        username: 'amorales',
        name: 'Ana Morales',
        role: 'Docente',
    },
    {
        username: 'director',
        name: 'Directora Académica',
        role: 'Directivo',
    },
    {
        username: 'familia.valderrama',
        name: 'Familia Valderrama',
        role: 'Familia',
        studentId: 'st_01' // This family is associated with Carlos Valderrama
    }
];

export const MOCK_ALERTS: Alert[] = [
    { id: 'al_01', studentId: 'st_01', studentName: 'Carlos Valderrama', message: 'Ha presentado 3 ausencias consecutivas en la última semana.', timestamp: 'hace 2 días' },
    { id: 'al_02', studentId: 'st_02', studentName: 'Sofia Vergara', message: 'Mostró una baja en el rendimiento del área de Lenguaje.', timestamp: 'hace 5 días' },
];

export const MOCK_INSTITUTIONAL_ALERTS: Alert[] = [
    { id: 'ial_01', studentId: 'st_05', studentName: 'Egan Bernal', message: 'PIAR pendiente de creación por más de 30 días.', timestamp: 'hace 1 día' },
    { id: 'ial_02', studentId: 'st_01', studentName: 'Carlos Valderrama', message: 'No se registran seguimientos de progreso en los últimos 15 días.', timestamp: 'hace 3 días' },
    { id: 'ial_03', studentId: 'st_03', studentName: 'Juan Pablo Montoya', message: 'PIAR sin actualizar desde el periodo anterior.', timestamp: 'hace 1 semana' },
];

export const MOCK_TEACHERS: { name: string; photoSeed: string }[] = [
    { name: 'Ana Morales', photoSeed: 'amorales' },
    { name: 'Carlos Ruiz', photoSeed: 'cruiz' },
    { name: 'Sandra Peña', photoSeed: 'spena' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'n1', title: 'PIAR Actualizado', message: 'El PIAR de Sofia Vergara ha sido actualizado por Ana Morales.', timestamp: 'hace 15 min', read: false },
    { id: 'n2', title: 'Nuevo Documento', message: 'Se ha subido un nuevo informe para Carlos Valderrama.', timestamp: 'hace 2 horas', read: false },
    { id: 'n3', title: 'Alerta de Rendimiento', message: 'Se ha generado una alerta de rendimiento para Sofia Vergara.', timestamp: 'hace 1 día', read: true },
    { id: 'n4', title: 'Recordatorio de Reunión', message: 'Reunión de seguimiento para Carlos Valderrama mañana a las 10:00 AM.', timestamp: 'hace 1 día', read: true },
];