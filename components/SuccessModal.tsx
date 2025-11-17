import React from 'react';
import { CheckCircleIcon } from './icons/Icons';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <CheckCircleIcon className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
                <p className="text-sm text-slate-600 mb-6">{message}</p>
                <button
                    onClick={onClose}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sky-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:text-sm"
                >
                    Ir a Iniciar Sesión
                </button>
            </div>
        </div>
    );
};

export default SuccessModal;
