import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, message, type = 'success' }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-0">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className={`h-2 w-full ${type === 'success' ? 'bg-green-500' : 'bg-amber-500'}`} />
                        
                        <div className="p-6">
                            <div className="flex justify-center mb-4">
                                <div className={`p-3 rounded-full ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {type === 'success' ? <Check size={32} strokeWidth={3} /> : <AlertTriangle size={32} />}
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">{title}</h3>
                            <p className="text-center text-slate-600 mb-6 leading-relaxed">
                                {message}
                            </p>

                            <button 
                                onClick={onClose}
                                className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 transition-transform active:scale-95 ${
                                    type === 'success' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-amber-500 hover:bg-amber-600'
                                }`}
                            >
                                Entendido
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
