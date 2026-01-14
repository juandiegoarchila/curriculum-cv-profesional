import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    // Verificación de seguridad por si Firebase falló al cargar
    if (!auth || !auth.app) { // auth.app existe si es la instancia real
       throw new Error("Firebase no está configurado. Revisa firebaseConfig.js");
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password) => {
    if (!auth || !auth.app) {
       throw new Error("Firebase no está configurado.");
    }
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    if (!auth || !auth.app) {
       throw new Error("Firebase no está configurado.");
    }
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => {
    if (!auth || !auth.app) return Promise.resolve();
    return signOut(auth);
  };

  const resetPassword = (email) => {
    if (!auth || !auth.app) throw new Error("Firebase no está configurado.");
    auth.languageCode = 'es'; // Forzar idioma español en correos
    return sendPasswordResetEmail(auth, email);
  };

  const verifyUserEmail = (userToVerify) => {
    if (!auth || !auth.app) throw new Error("Firebase no está configurado.");
    auth.languageCode = 'es'; // Forzar idioma español en correos
    return sendEmailVerification(userToVerify);
  };

  useEffect(() => {
    let unsubscribe;
    try {
        if (auth && auth.app) { // Solo si es instancia real
            unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                setUser(currentUser);
                setLoading(false);
            });
        } else {
            setLoading(false); // No hay auth, terminamos de cargar
        }
    } catch (e) {
        console.error("Auth init error", e);
        setLoading(false);
    }

    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    verifyUserEmail
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
