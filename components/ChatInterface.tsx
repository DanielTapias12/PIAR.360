


import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPedagogicalAgentChatSession } from '../services/geminiService';
import { PaperAirplaneIcon, SparklesIcon, Cog6ToothIcon } from './icons/Icons';
import type { AuthenticatedUser, Student } from '../types';
import type { Chat } from '@google/genai';


interface ChatMessage {
    id: string;
    sender: 'user' | 'ia' | 'tool';
    text: string;
}

const renderMarkdown = (text: string) => {
    // Split text into paragraphs based on double newlines
    const paragraphs = text.split(/\n\s*\n/);

    return paragraphs.map((paragraph, pIndex) => {
        // Handle headings
        if (paragraph.startsWith('## ')) {
            return <h4 key={pIndex} className="text-base font-bold mt-3 mb-1">{paragraph.substring(3)}</h4>;
        }
        if (paragraph.startsWith('# ')) {
            return <h3 key={pIndex} className="text-lg font-bold mt-4 mb-2">{paragraph.substring(2)}</h3>;
        }

        // Handle lists
        if (paragraph.match(/^[-*]\s/m)) {
            const listItems = paragraph.split('\n').map((item, lIndex) => {
                if (!item.trim().startsWith('- ') && !item.trim().startsWith('* ')) {
                    return null; // Skip empty or non-list item lines
                }
                const itemContent = item.replace(/^[-*]\s*/, '');
                const parts = itemContent.split(/(\*\*.*?\*\*)/g).filter(Boolean);
                return (
                    <li key={lIndex} className="mb-1">
                        {parts.map((part, partIndex) => 
                            part.startsWith('**') && part.endsWith('**')
                                ? <strong key={partIndex}>{part.slice(2, -2)}</strong>
                                : part
                        )}
                    </li>
                );
            }).filter(Boolean);
            return <ul key={pIndex} className="list-disc list-inside space-y-1 my-2 pl-2">{listItems}</ul>;
        }
        
        // Handle regular paragraphs with inline formatting
        const parts = paragraph.split(/(\*\*.*?\*\*)/g).filter(Boolean);
        return (
            <p key={pIndex} className="my-1 leading-relaxed">
                {parts.map((part, partIndex) => 
                    part.startsWith('**') && part.endsWith('**')
                        ? <strong key={partIndex}>{part.slice(2, -2)}</strong>
                        : part
                )}
            </p>
        );
    });
};


interface ChatInterfaceProps {
    user: AuthenticatedUser;
    students: Student[];
    onAddProgressEntry: (studentId: string, area: string, observation: string, author: string) => Promise<boolean>;
}

interface ChatBubbleProps {
    message: ChatMessage;
}
const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
    if (message.sender === 'tool') {
        return (
            <div className="self-center flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                <Cog6ToothIcon className="w-5 h-5 animate-spin-slow"/>
                <span>{message.text}</span>
            </div>
        );
    }
    
    const isUser = message.sender === 'user';
    const bubbleClasses = isUser ? 'bg-sky-600 text-white self-end' : 'bg-slate-200 text-slate-800 self-start';
    return (
        <div className={`max-w-xl p-3 rounded-xl shadow-sm ${bubbleClasses}`}>
            <div className="text-sm leading-6">
                 {isUser ? message.text : renderMarkdown(message.text)}
            </div>
        </div>
    );
};

interface SuggestionChipProps {
    text: string;
    onClick: (text: string) => void;
}
const SuggestionChip: React.FC<SuggestionChipProps> = ({ text, onClick }) => (
    <button
        onClick={() => onClick(text)}
        className="px-3 py-1.5 bg-sky-100 text-sky-700 rounded-full text-sm font-medium hover:bg-sky-200 transition-colors"
    >
        {text}
    </button>
);


const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, students, onAddProgressEntry }) => {
    const getWelcomeMessage = () => {
        return `¡Hola, ${user.name.split(' ')[0]}! Soy tu Agente Pedagógico Virtual. Puedo ayudarte a crear estrategias, resumir progreso o **añadir observaciones a un estudiante**. ¿Cómo puedo asistirte?`;
    }
    
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: `msg_${Date.now()}`,
            sender: 'ia',
            text: getWelcomeMessage(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        if (user && students) {
            chatRef.current = createPedagogicalAgentChatSession(user, students);
        }
    }, [user, students]);

    const suggestionPrompts = useMemo(() => {
        const studentName = students[0]?.name || 'un estudiante';
        const studentNameForPrompt = students[0] ? `para ${studentName}` : '';
        return [
            `Añade una observación ${studentNameForPrompt} sobre su interés en la lectura.`,
            `Resume el progreso reciente de ${studentName}.`,
            `Sugerir 3 estrategias ${studentNameForPrompt} en matemáticas.`
        ];
    }, [students]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleFunctionCall = async (functionCall: any) => {
        const { name, args } = functionCall;
        if (name === 'addStudentObservation') {
            const { studentName, observation, area } = args;
            const student = students.find(s => s.name.toLowerCase() === studentName.toLowerCase());
            if (student) {
                const success = await onAddProgressEntry(student.id, area, observation, user.name);
                return { success, message: success ? `Observación añadida para ${studentName}.` : `No se pudo añadir la observación para ${studentName}.`};
            } else {
                return { success: false, message: `Estudiante "${studentName}" no encontrado en tu lista.` };
            }
        }
        return { success: false, message: "Función desconocida." };
    };

    const handleSend = async (messageText: string) => {
        if (!messageText.trim() || isLoading || !chatRef.current) return;
        setShowSuggestions(false);

        const userMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            sender: 'user',
            text: messageText,
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            let response = await chatRef.current.sendMessage({ message: messageText });

            while(true) {
                 if (response.functionCalls && response.functionCalls.length > 0) {
                    setMessages(prev => [...prev, { id: `tool_${Date.now()}`, sender: 'tool', text: `Usando herramienta: ${response.functionCalls[0].name}...` }]);
                    
                    const call = response.functionCalls[0];
                    const result = await handleFunctionCall(call);

                    response = await chatRef.current.sendMessage({
                        toolResponse: {
                            functionResponses: { id: call.id, name: call.name, response: result }
                        }
                    });
                } else if (response.text) {
                    const aiMessage: ChatMessage = {
                        id: `msg_${Date.now() + 1}`,
                        sender: 'ia',
                        text: response.text,
                    };
                    setMessages(prev => [...prev, aiMessage]);
                    break;
                } else {
                    // If no text and no function call, break to avoid infinite loop
                    break;
                }
            }

        } catch (error) {
            console.error("Failed to get response from Gemini", error);
            const errorMessage: ChatMessage = {
                id: `msg_err_${Date.now()}`,
                sender: 'ia',
                text: 'Lo siento, no pude procesar tu pregunta en este momento. Por favor, inténtalo de nuevo más tarde.',
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
                
                {showSuggestions && suggestionPrompts.length > 0 && students.length > 0 && (
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
                        className="w-full pl-4 pr-12 py-3 border bg-slate-100 border-slate-200 rounded-lg focus:ring-sky-500 focus:border-transparent transition resize-none text-sm leading-6 max-h-40"
                        disabled={isLoading}
                    />
                    <button
                        onClick={(e) => {
                            handleSend(input);
                            const inputElem = (e.currentTarget.previousSibling as HTMLTextAreaElement);
                            if (inputElem) inputElem.style.height = 'auto';
                        }}
                        disabled={isLoading || !input.trim()}
                        className="absolute bottom-2.5 right-2.5 flex items-center justify-center w-9 h-9 bg-sky-500 text-white rounded-lg disabled:bg-slate-400 hover:bg-sky-600 transition-colors"
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