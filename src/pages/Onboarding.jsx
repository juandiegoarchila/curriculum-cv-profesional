import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Loader2, Sparkles, MoreVertical, Trash2, Edit2, LayoutDashboard, Plus, ArrowRight } from 'lucide-react';
import { extractTextFromPDF, parseCVFromText } from '../utils/cvParser';
import { useData } from '../context/DataContext';
import { 
  profile as defaultProfileData, 
  experience as defaultExperience, 
  projects as defaultProjects, 
  skills as defaultSkills, 
  education as defaultEducation, 
  continuousEducation as defaultContinuousEducation, 
  header as defaultHeader, 
  footer as defaultFooter, 
  labels as defaultLabels 
} from '../data';

const Onboarding = () => {
    const navigate = useNavigate();
    const { 
        isSaved, 
        loading, 
        profile, 
        cvTitle,
        saveData, 
        resetData 
    } = useData();
    
    const [isUploading, setIsUploading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [renameMode, setRenameMode] = useState(false);
    const [createMode, setCreateMode] = useState(false); // Mode to show onboarding options from dashboard
    const [newName, setNewName] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);
    const menuRef = useRef(null);

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleStartFromScratch = async () => {
        setIsUploading(true);
        // Cargar directamente la plantilla por defecto
        try {
            await saveData({
                profile: defaultProfileData, 
                experience: defaultExperience, 
                projects: defaultProjects, 
                skills: defaultSkills, 
                education: defaultEducation, 
                continuousEducation: defaultContinuousEducation,
                header: defaultHeader, 
                footer: defaultFooter, 
                labels: defaultLabels
            });
            await new Promise(resolve => setTimeout(resolve, 800)); // UX delay
            navigate('/admin');
        } catch (error) {
            console.warn("Error al inicializar plantilla:", error);
            navigate('/admin');
        }
    };

    const handleUploadCV = async (e) => {
        const file = e.target.files[0];
        if(file){
            setIsUploading(true);
            try {
                const text = await extractTextFromPDF(file);
                const parsedData = parseCVFromText(text);
                await saveData(parsedData);
                navigate('/admin', { state: { analyzing: true } });
            } catch (error) {
                console.error("Error procesando CV:", error);
                alert("Hubo un error al procesar el archivo.");
                setIsUploading(false);
            }
        }
    }

    const handleGoToResume = () => {
        navigate('/admin');
    };

    const handleDeleteResume = async () => {
        if(window.confirm("¿Estás seguro de eliminar este currículum? Esta acción no se puede deshacer.")){
            setShowMenu(false);
            try {
                await resetData();
                // DataContext.setIsSaved pasará a false auomáticamente via onSnapshot, 
                // disparando el re-render a la vista de "Nuevo Usuario".
            } catch (err) {
                console.error("Error al eliminar", err);
                alert("Error al eliminar el CV");
            }
        }
    };

    const handleRenameResume = async () => {
        if (!newName.trim()) return;
        setIsRenaming(true);
        try {
            // AHORA: Actualizamos SOLO el título del documento (cvTitle), NO el nombre dentro del perfil.
            // Esto permite tener un nombre de archivo diferente al nombre en el CV.
            await saveData({ cvTitle: newName });
            
            setRenameMode(false);
            setShowMenu(false);
        } catch (error) {
            console.error("Error renombrando:", error);
        } finally {
            setIsRenaming(false);
        }
    };

    // --- RENDERIZADO: LOADING ---
    if (loading) {
        return (
            <div className="fixed inset-0 bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-slate-500 text-sm font-medium">Cargando...</p>
                </div>
            </div>
        );
    }

    // --- RENDERIZADO: DASHBOARD (USUARIO EXISTENTE) ---
    // No mostrar Dashboard si estamos iniciando un proceso (isUploading)
    if (isSaved && !createMode && !isUploading) {
        // Formatear fecha
        const dateStr = new Date().toLocaleDateString('es-ES', { 
            month: 'long', day: 'numeric', year: 'numeric' 
        });

        // Título a mostrar: Prioridad a cvTitle, fallback a profile.name
        const displayTitle = (cvTitle && cvTitle.trim() !== "") 
            ? cvTitle
            : (profile?.name && profile.name.trim() !== "") ? profile.name : "Mi Currículum";

        return (
            <div className="fixed inset-0 min-h-[-webkit-fill-available] w-full bg-slate-50 flex flex-col font-sans">
                {/* Background Decorativo */}
                <div className='absolute inset-0 pointer-events-none opacity-30'>
                    <div className='absolute -top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl mix-blend-multiply opacity-50'></div>
                    <div className='absolute -bottom-20 -left-20 w-96 h-96 bg-purple-100 rounded-full blur-3xl mix-blend-multiply opacity-50'></div>
                </div>

                {/* Navbar Simple */}
                <div className="w-full bg-white border-b border-slate-200 px-6 py-4 z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <LayoutDashboard size={18} />
                         </div>
                         <h1 className="text-lg font-bold text-slate-800">Panel</h1>
                    </div>
                </div>

                {/* Contenido Principal */}
                <div className="flex-1 overflow-auto p-4 md:p-8 z-10 max-w-5xl mx-auto w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Mis documentos</h2>
                        <span className="text-xs md:text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">1 seleccionado</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {/* Tarjeta de Resumen */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-visible flex flex-col justify-between">
                            {/* Área clicable principal */}
                            <div className="p-4 md:p-5 cursor-pointer" onClick={handleGoToResume}>
                                <div className="flex items-start justify-between mb-3 md:mb-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                        <FileText size={20} className="md:w-6 md:h-6" />
                                    </div>
                                    {/* Menu Trigger */}
                                    <div className="relative" ref={menuRef}>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMenu(!showMenu);
                                                setNewName(displayTitle); 
                                            }}
                                            className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
                                        >
                                            <MoreVertical size={18} className="md:w-5 md:h-5" />
                                        </button>
                                        
                                        {/* Dropdown Menu */}
                                        {showMenu && (
                                            <div 
                                                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50 origin-top-right transform transition-all"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button 
                                                    onClick={() => { setRenameMode(true); setShowMenu(false); }}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                >
                                                    <Edit2 size={16} /> Renombrar
                                                </button>
                                                <button 
                                                    onClick={handleDeleteResume}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                    <Trash2 size={16} /> Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {displayTitle}
                                    </h3>
                                    <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wide font-medium mb-3 md:mb-4">BASE RESUME</p>
                                    <div className="flex items-center text-[10px] md:text-xs text-slate-400">
                                        <span>Editado: {dateStr}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Botón Acción Footer */}
                            <div className="border-t border-slate-100 p-2 md:p-3 bg-slate-50/50 rounded-b-xl flex justify-center mt-auto">
                                <button 
                                    onClick={handleGoToResume}
                                    className="text-xs md:text-sm font-semibold text-blue-600 hover:text-blue-700 w-full text-center py-1"
                                >
                                    Ver currículum
                                </button>
                            </div>
                        </div>

                        {/* Tarjeta de Crear Nuevo */}
                        <div 
                            className="bg-white rounded-xl border-2 border-dashed border-slate-200 shadow-sm hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center p-4 md:p-8 cursor-pointer group min-h-[180px] md:min-h-[220px]"
                            onClick={() => setCreateMode(true)}
                        >
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors mb-3 md:mb-4">
                                <Plus size={24} className="md:w-8 md:h-8" />
                            </div>
                            <h3 className="text-sm md:text-lg font-bold text-slate-700 group-hover:text-blue-700 mb-1">Crear Nuevo</h3>
                            <p className="text-[10px] md:text-xs text-slate-400 text-center max-w-[150px] md:max-w-[200px]">Empieza desde cero o sube un nuevo PDF</p>
                        </div>
                    </div>
                </div>

                {/* Modal Renombrar */}
                {renameMode && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Renombrar Currículum</h3>
                            <input 
                                type="text" 
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-6"
                                placeholder="Nuevo nombre..."
                                autoFocus
                            />
                            <div className="flex gap-3 justify-end">
                                <button 
                                    onClick={() => setRenameMode(false)}
                                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                                    disabled={isRenaming}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleRenameResume}
                                    disabled={isRenaming}
                                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md transition-colors flex items-center gap-2"
                                >
                                    {isRenaming ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        "Guardar"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- RENDERIZADO: ONBOARDING (NUEVO USUARIO) ---
    return (
        <div className="fixed inset-0 min-h-[-webkit-fill-available] w-full bg-slate-50 flex flex-col items-center justify-center font-sans overflow-hidden py-4">
           {/* Background */}
           <div className='absolute inset-0 pointer-events-none opacity-30'>
                <div className='absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full blur-3xl mix-blend-multiply opacity-50'></div>
                <div className='absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full blur-3xl mix-blend-multiply opacity-50'></div>
           </div>
    
           <div className="w-full max-w-md md:max-w-4xl px-4 z-10 flex flex-col h-full max-h-[600px] justify-between">
               {/* HEADER - Con Botón Atrás si estamos en modo Create y el usuario tiene Saved data */}
               <div className="text-center shrink-0 mb-2 md:mb-8 relative">
                   {isSaved && (
                        <button 
                            onClick={() => setCreateMode(false)}
                            className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 md:hidden"
                        >
                             <ArrowRight size={24} className="rotate-180" />
                        </button>
                   )}
                    <span className="bg-white/90 text-blue-700 text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase border border-blue-100 shadow-sm inline-block mb-2">
                        Comienza Hoy
                    </span>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        Crea tu CV <span className="text-blue-600">Pro</span>
                    </h1>
                    <p className="text-slate-500 text-xs md:text-base mt-1 px-4 truncate md:text-clip">
                        Elige cómo empezar. Rápido y fácil.
                    </p>
               </div>
               
               {/* CARDS */}
               <div className="flex-1 flex flex-col md:flex-row gap-3 md:gap-6 min-h-0 justify-center items-center">
                  
                  {/* Card 1: Upload */}
                  <div className="w-full md:w-1/2 relative group flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-8 flex flex-col items-center justify-center text-center transition-transform md:hover:-translate-y-1 md:hover:shadow-md">
                     <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-50 text-green-700 text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-100">
                        <Sparkles size={8} className="text-green-500 md:w-3 md:h-3" /> <span>Recomendado</span>
                     </div>
                     
                     <div className="mb-2 md:mb-4 bg-blue-50 p-3 md:p-4 rounded-xl text-blue-600">
                        {isUploading ? <Loader2 size={24} className="animate-spin md:w-8 md:h-8"/> : <Upload size={24} className="md:w-8 md:h-8" />}
                     </div>
                     <h3 className="text-base md:text-xl font-bold text-slate-900 mb-1">Cargar PDF</h3>
                     <p className="text-slate-400 text-[10px] md:text-sm mb-3 md:mb-6 line-clamp-1 md:line-clamp-none max-w-xs">
                        El algoritmo extraerá tus datos automáticamente para ahorrarte tiempo.    
                     </p>
                     
                     <label className={`w-full max-w-[200px] ${isUploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <div className="py-2 md:py-3 bg-blue-600 text-white font-bold rounded-lg text-sm md:text-base shadow-md active:scale-95 transition-transform truncate px-2 hover:bg-blue-700">
                            {isUploading ? "Procesando..." : "Subir Archivo"}
                        </div>
                        <input type="file" className="hidden" accept=".pdf" onChange={handleUploadCV} disabled={isUploading}/>
                    </label>
                  </div>
    
                  {/* Card 2: Manual / Template */}
              <div className={`w-full md:w-1/2 group flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-8 flex flex-col items-center justify-center text-center cursor-pointer active:bg-slate-50 transition-all md:hover:-translate-y-1 md:hover:shadow-md ${isUploading ? 'opacity-50 pointer-events-none' : ''}`} onClick={handleStartFromScratch}>
                 <div className="mb-2 md:mb-4 bg-slate-50 p-3 md:p-4 rounded-xl text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600">
                     {isUploading ? <Loader2 size={24} className="animate-spin md:w-8 md:h-8"/> : <FileText size={24} className="md:w-8 md:h-8" />}
                 </div>
                 <h3 className="text-base md:text-xl font-bold text-slate-900 mb-1">Plantilla Ejemplo</h3>
                 <p className="text-slate-400 text-[10px] md:text-sm mb-3 md:mb-6 line-clamp-1 md:line-clamp-none max-w-xs">
                    Inicia con una plantilla completa de ejemplo y adáptala a tu info.
                 </p>
                 
                 <button type="button" className="w-full max-w-[200px] py-2 md:py-3 bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-lg text-sm md:text-base active:scale-95 transition-transform truncate px-2 group-hover:border-slate-300 group-hover:text-slate-800" disabled={isUploading}>
                    {isUploading ? "Creando..." : "Usar Plantilla"}
                 </button>
              </div>

           </div>

           {/* FOOTER */}
           <div className="mt-4 shrink-0 flex flex-col items-center gap-2">
                {isSaved && (
                    <button 
                        onClick={() => setCreateMode(false)}
                        className="text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center gap-1"
                    >
                        <ArrowRight size={16} className="rotate-180" /> Volver al Panel
                    </button>
                )}
               <p className="text-center text-[10px] text-slate-400">
                    Privado y seguro ✨
               </p>
           </div>
           </div>
        </div>
      );
};

export default Onboarding;