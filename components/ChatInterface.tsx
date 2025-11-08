import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ChatMessage, AuthenticatedUser, Student } from '../types';
import { getPedagogicalAgentResponse } from '../services/geminiService';
import { PaperAirplaneIcon, SparklesIcon } from './icons/Icons';

interface ChatInterfaceProps {
    user: AuthenticatedUser;
    students: Student[];
}

interface ChatBubbleProps {
    message: ChatMessage;
}
// FIX: Explicitly typed as React.FC to solve type error with 'key' prop in lists.
const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
    const isUser = message.sender === 'user';
    const bubbleClasses = isUser ? 'bg-sky-600 text-white self-end' : 'bg-slate-200 text-slate-800 self-start';
    return (
        <div className={`max-w-xl p-3 rounded-xl shadow-sm ${bubbleClasses}`}>
            <p className="text-sm leading-6 whitespace-pre-wrap">{message.text}</p>
        </div>
    );
};

interface SuggestionChipProps {
    text: string;
    onClick: (text: string) => void;
}
// FIX: Explicitly typed as React.FC to solve type error with 'key' prop in lists.
const SuggestionChip: React.FC<SuggestionChipProps> = ({ text, onClick }) => (
    <button
        onClick={() => onClick(text)}
        className="px-3 py-1.5 bg-sky-100 text-sky-700 rounded-full text-sm font-medium hover:bg-sky-200 transition-colors"
    >
        {text}
    </button>
);


const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, students }) => {
    const getWelcomeMessage = () => {
        switch (user.role) {
            case 'Docente':
                return `¡Hola, ${user.name.split(' ')[0]}! Soy tu Agente Pedagógico Virtual. Puedo ayudarte a crear estrategias para tus estudiantes, resumir su progreso o redactar comunicaciones para las familias. ¿Cómo puedo asistirte?`;
            case 'Directivo':
                return `¡Hola! Soy el Agente Pedagógico Virtual. Puedo proporcionarte resúmenes institucionales, analizar tendencias y ayudarte a supervisar la implementación de la estrategia de inclusión. ¿Qué necesitas consultar hoy?`;
            case 'Familia':
                 return `¡Hola, ${user.name}! Soy tu asistente virtual. Estoy aquí para resolver tus dudas sobre el PIAR, el progreso de tu hijo/a y darte ideas para apoyarlo/a en casa. ¿En qué te puedo ayudar?`;
            default:
                return `¡Hola! Soy el asistente de PIAR.ai. Estoy aquí para ayudarte a navegar la plataforma o resolver dudas sobre los procesos de inclusión. ¿En qué puedo ayudarte hoy?`;
        }
    }
    
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: `msg_${Date.now()}`,
            sender: 'ia',
            text: getWelcomeMessage(),
            timestamp: new Date().toISOString()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showSuggestions, setShowSuggestions] = useState(true);

    const suggestionPrompts = useMemo(() => {
        const studentName = students[0]?.name || 'un estudiante';
        switch (user.role) {
            case 'Docente':
                return [
                    `Sugerir 3 estrategias para ${studentName} en lectoescritura.`,
                    `Resume el progreso reciente de ${studentName}.`,
                    `Ayúdame a redactar un mensaje para la familia de ${studentName}.`
                ];
            case 'Directivo':
                return [
                    "Dame un resumen de los estudiantes en riesgo alto.",
                    "¿Cuáles son las barreras de aprendizaje más comunes en la institución?",
                    "Genera un reporte de cumplimiento de PIAR por docente."
                ];
            case 'Familia':
                return [
                    `¿Qué actividades puedo hacer en casa para ayudar a ${studentName}?`,
                    "Explícame en términos sencillos qué es un 'ajuste razonable'.",
                    `¿Cómo va ${studentName} en sus habilidades sociales?`
                ];
            default: return [];
        }
    }, [user.role, students]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;
        setShowSuggestions(false);

        const userMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            sender: 'user',
            text: messageText,
            timestamp: new Date().toISOString()
        };

        // We use a functional update to ensure we have the latest messages state
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const geminiHistory = [...messages, userMessage].map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));

        try {
            const responseText = await getPedagogicalAgentResponse(geminiHistory, user, students);
            const aiMessage: ChatMessage = {
                id: `msg_${Date.now() + 1}`,
                sender: 'ia',
                text: responseText,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Failed to get response from Gemini", error);
            const errorMessage: ChatMessage = {
                id: `msg_err_${Date.now()}`,
                sender: 'ia',
                text: 'Lo siento, no pude procesar tu pregunta en este momento. Por favor, inténtalo de nuevo más tarde.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSuggestionClick = (text: string) => {
        setInput(text);
        handleSend(text);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <header className="p-8 pb-4">
                 <h1 className="text-3xl font-bold text-slate-800">Agente Pedagógico Virtual</h1>
                 <p className="text-slate-500 mt-1">Tu copiloto inteligente para la educación inclusiva.</p>
            </header>

            <div className="flex-1 overflow-y-auto px-8 py-4 space-y-4 flex flex-col">
                {messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}
                
                {showSuggestions && suggestionPrompts.length > 0 && (
                     <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                        <p className="text-sm font-semibold text-slate-700 mb-3">Aquí tienes algunas ideas para empezar:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestionPrompts.map((prompt, i) => (
                                <SuggestionChip key={i} text={prompt} onClick={handleSuggestionClick} />
                            ))}
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="self-start flex items-center space-x-2 bg-slate-200 p-3 rounded-xl shadow-sm">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse delay-300"></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <footer className="p-8 pt-4 bg-slate-50 sticky bottom-0">
                <div className="relative">
                    <textarea
                        rows={1}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value)
                            const target = e.target;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(input);
                                e.currentTarget.style.height = 'auto';
                            }
                        }}
                        placeholder="Escribe tu pregunta aquí..."
                        className="w-full pl-4 pr-12 py-3 border bg-white border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition resize-none text-sm leading-6 max-h-40"
                        disabled={isLoading}
                    />
                    <button
                        onClick={(e) => {
                            handleSend(input);
                            const inputElem = (e.currentTarget.previousSibling as HTMLTextAreaElement);
                            if (inputElem) inputElem.style.height = 'auto';
                        }}
                        disabled={isLoading || !input.trim()}
                        className="absolute bottom-2.5 right-2.5 flex items-center justify-center w-9 h-9 bg-sky-600 text-white rounded-lg disabled:bg-slate-400 hover:bg-sky-700 transition-colors"
                        aria-label="Enviar mensaje"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
                 <p className="text-xs text-slate-400 mt-2 text-center flex items-center justify-center">
                    <SparklesIcon className="w-3 h-3 mr-1"/> Respuestas generadas por IA. Verifica siempre la información.
                </p>
            </footer>
        </div>
    );
};

export default ChatInterface;