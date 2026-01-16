import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Bug, Lightbulb, Send, Loader2, LogIn, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const FeedbackModal = ({ isOpen, onClose, source }) => {
  const { user } = useAuth();
  const [type, setType] = useState('opinion'); // opinion, bug, improvement
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [checkingLimit, setCheckingLimit] = useState(true);

  // Auto-fill email from authenticated user
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Check daily feedback limit
  useEffect(() => {
    const checkDailyLimit = async () => {
      if (!user?.uid) {
        setCheckingLimit(false);
        return;
      }

      try {
        // Get start of today (midnight)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Query feedback from today for this user
        const feedbackRef = collection(db, 'feedback');
        const q = query(
          feedbackRef, 
          where('userId', '==', user.uid),
          where('createdAt', '>=', today)
        );
        
        const snapshot = await getDocs(q);
        setDailyCount(snapshot.size);
      } catch (err) {
        console.error("Error checking daily limit:", err);
      } finally {
        setCheckingLimit(false);
      }
    };

    if (isOpen) {
      checkDailyLimit();
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !email.trim()) return;

    // Check daily limit
    if (dailyCount >= 2) {
      setError("Has alcanzado el límite de 2 comentarios por día. Inténtalo mañana.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, 'feedback'), {
        type,
        message,
        email,
        userId: user?.uid || null,
        source: source || 'unknown',
        createdAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      setSuccess(true);
      setDailyCount(prev => prev + 1); // Update local count
      setTimeout(() => {
        setSuccess(false);
        setMessage('');
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error sending feedback:", err);
      setError("Hubo un error al enviar tu mensaje. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        >
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Enviar Comentarios
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-2">Inicia sesión para continuar</h4>
            <p className="text-slate-600 mb-6">Necesitas una cuenta para enviar comentarios y evitar spam.</p>
            <a 
              href="/login" 
              className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir a Iniciar Sesión
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Enviar Comentarios
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">¡Mensaje Enviado!</h4>
              <p className="text-slate-600">Gracias por ayudarnos a mejorar.</p>
            </div>
          ) : (
            <>
              {/* Daily Limit Warning */}
              {!checkingLimit && dailyCount > 0 && (
                <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${dailyCount >= 2 ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                  <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${dailyCount >= 2 ? 'text-red-600' : 'text-amber-600'}`} />
                  <div className="text-sm">
                    <p className={`font-medium ${dailyCount >= 2 ? 'text-red-800' : 'text-amber-800'}`}>
                      {dailyCount >= 2 ? '⚠️ Límite alcanzado' : `Has enviado ${dailyCount} de 2 comentarios hoy`}
                    </p>
                    <p className={`text-xs mt-0.5 ${dailyCount >= 2 ? 'text-red-600' : 'text-amber-600'}`}>
                      {dailyCount >= 2 ? 'Podrás enviar más comentarios mañana.' : `Te queda${2 - dailyCount === 1 ? '' : 'n'} ${2 - dailyCount} comentario${2 - dailyCount === 1 ? '' : 's'} disponible${2 - dailyCount === 1 ? '' : 's'} para hoy.`}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Type Selection */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setType('opinion')}
                  className={`p-2 rounded-lg border flex flex-col items-center gap-1 text-xs transition-all ${type === 'opinion' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                >
                  <MessageSquare className="w-5 h-5" />
                  Opinión
                </button>
                <button
                  type="button"
                  onClick={() => setType('bug')}
                  className={`p-2 rounded-lg border flex flex-col items-center gap-1 text-xs transition-all ${type === 'bug' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                >
                  <Bug className="w-5 h-5" />
                  Error / Bug
                </button>
                <button
                  type="button"
                  onClick={() => setType('improvement')}
                  className={`p-2 rounded-lg border flex flex-col items-center gap-1 text-xs transition-all ${type === 'improvement' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                >
                  <Lightbulb className="w-5 h-5" />
                  Mejora
                </button>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tu mensaje
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[120px] resize-none text-sm"
                  placeholder="Describe el error, tu idea o comentario..."
                  required
                />
              </div>

              {/* Email (Required - Auto-filled from Auth) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tu correo <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-slate-50"
                  placeholder="tu@email.com"
                  required
                  disabled
                  title="Tu correo se obtiene automáticamente de tu cuenta"
                />
                <p className="text-xs text-slate-500 mt-1">Obtenido de tu cuenta autenticada</p>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || dailyCount >= 2 || checkingLimit}
                className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : checkingLimit ? 'Verificando...' : dailyCount >= 2 ? 'Límite alcanzado' : 'Enviar Comentarios'}
              </button>
            </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FeedbackModal;
