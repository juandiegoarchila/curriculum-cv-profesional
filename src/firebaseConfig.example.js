import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔒 INSTRUCCIONES DE SEGURIDAD:
// 1. Copia este archivo y renómbralo a "firebaseConfig.js"
// 2. Reemplaza los valores "YOUR_XXX" con tus credenciales reales de Firebase
// 3. NUNCA subas firebaseConfig.js a GitHub (ya está en .gitignore)

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Inicialización segura (fail-safe)
let app;
let auth;
let db;
let storage;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Forzar idioma español en Firebase Auth
    auth.languageCode = 'es';
} catch (error) {
    console.error("❌ Error al inicializar Firebase:", error);
    console.error("⚠️ Revisa tu archivo firebaseConfig.js y asegúrate de tener las credenciales correctas");
}

export { app, auth, db, storage };
