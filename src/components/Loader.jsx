import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ fullScreen = true }) => {
    const containerClasses = fullScreen 
        ? "fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center" 
        : "w-full h-full min-h-[400px] flex flex-col items-center justify-center";

    return (
        <div className={containerClasses}>
            <div className="relative flex items-center justify-center">
                {/* Efecto de pulso de fondo */}
                <motion.div
                    className="absolute w-24 h-24 rounded-full bg-blue-50"
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Spinner principal */}
                <motion.div
                    className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full z-10"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Punto central */}
                <motion.div 
                    className="absolute w-2 h-2 bg-blue-500 rounded-full z-20"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
            
            <motion.p 
                className="mt-6 text-slate-400 text-xs font-bold tracking-[0.2em] uppercase"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
                Cargando
            </motion.p>
        </div>
    );
};

export default Loader;
