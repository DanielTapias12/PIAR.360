
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPedagogicalAgentChatSession } from '../services/geminiService';
import { PaperAirplaneIcon, SparklesIcon, Cog6ToothIcon } from './icons/Icons';
import type { AuthenticatedUser, Student, Strategy } from '../types';
import type { Chat } from '@google/genai';


interface ChatMessage {
    id: string;
    sender: 'user' | 'ia' | 'tool';
    text: string;
}

const renderMarkdown = (text: string) => {
    // Simple custom markdown renderer for the structured responses
    const paragraphs = text.split(/\n\s*\n/);
    return paragraphs.map((paragraph, pIndex) => {
        if (paragraph.startsWith('### ')) return <h4 key={pIndex} className="text-base font-bold mt-4 mb-2 text-indigo-800">{paragraph.substring(4)}</h4>;
        if (paragraph.startsWith('## ')) return <h4 key={pIndex} className="text-base font-bold mt-3 mb-1">{paragraph.substring(3)}</h4>;
        if (paragraph.startsWith('# ')) return <h3 key={pIndex} className="text-lg font-bold mt-4 mb-2">{paragraph.substring(2)}</h3>;
        if (paragraph.match(/^[-*]\s/m)) {
            const listItems = paragraph.split('\n').map((item, lIndex) => {
                if (!item.trim().startsWith('- ') && !item.trim().startsWith('* ')) return null;
                return <li key={lIndex} className="mb-1 ml-4">{item.replace(/^[-*]\s*/, '')}</li>;
            }).filter(Boolean);
            return <ul key={pIndex} className="list-disc list-inside space-y-1 my-2 text-slate-700">{listItems}</ul>;
        }
        // Bold text handling
        const parts = paragraph.split(/(\*\*.*?\*\*)/);
        return (
            <p key={pIndex} className="my-2 leading-relaxed">
                {parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                })}
            </p>
        );
    });
};

interface ChatInterfaceProps {
    user: AuthenticatedUser;
    students: Student[];
    onAddProgressEntry: (studentId: string, area: string, observation: string, author: string) => Promise<boolean>;
    onAssignStrategy: (studentIds: string[], strategy: Strategy) => Promise<void>;
}

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    if (message.sender === 'tool') {
        return <div className="self-center flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg"><Cog6ToothIcon className="w-5 h-5 animate-spin-slow"/><span>{message.text}</span></div>;
    }
    const isUser = message.sender === 'user';
    return (
        <div className={`max-w-2xl p-4 rounded-xl shadow-sm ${isUser ? 'bg-sky-600 text-white self-end' : 'bg-white border border-slate-200 text-slate-800 self-start'}`}>
            <div className="text-sm">{isUser ? message.text : renderMarkdown(message.text)}</div>
        </div>
    );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, students, onAddProgressEntry, onAssignStrategy }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'init', sender: 'ia', text: `Hola ${user.name}, soy tu Agente Pedagógico Virtual. Puedo sugerir estrategias personalizadas, asignar actividades o resumir progresos.\n\n¿En qué estudiante nos enfocamos hoy?` }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        if (user && students) {
            chatRef.current = createPedagogicalAgentChatSession(user, students);
        }
    }, [user, students]);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(scrollToBottom, [messages]);

    const handleFunctionCall = async (functionCall: any) => {
        const { name, args } = functionCall;
        if (name === 'addStudentObservation') {
            const student = students.find(s => s.name.toLowerCase().includes(args.studentName.toLowerCase()));
            if (student) {
                const success = await onAddProgressEntry(student.id, args.area, args.observation, user.name);
                return { success, message: success ? "Observación añadida." : "Fallo al añadir." };
            }
            return { success: false, message: "Estudiante no encontrado." };
        } else if (name === 'assignStrategyToStudent') {
            const student = students.find(s => s.name.toLowerCase().includes(args.studentName.toLowerCase()));
            if (student) {
                 const strategy: Strategy = {
                    title: args.strategyTitle,
                    description: args.strategyDescription,
                    areas: [args.area],
                    grades: [student.grade]
                };
                await onAssignStrategy([student.id], strategy);
                return { success: true, message: `Estrategia asignada a ${student.name}.` };
            }
            return { success: false, message: "Estudiante no encontrado." };
        }
        return { success: false, message: "Función desconocida." };
    };

    const handleSend = async (text: string) => {
        if (!text.trim() || isLoading || !chatRef.current) return;
        setMessages(prev => [...prev, { id: `msg_${Date.now()}`, sender: 'user', text }]);
        setInput('');
        setIsLoading(true);

        try {
            let response = await chatRef.current.sendMessage({ message: text });

            while (true) {
                 if (response.functionCalls && response.functionCalls.length > 0) {
                    const call = response.functionCalls[0];
                    setMessages(prev => [...prev, { id: `tool_${Date.now()}`, sender: 'tool', text: `Procesando acción: ${call.name}...` }]);
                    
                    const result = await handleFunctionCall(call);

                    response = await chatRef.current.sendMessage({
                        toolResponse: {
                            functionResponses: { id: call.id, name: call.name, response: result }
                        }
                    });
                } else {
                    if (response.text) {
                        setMessages(prev => [...prev, { id: `msg_${Date.now()}`, sender: 'ia', text: response.text }]);
                    }
                    break;
                }
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: `err_${Date.now()}`, sender: 'ia', text: 'Lo siento, hubo un error en la comunicación. Por favor, intenta de nuevo.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 flex flex-col">
                {messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}
                {isLoading && <div className="self-start bg-white border border-slate-200 p-3 rounded-xl text-sm text-slate-500 flex items-center"><SparklesIcon className="w-4 h-4 mr-2 animate-pulse"/>Analizando...</div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white border-t border-slate-200 shadow-sm">
                <div className="max-w-4xl mx-auto flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
                        placeholder="Pregunta sobre un estudiante o pide una estrategia..."
                        className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm text-sm"
                        disabled={isLoading}
                    />
                    <button onClick={() => handleSend(input)} disabled={isLoading || !input} className="bg-sky-600 text-white p-3 rounded-xl hover:bg-sky-700 disabled:bg-slate-400 transition-colors shadow-md">
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
                 <p className="text-xs text-center text-slate-400 mt-2">El Asistente verifica la idoneidad de las estrategias con el diagnóstico.</p>
            </div>
        </div>
    );
};

export default ChatInterface;
