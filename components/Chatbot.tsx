import React from 'react';
import { PaperAirplaneIcon, SparklesIcon } from './icons/Icons';

const Chatbot: React.FC = () => {
    return (
        <div className="flex flex-col h-full bg-slate-50 p-4">
            <header className="pb-4">
                 <h1 className="text-2xl font-bold text-slate-800">Asistente Chatbot</h1>
                 <p className="text-slate-500 mt-1">Componente de Chatbot listo para implementar.</p>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 flex flex-col bg-white rounded-lg border border-slate-200">
                {/* Chat messages will be rendered here */}
                <div className="p-4 bg-slate-100 text-slate-700 self-start rounded-xl max-w-lg">
                    <p className="text-sm">¡Hola! Soy un asistente virtual. ¿Cómo puedo ayudarte hoy?</p>
                </div>
            </div>

            <footer className="pt-4 bg-slate-50 sticky bottom-0">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Escribe tu mensaje..."
                        className="w-full pl-4 pr-12 py-3 border bg-slate-100 border-slate-200 rounded-lg focus:ring-sky-500 focus:border-transparent transition text-sm leading-6"
                    />
                    <button
                        className="absolute bottom-2.5 right-2.5 flex items-center justify-center w-9 h-9 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                        aria-label="Enviar mensaje"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
                 <p className="text-xs text-slate-400 mt-2 text-center flex items-center justify-center">
                    <SparklesIcon className="w-3 h-3 mr-1"/> Chatbot en desarrollo.
                </p>
            </footer>
        </div>
    );
};

export default Chatbot;
