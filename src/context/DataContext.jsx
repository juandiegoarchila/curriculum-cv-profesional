import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { 
    profile as defaultProfile, 
    experience as defaultExperience, 
    projects as defaultProjects, 
    skills as defaultSkills, 
    education as defaultEducation,
    continuousEducation as defaultContinuousEducation,
    header as defaultHeader,
    footer as defaultFooter,
    labels as defaultLabels
} from '../data';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children, userId }) => {
    const { user, loading: authLoading } = useAuth();
    // Inicializar estado con los datos del archivo local (data.js)
    const [profile, setProfile] = useState(defaultProfile);
    const [experience, setExperience] = useState(defaultExperience);
    const [projects, setProjects] = useState(defaultProjects);
    const [skills, setSkills] = useState(defaultSkills);
    const [education, setEducation] = useState(defaultEducation);
    const [continuousEducation, setContinuousEducation] = useState(defaultContinuousEducation);
    
    // Nuevos estados para Header y Footer con valores por defecto
    const [header, setHeader] = useState(defaultHeader);
    const [footer, setFooter] = useState(defaultFooter);
    const [labels, setLabels] = useState(defaultLabels);

    const [theme, setTheme] = useState({
        template: 'new-york',
        font: 'Arimo',
        color: '#0f172a'
    });
    // Visibilidad de secciones (para la web pública)
    const [sectionVisibility, setSectionVisibility] = useState({
        profile: true,
        experience: true,
        projects: true,
        skills: true,
        education: true,
        contact: true
    });

    // Nuevo estado para el título del documento (separado del contenido del CV)
    const [cvTitle, setCvTitle] = useState("Mi Currículum");

    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        
        let path = 'content/cv_data';
        if (userId) path = `users/${userId}/data/cv`;
        else if (user) path = `users/${user.uid}/data/cv`;

        // Suscripción en tiempo real a Firebase
        if (!db || Object.keys(db).length === 0) {
            console.log("Firebase no configurado, usando datos locales.");
            setLoading(false);
            return;
        }

        const docRef = doc(db, path);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setIsSaved(true);
                const data = docSnap.data();
                console.log("Datos actualizados desde Firebase:", path);
                
                // MIGRACIÓN AUTOMÁTICA DESHABILITADA PARA EVITAR SOBRESCRIBIR DATOS DE USUARIOS REALES
                
                if (data.profile) {
                    setProfile(prev => ({
                        ...prev,
                        ...data.profile
                    }));
                }
                
                if (data.experience) setExperience(data.experience);
                if (data.projects) setProjects(data.projects); // Respetar lista vacía si viene así
                
                if (data.skills) setSkills(data.skills);
                if (data.education) setEducation(data.education);
                if (data.continuousEducation) setContinuousEducation(data.continuousEducation);
                
                // Header y Footer: Asegurar copyright nuevo y estilos planos
                if (data.header) setHeader(data.header);
                if (data.footer) {
                     setFooter(prev => ({
                         ...data.footer,
                         // Forzar el nuevo copyright actualizando el año si es necesario
                         copyrightText: data.footer.copyrightText || defaultFooter.copyrightText
                     }));
                } else {
                     setFooter(defaultFooter);
                }
                
                if (data.labels) setLabels(data.labels);
                if (data.theme) setTheme(data.theme);
                if (data.sectionVisibility) setSectionVisibility(data.sectionVisibility);
                // Cargar título del documento si existe, sino usar default o nombre del perfil
                if (data.cvTitle) {
                    setCvTitle(data.cvTitle);
                } else if (data.profile && data.profile.name) {
                    // Fallback inicial para migraciones: usar nombre del perfil
                     setCvTitle(data.profile.name);
                }
            } else {
                 console.log("Documento no encontrado, usando defaults:", path);
                 setIsSaved(false);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error en suscripción Firebase:", error);
            setLoading(false);
        });

        // Limpieza de suscripción al desmontar
        return () => unsubscribe();
    }, [user, authLoading, userId]);

    const saveData = async (newData) => {
        if (!db || Object.keys(db).length === 0) {
            throw new Error("No hay conexión a base de datos.");
        }
        
        if (!user) throw new Error("Debes iniciar sesión para guardar.");
        
        const path = `users/${user.uid}/data/cv`;

        try {
            // Nota: No necesitamos actualizar el estado local aquí manualmente (setProfile, etc)
            // porque la suscripción 'onSnapshot' de arriba lo hará automáticamente 
            // en cuanto Firebase confirme el cambio. Esto nos asegura que "lo que veo es lo que hay en DB".
            await setDoc(doc(db, path), newData, { merge: true });
            return true;
        } catch (e) {
            console.error("Error guardando documento: ", e);
            throw e;
        }
    };

    const resetData = async () => {
        if (!user) return;
        const path = `users/${user.uid}/data/cv`;
        
        try {
            await deleteDoc(doc(db, path));
            // Actualizar visualmente a defaults si es necesario, 
            // aunque el onSnapshot debería encargarse al detectar que no existe doc (setIsSaved(false))
            // y reactivando los defaults si así estuviera programado, 
            // pero actualmente onSnapshot solo hace setIsSaved(false).
            // Para asegurar la UX de "volver a empezar":
            setProfile(defaultProfile);
            setHeader(defaultHeader);
            // ... resto de resets si fuera necesario, pero setIsSaved(false) controlará la vista en Onboarding
            return true;
        } catch (e) {
            console.error("Error borrando datos:", e);
            throw e;
        }
    };


    // Exportar PDF dinámico desde cualquier parte
    const exportPDF = async (customData) => {
        // Permite exportar datos customizados o los actuales del contexto
        const data = customData || {
            profile,
            experience,
            projects,
            skills,
            education,
            continuousEducation,
            header,
            footer,
            theme,
            labels,
            sectionVisibility
        };
        // Completar base64 si falta pero hay URL (garantiza imagen en PDF)
        if (data.profile && !data.profile.photoBase64 && data.profile.photoURL) {
            try {
                const response = await fetch(data.profile.photoURL, { mode: 'cors' });
                const blob = await response.blob();
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
                data.profile.photoBase64 = base64;
            } catch (err) {
                console.warn('No se pudo precargar foto en base64 para PDF', err);
            }
        }

        // Buscar el contenedor del CV (si no existe, renderizar uno temporal)
        let element = document.getElementById('printable-cv-container');
        let wrapper = document.getElementById('print-wrapper');
        let temp = false;
        if (!element || !wrapper) {
            // Crear wrapper temporal
            temp = true;
            wrapper = document.createElement('div');
            wrapper.id = 'print-wrapper';
            wrapper.style.display = 'block';
            element = document.createElement('div');
            element.id = 'printable-cv-container';
            wrapper.appendChild(element);
            document.body.appendChild(wrapper);
            // Renderizar el CV dentro del wrapper temporal
            const ReactDOM = await import('react-dom');
            const { CVContent } = await import('../components/CVPreview');
            ReactDOM.render(React.createElement(CVContent, { data }), element);
            // Esperar a que el render se comprometa en el DOM
            await new Promise((r) => setTimeout(r, 500));
        } else {
            wrapper.style.display = 'block';
        }

        // Convert remote images to base64 to avoid CORS tainting when html2canvas runs
        const images = wrapper.querySelectorAll('img');
        if (images.length > 0) {
            await Promise.all(Array.from(images).map(async (img) => {
                if (img.src.startsWith('data:')) return Promise.resolve();
                try {
                    const response = await fetch(img.src, { mode: 'cors' });
                    const blob = await response.blob();
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            img.src = reader.result;
                            img.onload = resolve;
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                } catch (err) {
                    console.warn('Fallo conversión base64, fallback crossOrigin', err);
                    if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
                    return new Promise((resolve) => {
                        img.crossOrigin = 'anonymous';
                        img.onload = resolve;
                        img.onerror = resolve;
                        setTimeout(resolve, 3000);
                    });
                }
            }));
            await new Promise(r => setTimeout(r, 800));
        }

        const opt = {
            margin: 0,
            filename: `CV_${(data.profile?.name || 'CV').replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            const html2pdf = (await import('html2pdf.js')).default;
            await html2pdf().from(element).set(opt).save();
        } catch (e) {
            console.error(e);
            alert('Error al generar PDF: ' + e.message);
        } finally {
            if (wrapper) wrapper.style.display = 'none';
            if (temp && wrapper) {
                // Limpiar wrapper temporal
                setTimeout(() => {
                    const ReactDOM = window.ReactDOM || require('react-dom');
                    try {
                        ReactDOM.unmountComponentAtNode(element);
                    } catch {}
                    document.body.removeChild(wrapper);
                }, 500);
            }
        }
    };

    // Exponer la función también en window para compatibilidad inmediata
    if (typeof window !== 'undefined') {
        window.handleDownloadCV = exportPDF;
    }

    const value = {
        profile,
        experience,
        projects,
        skills,
        education,
        continuousEducation,
        header,
        footer,
        labels,
        theme,
        cvTitle,
        loading,
        isSaved,
        saveData,
        resetData,
        exportPDF,
        sectionVisibility
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
