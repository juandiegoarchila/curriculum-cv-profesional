import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, RefreshCw, LogOut, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
    const { user, logout, verifyUserEmail } = useAuth();
    const navigate = useNavigate();
    const [sending, setSending] = useState(false);
    const [checking, setChecking] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user?.emailVerified) {
            navigate('/admin');
        }
        
        // Interval para chequear si ya verificó (por si lo hace en otra pestaña)
        const interval = setInterval(async () => {
            if (user) {
                await user.reload();
                if (user.emailVerified) {
                    navigate('/admin');
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [user, navigate]);

    const handleResend = async () => {
        setSending(true);
        setMessage('');
        try {
            await verifyUserEmail(user);
            setMessage('¡Enlace enviado! Revisa tu bandeja de entrada (y spam).');
        } catch (error) {
            setMessage('Error: Espera unos minutos antes de intentar de nuevo.');
        } finally {
            setSending(false);
        }
    };

    const handleManualCheck = async () => {
        setChecking(true);
        setMessage('');
        try {
            await user.reload();
            if (user.emailVerified) {
                navigate('/admin');
            } else {
                setMessage('⚠️ Aún no detectamos la verificación. Asegúrate de hacer clic en el enlace del correo.');
            }
        } catch (error) {
            setMessage('Error al verificar. Intenta recargar la página.');
        } finally {
            setChecking(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3 sm:p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-slate-900 p-6 sm:p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-800 text-blue-400 mb-3 sm:mb-4 ring-4 ring-slate-800/50">
                        <Mail className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Verifica tu Correo</h2>
                    <p className="text-slate-400 mt-2 text-xs sm:text-sm max-w-[90%] mx-auto">
                        Para proteger tu seguridad, confirma que <span className="text-white font-medium">{user?.email}</span> es tu dirección real.
                    </p>
                </div>

                <div className="p-5 sm:p-8">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                        <p className="text-sm text-blue-900 leading-relaxed text-center mb-2 font-medium">
                            ✉️ Enlace de confirmación enviado.
                        </p>
                        <p className="text-xs text-blue-700/80 text-center leading-relaxed">
                            Busca en tu bandeja de entrada o en la carpeta de <strong>SPAM / Correo No Deseado</strong>.
                        </p>
                    </div>

                    {message && (
                        <div className={`text-center text-xs sm:text-sm mb-5 font-bold p-2 rounded-lg ${
                            message.includes('Error') || message.includes('⚠️') ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                        }`}>
                            {message}
                        </div>
                    )}

                    <div className="space-y-3">
                        <button 
                            onClick={handleManualCheck}
                            disabled={checking}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 px-4 rounded-xl text-sm sm:text-base font-bold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20 disabled:opacity-70"
                        >
                            {checking ? (
                                <RefreshCw size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <span>¡Ya lo verifiqué!</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                        <button 
                            onClick={handleResend}
                            disabled={sending}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 py-3 px-4 rounded-xl text-sm sm:text-base font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={sending ? "animate-spin" : ""} />
                            {sending ? 'Enviando...' : 'Reenviar correo'}
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <button 
                            onClick={handleLogout}
                            className="text-slate-400 hover:text-red-500 text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 mx-auto transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                        >
                            <LogOut size={14} />
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
