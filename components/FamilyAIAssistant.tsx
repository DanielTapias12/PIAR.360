

import React, { useState, useRef, useEffect } from 'react';
import type { Student, FamilyMessage } from '../types';
import { getFamilyAssistantResponse } from '../services/geminiService';
import { PaperAirplaneIcon, SparklesIcon } from './icons/Icons';

interface FamilyAIAssistantProps {
    student: Student;
}

interface ChatBubbleProps {
    message: FamilyMessage;
}

// FIX: Explicitly typed as React.FC to solve type error with 'key' prop in lists.
const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
    const isUser = message.sender === 'user';
    const bubbleClasses = isUser ? 'bg-emerald-600 text-white self-end' : 'bg-slate-200 text-slate-800 self-start';
    return (
        <div className={`max-w-md p-3 rounded-xl ${bubbleClasses}`}>
            <p className="text-sm">{message.text}</p>
        </div>
    );
};

const FamilyAIAssistant: React.FC<FamilyAIAssistantProps> = ({ student }) => {
    const [messages, setMessages] = useState<FamilyMessage[]>([
        {
            id: `msg_${Date.now()}`,
            sender: 'ia',
            text: `¡Hola! Soy tu asistente de IA. Puedo responder preguntas sobre el PIAR de ${student.name} y darte ideas para apoyarlo en casa. ¿En qué te puedo ayudar hoy?`,
            timestamp: new Date().toISOString()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: FamilyMessage = {
            id: `msg_${Date.now()}`,
            sender: 'user',
            text: input,
            // FIX: Corrected typo `new new Date()` to `new Date()`.
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const geminiHistory = [...messages, userMessage].map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));

        try {
            const responseText = await getFamilyAssistantResponse(student, geminiHistory);
            const aiMessage: FamilyMessage = {
                id: `msg_${Date.now() + 1}`,
                sender: 'ia',
                text: responseText,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Failed to get response from Gemini", error);
            const errorMessage: FamilyMessage = {
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

    return (
        <div className="p-6 flex flex-col h-[70vh]">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 flex flex-col">
                {messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}
                 {isLoading && (
                    <div className="self-start flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-6">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Escribe tu pregunta aquí..."
                        className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-emerald-600 disabled:text-slate-400 hover:bg-emerald-100 rounded-r-lg"
                    >
                        <PaperAirplaneIcon className="w-6 h-6" />
                    </button>
                </div>
                 <p className="text-xs text-slate-400 mt-2 text-center flex items-center justify-center">
                    <SparklesIcon className="w-3 h-3 mr-1"/> Respuestas generadas por IA. Consulta siempre con el equipo docente.
                </p>
            </div>
        </div>
    );
};

export default FamilyAIAssistant;
