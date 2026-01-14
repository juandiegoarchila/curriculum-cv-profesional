import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de Firebase - Reemplaza con tus propias claves
// Puedes obtenerlas en la consola de Firebase: Project Settings > General > SDK Setup
const firebaseConfig = {
  apiKey: "AIzaSyBb4wH3rwhlQ9_HY1J0GtJr1rgD8kL5x3Q",
  authDomain: "curriculum-cv-profesional.firebaseapp.com",
  projectId: "curriculum-cv-profesional",
  storageBucket: "curriculum-cv-profesional.firebasestorage.app",
  messagingSenderId: "263771637772",
  appId: "1:263771637772:web:6d8957b1f8ef4ff1d94629",
  measurementId: "G-GP246CG3YX"
};

// Inicialización segura (fail-safe)
let app;
let auth;
let db;
let storage;

try {
    // Solo inicializamos si parece una config válida, o intentamos de todas formas
    // y capturamos errores si las keys son placeholders.
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
} catch (error) {
    console.warn("Firebase no se pudo inicializar correctamente. La aplicación funcionará en modo solo lectura con datos locales.", error);
    // Mocks para evitar crashes
    auth = { 
        currentUser: null, 
        signInWithEmailAndPassword: () => Promise.reject("Firebase no configurado"),
        signOut: () => Promise.resolve(),
        onAuthStateChanged: (cb) => { cb(null); return () => {}; }
    };
    db = {}; 
    storage = {};
}

export { auth, db, storage };
