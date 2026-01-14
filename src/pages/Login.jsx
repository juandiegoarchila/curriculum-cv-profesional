import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isResetting, setIsResetting] = useState(false); // Estado para recuperación
    const [loadingLocal, setLoadingLocal] = useState(false);
    
    // Inicializar estado desde localStorage si existe
    const [rememberMe, setRememberMe] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'success' });
    const { login, register, loginWithGoogle, user, resetPassword, verifyUserEmail } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/admin');
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoadingLocal(true);

        // Lógica de "Recordarme"
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        try {
            if (isRegistering) {
                const userCred = await register(email, password);
                // Enviar verificación de email inmediatamente
                await verifyUserEmail(userCred.user);
                setModalConfig({
                    isOpen: true,
                    title: '¡Cuenta Creada!',
                    message: 'Hemos enviado un enlace de confirmación a tu correo. Por favor verifícalo para acceder.',
                    type: 'success'
                });
            } else {
                await login(email, password);
            }
            // navigate('/admin'); // Removed automatic navigate here to allow modal or verification check
        } catch (err) {
            setError('Error: ' + (err.message || "Fallo desconocido"));
            setLoadingLocal(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Por favor ingresa tu correo electrónico.');
            return;
        }
        setError('');
        setSuccessMessage('');
        setLoadingLocal(true);
        try {
            await resetPassword(email);
            setModalConfig({
                isOpen: true,
                title: 'Correo Enviado',
                message: 'Si tu email está registrado, recibirás un enlace para restablecer tu contraseña en unos momentos.',
                type: 'success'
            });
            setLoadingLocal(false);
            setIsResetting(false);
        } catch (err) {
            setError('Error al enviar correo: ' + err.message);
            setLoadingLocal(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoadingLocal(true);
        try {
            await loginWithGoogle();
             // Google verifica automáticamente
        } catch (err) {
            setError('Error Google Auth: ' + err.message);
            setLoadingLocal(false);
        }
    };

    // Efecto para redirigir SI ya está logueado Y verificado
    useEffect(() => {
        if (user) {
             if (user.emailVerified) {
                 // Redirigir al onboarding en lugar de ir directo al admin
                 navigate('/onboarding');
             } else if (!modalConfig.isOpen) {
                 // Solo si no estamos mostrando un modal (como el de "Registro Existoso")
                 navigate('/verify-email');
             }
        }
    }, [user, navigate, modalConfig.isOpen]);

    if (loadingLocal) return <Loader />;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
             <Modal 
                isOpen={modalConfig.isOpen} 
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                title={modalConfig.title} 
                message={modalConfig.message}
                type={modalConfig.type}
            />
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-100">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {isResetting ? 'Recuperar Acceso' : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')}
                    </h2>
                    {!isResetting && !isRegistering && (
                        <p className="text-slate-500 text-xs mt-2">
                            Ingresa para recuperar tus datos y configuración.
                        </p>
                    )}
                </div>
                
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-xs font-medium border border-red-100">{error}</div>}
                {successMessage && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-xs font-medium border border-green-100">{successMessage}</div>}
                
                {isResetting ? (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <p className="text-xs text-slate-500 mb-4 text-center">
                            Te enviaremos un enlace para restaurar tu contraseña.
                        </p>
                         <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                            <input 
                                type="email" 
                                className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="tu@email.com"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-200"
                        >
                            Enviar Enlace
                        </button>
                        <button 
                            type="button"
                            onClick={() => setIsResetting(false)}
                            className="w-full text-slate-500 text-xs hover:text-slate-800 mt-2 font-medium"
                        >
                            Volver a Iniciar Sesión
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                            <input 
                                type="email"
                                autoComplete="email" 
                                className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="nombre@ejemplo.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
                            <input 
                                type="password"
                                autoComplete="current-password"
                                className="block w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        
                        {!isRegistering && (
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs text-slate-600 font-medium select-none">Recordar correo</span>
                                </label>

                                <button 
                                    type="button"
                                    onClick={() => setIsResetting(true)} 
                                    className="text-xs text-blue-600 hover:text-blue-700 font-bold"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition-all font-bold text-sm shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-0.5"
                        >
                            {isRegistering ? 'Registrarse Gratis' : 'Entrar'}
                        </button>
                    </form>
                )}

                {!isResetting && (
                    <>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-white text-slate-400">O continúa con</span>
                            </div>
                        </div>

                        <div>
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 py-2.5 px-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-sm group"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Acceder con Google
                            </button>
                        </div>

                        <div className="mt-8 text-center">
                            <button 
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                            >
                                {isRegistering 
                                    ? '¿Ya tienes cuenta? Inicia sesión' 
                                    : <span className='text-slate-500'>¿No tienes cuenta? <span className="text-blue-600 font-bold">Regístrate gratis</span></span>}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;
