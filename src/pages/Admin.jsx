import { db } from '../firebaseConfig'; // Importamos db para manejo de usernames
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'; // Funciones de Firestore
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { storage } from '../firebaseConfig'; // Importamos storage
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Funciones de Storage
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, LogOut, Plus, Trash2, Eye, Layout, ChevronDown, ChevronRight, GripVertical, Check, Menu, X, Undo2, Redo2, MessageCircle, Send, Phone, AlertTriangle, Download, FileText, Info, Share2, Settings, Edit2, RotateCcw, User, Briefcase, FolderGit2, Cpu, CheckCircle2, Sparkles, ExternalLink, Palette, Mail } from 'lucide-react';
import { Reorder, useDragControls, motion, AnimatePresence } from 'framer-motion';
import ImageCropper from '../components/ImageCropper';
import FeedbackModal from '../components/FeedbackModal'; // Importar FeedbackModal
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

import Hero from '../components/Hero';
import Header from '../components/Header';
import Experience from '../components/Experience';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Education from '../components/Education';
import Footer from '../components/Footer';
import CVPreview, { CVContent } from '../components/CVPreview';
import Loader from '../components/Loader';

// Helper: Generador de IDs simples para UI
const generateId = () => Math.random().toString(36).substr(2, 9);
const ensureIds = (list) => list.map(item => ({ ...item, _id: item._id || generateId() }));
const stripIds = (list) => list.map(({ _id, ...rest }) => rest);

// Helper for TextAreas (Arrays to String)
const listToString = (list) => {
    if (!list) return '';
    if (typeof list === 'string') return list;
    if (Array.isArray(list)) return list.join('\n');
    return '';
};

// Componente Frame para aislar estilos (Iframe Portal)
const Frame = ({ children, className }) => {
  const [contentRef, setContentRef] = useState(null)
  const mountNode = contentRef?.contentWindow?.document?.body

  useEffect(() => {
     if(!contentRef) return;
     const doc = contentRef.contentWindow.document;
     
     // 1. Resetear estilos del body del iframe
     doc.body.style.margin = '0';
     doc.body.style.padding = '0';
     doc.body.style.backgroundColor = '#ffffff';

     // 2. Copiar hojas de estilo del parent para que Tailwind funcione
     const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"));
     styles.forEach(s => {
         doc.head.appendChild(s.cloneNode(true));
     });
     
     // 3. Copiar clases al body si se requieren
     if(className) doc.body.className = className;
  }, [contentRef, className]);

  return (
    <iframe 
       ref={setContentRef} 
       className="w-full h-full border-none" 
       title="preview-frame"
    >
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  )
}

const DebouncedColorPicker = ({ value, onChange }) => {
    const [localColor, setLocalColor] = useState(value);
    const timeoutRef = useRef(null);

    useEffect(() => {
        setLocalColor(value);
    }, [value]);

    const handleChange = (e) => {
        const val = e.target.value;
        setLocalColor(val);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
             onChange(val);
        }, 200);
    };

    return (
        <input 
            type="color" 
            value={localColor || '#000000'}
            onChange={handleChange}
            className="absolute -top-10 -left-10 w-32 h-32 opacity-0 cursor-pointer"
        />
    );
};

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const YEARS = Array.from({length: 40}, (_, i) => new Date().getFullYear() - i); 

const COUNTRY_CODES = [
    { name: 'Colombia', code: '57', flag: '🇨🇴' },
    { name: 'México', code: '52', flag: '🇲🇽' },
    { name: 'España', code: '34', flag: '🇪🇸' },
    { name: 'Estados Unidos', code: '1', flag: '🇺🇸' },
    { name: 'Argentina', code: '54', flag: '🇦🇷' },
    { name: 'Chile', code: '56', flag: '🇨🇱' },
    { name: 'Perú', code: '51', flag: '🇵🇪' },
    { name: 'Ecuador', code: '593', flag: '🇪🇨' },
    { name: 'Venezuela', code: '58', flag: '🇻🇪' },
    { name: 'Brasil', code: '55', flag: '🇧🇷' },
    { name: 'Uruguay', code: '598', flag: '🇺🇾' },
    { name: 'Paraguay', code: '595', flag: '🇵🇾' },
    { name: 'Bolivia', code: '591', flag: '🇧🇴' },
    { name: 'Panamá', code: '507', flag: '🇵🇦' },
    { name: 'Costa Rica', code: '506', flag: '🇨🇷' },
    { name: 'Rep. Dominicana', code: '1809', flag: '🇩🇴' },
    { name: 'Otro', code: '', flag: '🌐' }
];

const LINK_OPTIONS = {
  experience: [
    "Visitar sitio web",
    "Ver empresa",
    "Ver proyecto",
    "Ver portafolio",
    "Ver referencia",
    "Ver carta de recomendación"
  ],
  projects: [
    "Ver Proyecto",
    "Ver Código en GitHub",
    "Ver Demo en Vivo",
    "Descargar App",
    "Ver Diseño Figma",
    "Ver Video Demo",
    "Ver Case Study"
  ],
  education: [
    "Ver Credencial",
    "Ver Título",
    "Ver Certificado",
    "Sitio de la Institución",
    "Ver Malla Curricular",
    "Ver Diploma"
  ]
};

const STAT_ICONS = [
    { id: 'Star', name: 'Estrella' },
    { id: 'TrendingUp', name: 'Tendencia/Crecimiento' },
    { id: 'Users', name: 'Usuarios/Comunidad' },
    { id: 'Zap', name: 'Rayo/Velocidad' },
    { id: 'Layout', name: 'Interfaz/Diseño' },
    { id: 'Globe', name: 'Web/Mundo' },
    { id: 'BarChart3', name: 'Gráfico Barras' },
    { id: 'ShoppingCart', name: 'Ecommerce/Ventas' }
];

// Helper Hook for History
const useHistory = (initialState) => {
    const [history, setHistory] = useState([initialState]);
    const [index, setIndex] = useState(0);

    const setState = (newState) => {
        // If the new state is basically the same, don't update
        // Simple JSON Deep Equal Check
        if (JSON.stringify(history[index]) === JSON.stringify(newState)) return;

        const copy = history.slice(0, index + 1);
        
        // Limit history to 15 items
        if (copy.length >= 15) {
            copy.shift(); // Remove oldest
        }

        copy.push(newState);
        setHistory(copy);
        setIndex(copy.length - 1);
    };

    const undo = () => {
        if (index > 0) {
            setIndex((prev) => prev - 1);
        }
    };

    const redo = () => {
        if (index < history.length - 1) {
            setIndex((prev) => prev + 1);
        }
    };

    return [history[index], setState, undo, redo, index > 0, index < history.length - 1];
};

const Section = ({ title, children, isOpen, toggle, color = "slate", onFocus, isVisible = true, onToggleVisibility }) => {
    const [showMenu, setShowMenu] = useState(false);
    const anchorRef = useRef(null);
    const menuRef = useRef(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

    const updateMenuPosition = useCallback(() => {
        const rect = anchorRef.current?.getBoundingClientRect();
        if (!rect) return;
        const padding = 8;
        const menuWidth = (menuRef.current?.offsetWidth ?? 220);
        const menuHeight = (menuRef.current?.offsetHeight ?? 100);

        let left = rect.right - menuWidth;
        left = Math.min(left, window.innerWidth - menuWidth - padding);
        left = Math.max(left, padding);

        let top = rect.bottom + padding;
        const lacksSpaceBelow = (rect.bottom + menuHeight + padding) > window.innerHeight;
        if (lacksSpaceBelow) {
            top = rect.top - menuHeight - padding;
        }
        top = Math.max(top, padding);
        top = Math.min(top, window.innerHeight - menuHeight - padding);

        setMenuPos({ top, left });
    }, []);

    useEffect(() => {
        if (!showMenu) return;
        const handler = () => updateMenuPosition();
        handler();
        window.addEventListener('scroll', handler, true);
        window.addEventListener('resize', handler);
        return () => {
            window.removeEventListener('scroll', handler, true);
            window.removeEventListener('resize', handler);
        };
    }, [showMenu, updateMenuPosition]);

    useEffect(() => {
        if (!showMenu) return;
        const onDocClick = (e) => {
            const target = e.target;
            const menuEl = menuRef.current;
            const anchorEl = anchorRef.current;
            if (!menuEl || !anchorEl) return;
            if (!menuEl.contains(target) && !anchorEl.contains(target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', onDocClick, { capture: true });
        return () => document.removeEventListener('mousedown', onDocClick, { capture: true });
    }, [showMenu]);
  
    return (
  <div 
    className={`border rounded-lg mb-4 bg-white shadow-sm overflow-visible border-${color}-200 transition-opacity duration-300 ${!isVisible ? 'opacity-60' : ''}`}
  >
        <div 
            className={`w-full flex justify-between items-center p-4 bg-${color}-50 hover:bg-${color}-100 transition-colors sticky top-0 z-20 cursor-pointer`}
            onClick={() => { toggle(); if(onFocus && !isOpen) onFocus(); }}
        >
        <div className="flex-1 relative">
            <button 
              onClick={() => { toggle(); if(onFocus && !isOpen) onFocus(); }}
              className="flex-1 text-left flex items-center gap-2 outline-none"
            >
              <h3 className={`font-bold text-lg text-${color}-800`}>{title}</h3>
              {!isVisible && <span className="text-[10px] uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">Oculto</span>}
            </button>
        </div>
        
                <div className="flex items-center gap-2 relative z-50">
                        {onToggleVisibility && (
                            <div className="relative" ref={anchorRef}>
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setShowMenu((prev) => {
                                            const next = !prev;
                                            if (next) {
                                                setTimeout(updateMenuPosition, 0);
                                            }
                                            return next;
                                        });
                                    }}
                                    className="p-2 rounded-full transition-all text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                                    title="Opciones de sección"
                                >
                                    <Settings size={18} />
                                </button>
                                
                                {showMenu && createPortal(
                                    <div 
                                        ref={menuRef}
                                        className="fixed bg-white border border-slate-200 rounded-lg shadow-xl z-30 min-w-max"
                                        style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
                                    >
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onToggleVisibility(); setShowMenu(false); }}
                                            className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 text-sm text-slate-700 rounded-lg transition-colors"
                                        >
                                            <Eye size={14} /> {isVisible ? 'Ocultar' : 'Mostrar'} sección
                                        </button>
                                    </div>, document.body
                                )}
                            </div>
                        )}
            
            <button
                onClick={() => { toggle(); if(onFocus && !isOpen) onFocus(); }}
                className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            >
                <ChevronDown size={20} className={`text-${color}-800`} />
            </button>
        </div>
    </div>
    
    {isOpen && (
        <div className={`p-4 border-t border-slate-100 bg-slate-50/30 overflow-visible relative ${!isVisible ? 'grayscale opacity-70 pointer-events-none select-none' : ''}`}>
             {children}
        </div>
    )}
  </div>
  );
};

// Componente individual arrastrable
const DraggableItem = ({ item, title, subtitle, onDelete, children, onFocus }) => {
    const controls = useDragControls();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAction = () => {
        const isOpening = !isExpanded;
        setIsExpanded(isOpening);
        // Desplazar cuando se abre
        if(onFocus && isOpening) {
            setTimeout(() => onFocus(), 100);
        }
    }

    return (
        <Reorder.Item
            value={item}
            dragListener={false}
            dragControls={controls}
            layout="position"
            className="mb-3 relative bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden group"
            style={{ listStyle: 'none' }} 
        >
            <div className="flex items-center p-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer" onClick={handleAction}>
                {/* Drag Handle - Solo funciona aquí */}
                <div 
                    className="mr-3 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-600 p-1 touch-none flex items-center justify-center"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <GripVertical size={20} />
                </div>

                {/* Click area to toggle expand */}
                <div 
                    className="flex-1 select-none min-w-0"
                >
                    <h4 className="font-bold text-sm text-slate-800 truncate">{title || '(Sin Título)'}</h4>
                    {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pl-2">
                    <button 
                         onClick={(e) => { e.stopPropagation(); onDelete(); }}
                         className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                         title="Eliminar"
                    >
                        <Trash2 size={16} />
                    </button>
                     <button 
                        onClick={handleAction}
                        className={`p-1 rounded text-slate-400 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Expanded Body */}
            {isExpanded && (
                <div 
                    className="p-4 border-t border-slate-100 bg-slate-50/50"
                >
                    {children}
                </div>
            )}
        </Reorder.Item>
    );
};

// Overlay de Diagnóstico de Corte de Impresión & Paginación Física
const PrintBreakOverlay = () => {
    const [markers, setMarkers] = useState(0);
    const overlayRef = React.useRef(null);

    useEffect(() => {
        const overlayNode = overlayRef.current;
        if (!overlayNode) return;
        
        // Observamos el padre (DynamicPdfPage container) que tiene la altura física real (siempre múltiplo de A4)
        const parentNode = overlayNode.parentElement;
        if (!parentNode) return;

        const updateMarkers = () => {
             const parentWidth = parentNode.offsetWidth;
             const parentHeight = parentNode.offsetHeight;
             
             if (!parentWidth || !parentHeight) return;

             const onePagePx = parentWidth * (297 / 210);

             if (onePagePx <= 0) return;

             // Calculamos cuántas páginas hay basándonos en la altura del contenedor
             const count = Math.round(parentHeight / onePagePx);
             
             // SIEMPRE mostramos marcadores para todas las páginas activas
             // Incluso si es 1 página, mostramos su final para que el usuario sepa dónde acaba.
             setMarkers(Math.max(1, count));
        };

        updateMarkers();

        const ro = new ResizeObserver(updateMarkers);
        ro.observe(parentNode);

        return () => ro.disconnect();
    }, []);

    return (
    <div ref={overlayRef} className="absolute inset-0 pointer-events-none z-[50]">
        {/* Render markers only if content exceeds pages */}
        {Array.from({ length: markers }).map((_, i) => {
            const pageNum = i + 1;
            // Alineamos la línea visualmente con una zona segura más estricta.
            // Si el contenido toca 280mm, ya es muy arriesgado por márgenes de impresión.
            // Subimos a 280mm para dar un aviso visual temprano y preciso.
            const topPos = `${pageNum * 297 - 17}mm`; 
            
            return (
                <div 
                    key={pageNum} 
                    style={{ top: topPos }} 
                    className="absolute w-full left-0 flex flex-col items-center -translate-y-1/2"
                >
                    {/* Zona de ruptura de página */}
                    <div className="w-full relative flex items-center justify-center group">
                        {/* Líneas guía discontinuas (siempre visibles) */}
                        <div className="absolute w-full border-t-2 border-dashed border-red-500 opacity-60"></div>
                        
                        {/* Etiqueta flotante de paginación */}
                        <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm z-10 flex items-center gap-2 border border-red-600">
                           <span>PÁGINA {pageNum}</span>
                           <span className="opacity-50">|</span>
                           <span>LÍMITE</span>
                           <ChevronDown size={10} />
                        </div>

                        {/* Línea fantasma a los lados */}
                        <div className="absolute w-full flex justify-between px-4">
                            <span className="text-[9px] text-red-500 font-bold font-mono opacity-80">280mm</span>
                            <span className="text-[9px] text-red-500 font-bold font-mono opacity-80">FIN DE HOJA</span>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
    );
};

// Componente que gestiona el tamaño de la hoja para que siempre sea múltiplo de A4 (preview dinámica)
const DynamicPdfPage = ({ data }) => {
    const [pageHeight, setPageHeight] = useState('297mm');
    const contentRef = React.useRef(null);
    const containerRef = React.useRef(null);

    useEffect(() => {
        // Debounce calculation to avoid flickering
        let timer;
        const delayedCalc = () => {
             clearTimeout(timer);
             timer = setTimeout(calculateHeight, 50);
        }

        const calculateHeight = () => {
            if (contentRef.current && containerRef.current) {
                const contentH = contentRef.current.scrollHeight; // Use scrollHeight to capture full content size
                const containerW = containerRef.current.offsetWidth;
                
                // 210mm is the visual width.
                // 1 page height / width ratio = 297/210
                if (containerW > 0) {
                    const onePagePx = containerW * (297/210);
                    // Calculate how many pages the content occupies
                    // Add tolerance to ensure just crossing the line triggers new page
                    const pages = Math.max(1, Math.ceil((contentH - 1) / onePagePx));
                    
                    // Force height to be exact multiple of 297mm (visual page)
                    setPageHeight(`${pages * 297}mm`);
                }
            }
        };
        
        // Initial Calculation
        calculateHeight();

        // Observers for resizing
        const observer = new ResizeObserver(delayedCalc);
        if (contentRef.current) observer.observe(contentRef.current);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => {
            if(timer) clearTimeout(timer);
            observer.disconnect();
        };
    }, [data]);

    return (
        <div 
            ref={containerRef}
            style={{ 
                width: '210mm', 
                height: pageHeight, 
                minHeight: '297mm',
                // Fondo que simula hojas A4 unidas verticalmente
                backgroundImage: 'linear-gradient(to bottom, #ffffff 295mm, #e2e8f0 295mm, #e2e8f0 297mm)',
                backgroundSize: '100% 297mm',
                backgroundRepeat: 'repeat-y',
                transition: 'height 0.3s ease-out'
            }} 
            className="origin-top transform scale-[0.38] xs:scale-[0.45] sm:scale-[0.55] shadow-2xl relative"
        >
            <PrintBreakOverlay />
            <div ref={contentRef} className="relative z-10 w-full">
                <CVContent data={data} />
            </div>
        </div>
    );
};

// Componente de Carga Inicial - Versión Compacta
const InitialLoader = () => {
    // Etiquetas abreviadas para móvil
    const steps = [
        { label: "Analizando...", icon: <FileText size={16} /> },
        { label: "Extrayendo info...", icon: <User size={16} /> },
        { label: "Exp. Laboral...", icon: <Briefcase size={16} /> },
        { label: "Proyectos...", icon: <FolderGit2 size={16} /> },
        { label: "Habilidades...", icon: <Cpu size={16} /> },
        { label: "Finalizando...", icon: <CheckCircle2 size={16} /> }
    ];
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (currentStep < steps.length) {
            const delay = 600 + Math.random() * 300; // Más rápido
            const timeout = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, delay);
            return () => clearTimeout(timeout);
        }
    }, [currentStep]);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white p-4 font-sans h-screen w-screen overflow-hidden">
             
             <div className="w-full max-w-xs bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl shadow-2xl">
                 <div className="flex flex-col items-center mb-5">
                     <div className="relative w-12 h-12 mb-3">
                        <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                        <div className="absolute inset-1 rounded-full border-r-2 border-purple-500 animate-spin-reverse"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="text-blue-400 animate-pulse" size={20} />
                        </div>
                     </div>
                     
                     <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse text-center">
                        Procesando
                     </h2>
                     <p className="text-slate-400 text-xs mt-1 text-center">
                         Algoritmo analizando datos...
                     </p>
                 </div>

                 <div className="space-y-2 relative pl-2">
                     <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-800 z-0"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="relative z-10 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 shrink-0 bg-slate-900
                                ${index < currentStep ? 'border-green-500 text-green-500' : 
                                  index === currentStep ? 'border-blue-500 text-blue-400' : 
                                  'border-slate-700 text-slate-700'}
                            `}>
                                {index < currentStep ? <Check size={14} /> : step.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className={`text-xs font-medium truncate block
                                    ${index <= currentStep ? 'text-slate-200' : 'text-slate-600'}
                                `}>
                                    {step.label}
                                </span>
                                {index === currentStep && (
                                    <div className="h-0.5 w-full bg-slate-800 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-blue-500 animate-progress-indeterminate"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                 </div>
             </div>
             
             <p className="mt-4 text-slate-600 text-[10px] text-center">No cierres la ventana.</p>
        </div>
    );
};




const Admin = () => {
    const { profile, experience, projects, skills, education, continuousEducation, header, footer, theme, saveData, loading, labels, sectionVisibility } = useData();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    
    // Core Data State
    const [rawFormData, setRawFormData] = useState(null);
    const formData = rawFormData; // Compatibility alias
    
    // History State
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    
    // Image Cropper State
    const [croppingImg, setCroppingImg] = useState(null);

    // Feedback Modal State
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    
    // Debounce Ref
    const historyTimer = React.useRef(null);

    // Helper to commit to history without updating UI state (since UI is already updated)
    const commitToHistory = (data) => {
        setHistory(currentHist => {
            const branchedHist = currentHist.slice(0, historyIndex + 1);
            const newHist = [...branchedHist, data];
            // Increased limit to 50 as requested
            if (newHist.length > 50) newHist.shift(); 
            return newHist;
        });
        
        // Update Index to point to the new latest
        setHistoryIndex(currIdx => {
             // If we were at index 5, and added 1, we are at 6.
             // If we were at 50 (max) and added 1 (shifted), we stay at 50 (max-1 actually, 49).
             // Simple logic: The new index is the last element of the new array.
             // But we can't see the new array length here easily.
             // Let's use the functional update of setHistory above combined with a useEffect? 
             // No, direct logic: 
             // If branching, length grows by 1.
             // If hitting limit, length stays at 50, index stays at 49.
             const currentLen = Math.min(currIdx + 2, 50); 
             return currentLen - 1;
        });
    };
    
    // Fix index sync cleanly
    useEffect(() => {
        setHistoryIndex(history.length - 1);
    }, [history]);

    // Enhanced setter with History Support + Debounce
    const updateFormData = (newStateCallbackOrValue, isImmediate = false) => {
        setRawFormData(prev => {
            const newState = typeof newStateCallbackOrValue === 'function' 
                ? newStateCallbackOrValue(prev) 
                : newStateCallbackOrValue;

            // Only update history if data actually changed
            if (JSON.stringify(prev) !== JSON.stringify(newState)) {
                
                if (isImmediate) {
                    if (historyTimer.current) clearTimeout(historyTimer.current);
                    commitToHistory(newState);
                } else {
                    // Continuous (Debounced)
                    if (historyTimer.current) clearTimeout(historyTimer.current);
                    historyTimer.current = setTimeout(() => {
                        commitToHistory(newState);
                    }, 500); // 500ms debounce
                }
            }
            return newState;
        });
    };

    const handleUndo = () => {
        if (historyTimer.current) clearTimeout(historyTimer.current); // Cancel pending commits
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setRawFormData(history[newIndex]);
        }
    };

    const handleRedo = () => {
        if (historyTimer.current) clearTimeout(historyTimer.current); // Cancel pending commits
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setRawFormData(history[newIndex]);
        }
    };
    
    // Alias for backward compatibility if needed, but we should use updateFormData
    const setFormData = (val) => updateFormData(val, false);

    const handleResetDefaults = () => {
        if(window.confirm("¿Cargar datos de plantilla inicial? Esto actualizará tu perfil con los nuevos proyectos y datos base (Juan Diego Archila).")) {
            // Merge defaults but keep IDs to prevent key errors
            const addIds = (list) => list.map(item => ({ ...item, _id: generateId() }));

            setFormData(prev => ({
                ...prev,
                profile: defaultProfile,
                experience: addIds(defaultExperience),
                projects: addIds(defaultProjects),
                skills: defaultSkills,
                education: addIds(defaultEducation),
                continuousEducation: addIds(defaultContinuousEducation),
                header: defaultHeader,
                footer: defaultFooter,
                labels: defaultLabels || prev.labels
            }));
            alert("Plantilla actualizada. Revisa los cambios y haz clic en 'Guardar' para aplicarlos permanentemente.");
        }
    };

    const [activeTab, setActiveTab] = useState('content'); // 'content' | 'design'
    const [openSection, setOpenSection] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [previewMode, setPreviewMode] = useState(true);
    const [previewType, setPreviewType] = useState('mobile'); // 'mobile' | 'pdf'
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showDeletePhotoModal, setShowDeletePhotoModal] = useState(false);

    // Helper para cambiar a vista web automáticamente
    const handleSwitchToWeb = () => {
        if (previewType !== 'mobile') {
            setPreviewType('mobile');
        }
    };

    useEffect(() => {
        // Only initialize when NOT loading and IF we have at least profile data (or loading finished)
        // Also check if rawFormData is null to avoid overwriting edits.
        if (!loading && !rawFormData) {
            try {
                // --- AUTO-RECOVERY LOGIC ---
                // Si detectamos que el nombre es el placeholder de error "Nombre no Detectado",
                // asumimos que los datos están corruptos y forzamos la carga de la plantilla por defecto.
                
                const safeClone = (obj, fallback = {}) => {
                    if (obj === undefined || obj === null) return fallback;
                    try {
                        return JSON.parse(JSON.stringify(obj));
                    } catch (e) {
                         console.error("Error cloning object", e);
                         return fallback;
                    }
                };

                let effectiveProfile = profile || defaultProfile;
                let effectiveExperience = experience || defaultExperience;
                let effectiveProjects = projects || defaultProjects;
                let effectiveSkills = skills || defaultSkills;
                let effectiveEducation = education || defaultEducation;
                let effectiveContinuousEducation = continuousEducation || defaultContinuousEducation;

                if (effectiveProfile?.name === "Nombre no Detectado" || effectiveProfile?.name === "N.Detectado") {
                    console.warn("ADMIN: Datos corruptos detectados. Restaurando plantilla.");
                    effectiveProfile = defaultProfile;
                    effectiveExperience = defaultExperience;
                    // ... reset others if needed
                }

                const initialProfile = safeClone(effectiveProfile, defaultProfile);
                if (!initialProfile.whatsapp) initialProfile.whatsapp = "https://wa.me/573142749518";
                if (!initialProfile.status) initialProfile.status = "Disponible";

                const initialData = {
                    header: safeClone(header, { title: 'JD.Archila' }),
                    footer: safeClone(footer, defaultFooter),
                    theme: safeClone(theme, { template: 'new-york', font: 'Arimo', color: '#0f172a' }),
                    profile: initialProfile,
                    experience: ensureIds(safeClone(effectiveExperience, defaultExperience)),
                    projects: ensureIds(safeClone(effectiveProjects, defaultProjects)),
                    skills: safeClone(effectiveSkills, defaultSkills), 
                    education: ensureIds(safeClone(effectiveEducation, defaultEducation)),
                    continuousEducation: ensureIds(safeClone(effectiveContinuousEducation || [], [])),
                    labels: safeClone(labels, defaultLabels),
                    sectionVisibility: safeClone(sectionVisibility, { 
                        profile: true, experience: true, projects: true, skills: true, education: true, contact: true 
                    })
                };

                setRawFormData(initialData);
                setHistory([initialData]);
                setHistoryIndex(0);
            } catch (error) {
                console.error("CRITICAL ERROR INITIALIZING DATA:", error);
                // Last resort fallback
                 setRawFormData({
                    profile: defaultProfile,
                    experience: ensureIds(defaultExperience),
                    projects: ensureIds(defaultProjects),
                    skills: defaultSkills,
                    education: ensureIds(defaultEducation),
                    continuousEducation: [],
                    header: defaultHeader || { title: 'Val' },
                    footer: defaultFooter,
                    theme: { template: 'new-york' },
                    labels: defaultLabels, 
                    sectionVisibility: { profile: true }
                });
            }
        }
    }, [loading, profile, experience, projects, skills, education, continuousEducation, header, footer, theme, labels, sectionVisibility]);


    // Force "Content" tab when switching to Web/Mobile mode
    // This prevents being stuck in "Template" tab when it's hidden
    useEffect(() => {
        if (previewType === 'mobile') {
            setActiveTab('content');
        }
    }, [previewType]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };
    
    const handleArrayChange = (arrayName, index, field, value) => {
        setFormData(prev => {
            const newArray = [...prev[arrayName]];
            newArray[index] = { ...newArray[index], [field]: value };
            return { ...prev, [arrayName]: newArray };
        });
    };

    const handleArrayListChange = (arrayName, index, field, rawValue) => {
        const arrayValue = rawValue.split('\n');
        handleArrayChange(arrayName, index, field, arrayValue);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const { section, index } = deleteTarget;
        
        // 1. Calcular el nuevo estado SÍNCRONAMENTE basado en el estado actual
        // (Evitamos usar el callback de setState para el cálculo del guardado porque es asíncrono)
        const currentData = rawFormData;
        const newArray = currentData[section].filter((_, i) => i !== index);
        const newData = { ...currentData, [section]: newArray };
        
        // Actualizar UI
        setFormData(newData);
        setDeleteTarget(null);

        // 2. Guardar inmediatamente en Firebase
        setSaveStatus('Guardando...');
        try {
            const cleanData = {
                ...newData,
                experience: stripIds(newData.experience),
                projects: stripIds(newData.projects),
                education: stripIds(newData.education),
                continuousEducation: stripIds(newData.continuousEducation || [])
            };

            await saveData(cleanData);
            setSaveStatus('¡Eliminado!');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            console.error("Error saving delete:", error);
            setSaveStatus('Error al eliminar');
        }
    };

    const handleArrayItemDelete = (arrayName, index) => {
        setDeleteTarget({ section: arrayName, index });
    };

    const handleArrayItemAdd = (arrayName, emptyItem) => {
        const newItem = { ...emptyItem, _id: generateId() };
        setFormData(prev => ({
            ...prev,
            [arrayName]: [newItem, ...prev[arrayName]] 
        }));
    };

    const handleReorder = (section, newOrder) => {
        setFormData(prev => ({
            ...prev,
            [section]: newOrder
        }));
    };

    useEffect(() => {
        // En móviles iniciar en modo edición (preview oculto)
        if (window.innerWidth < 1024) {
            setPreviewMode(false);
        }
    }, []);

    // Actualizar título de la pestaña dinámicamente mientras se edita
    useEffect(() => {
        const titleName = formData?.profile?.name || formData?.header?.title;
        if (titleName) {
            document.title = `Admin | ${titleName}`;
        }
    }, [formData?.header?.title, formData?.profile?.name]);

    const handleSave = async () => {
        setSaveStatus('Guardando...');
        try {
            const cleanData = {
                ...formData,
                experience: stripIds(formData.experience),
                projects: stripIds(formData.projects),
                education: stripIds(formData.education),
                continuousEducation: stripIds(formData.continuousEducation)
            };

            // Logic for Username Reservation
            if (cleanData.profile.username) {
                const newUsername = cleanData.profile.username.toLowerCase();
                 // Si el usuario tenía otro username antes, deberíamos idealmente liberarlo, 
                 // pero por simplicidad solo aseguramos el nuevo. (Mejora futura: Transaction)
                
                 // Verificar si ya existe este el documento username
                 const usernameRef = doc(db, 'usernames', newUsername);
                 const usernameSnap = await getDoc(usernameRef);
                 
                 if (usernameSnap.exists() && usernameSnap.data().uid !== user.uid) {
                     throw new Error(`El usuario "${newUsername}" ya está en uso por otra persona.`);
                 }

                 // Reservar el username
                 await setDoc(usernameRef, { uid: user.uid });
            }

            await saveData(cleanData);
            setSaveStatus('¡Guardado!');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            setSaveStatus('Error: ' + error.message);
            // Mostrar error más visible si es de username
            if (error.message.includes('usuario')) alert(error.message);
        }
    };

    // Subida de Imagen de Perfil (Inicia proceso de recorte)
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tamaño/tipo si es necesario
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
             alert("La imagen es muy pesada. Máximo 5MB.");
             return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
             setCroppingImg(reader.result);
        });
        reader.readAsDataURL(file);
        
        // Reset input to allow re-selecting same file
        e.target.value = null; 
    };

    const handleCropSave = async (croppedBase64) => {
        setCroppingImg(null); // Close modal
        
        // 1. PREVIEW INMEDIATA (Local)
        // Mostramos la imagen inmediatamente 
        handleChange('profile', 'photoURL', croppedBase64);
        // Guardar también en base64 para que el PDF siempre pueda renderizar sin CORS
        handleChange('profile', 'photoBase64', croppedBase64);

        // 2. Upload to Firebase
        try {
            if (!storage || !storage.app) {
                setSaveStatus('Solo Local (No Firebase)');
                alert("Advertencia: Firebase Storage no está conectado. La imagen solo será visible durante esta sesión.");
                return;
            }

            // Convert Base64 to Blob
            const res = await fetch(croppedBase64);
            const blob = await res.blob();

            const storageRef = ref(storage, `profile_images/${Date.now()}_cropped.jpg`);
            const uploadTask = uploadBytesResumable(storageRef, blob);

            setSaveStatus('Subiendo 0%');

            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    setSaveStatus(`Subiendo ${progress}%`);
                }, 
                (error) => {
                    console.error("Error Upload:", error);
                    setSaveStatus('Error Subida');
                    alert(`Error subiendo la imagen: ${error.message} (Revisa la consola/reglas de Firebase)`);
                }, 
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        // 3. CONFIRMACIÓN REMOTA
                        // Actualizamos el perfil con la URL definitiva de la nube
                        handleChange('profile', 'photoURL', downloadURL);
                        setSaveStatus('¡Foto Guardada!');
                        setTimeout(() => setSaveStatus(''), 2000);
                    });
                }
            );
        } catch (err) {
            console.error(err);
            setSaveStatus('Error configuración');
            alert("Error al intentar conectar con Storage: " + err.message);
        }
    };

    const handleImageDelete = () => {
        setShowDeletePhotoModal(true);
    };

    const confirmImageDelete = () => {
        setFormData(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                photoURL: '',
                photoBase64: ''
            }
        }));
        setSaveStatus('Foto eliminada (Recuerda Guardar)');
        setTimeout(() => setSaveStatus(''), 3000);
        setShowDeletePhotoModal(false);
    };

    // Expone la función global para que Hero.jsx pueda llamarla
    window.handleDownloadCV = async () => {
        const element = document.getElementById('printable-cv-container');
        const wrapper = document.getElementById('print-wrapper');
        
        if (!element || !wrapper) {
            alert("Error: No se encontró el generador de PDF");
            return;
        }

        // Mostrar wrapper temporalmente
        wrapper.style.display = 'block';

        // --- ESPERAR CARGA DE IMÁGENES & CONVERTIR A BASE64 ---
        // Solución robusta para HTML2CANVAS + CORS
        const images = wrapper.querySelectorAll('img');
        if (images.length > 0) {
            await Promise.all(Array.from(images).map(async (img) => {
                // 1. Si ya está en base64, ignorar
                if (img.src.startsWith('data:')) return Promise.resolve();

                // 2. Intentar cargar y convertir
                try {
                    const response = await fetch(img.src, { mode: 'cors' });
                    const blob = await response.blob();
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            img.src = reader.result;
                            img.onload = resolve; // Esperar a que se pinte de nuevo con base64
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                } catch (err) {
                    console.warn("Fallo conversión base64, intentando carga normal con crossOrigin", err);
                    // Fallback: método tradicional
                    if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
                    return new Promise((resolve) => {
                        img.crossOrigin = "anonymous";
                        img.onload = resolve;
                        img.onerror = resolve;
                        setTimeout(resolve, 3000);
                    });
                }
            }));
            // Espera extra para renderizado del navegador
            await new Promise(r => setTimeout(r, 800));
        }
        // ----------------------------------------------------

        // --- AJUSTE DE ALTURA PARA PDF ---
        // Guardamos estado original
        const originalHeight = element.style.height;
        const originalOverflow = element.style.overflow;

        // 1. Calcular altura de página en píxeles
        const containerW = element.offsetWidth;
        const onePagePx = containerW * (297 / 210);
        
        // 2. Obtener altura de contenido
        const contentHeight = element.scrollHeight;

        // 3. Calcular páginas necesarias con la misma tolerancia que el Live Preview (-1px)
        const pages = Math.max(1, Math.ceil((contentHeight - 1) / onePagePx));

        // 4. Forzar altura estricta y cortar sobrante (espacios blancos fantasmas)
        element.style.height = `${pages * 297}mm`;
        element.style.overflow = 'hidden';
        // ------------------------------------------------

        const opt = {
            margin: 0,
            filename: `CV_${(formData.profile?.name || 'CV').replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
             // Importación dinámica
            const html2pdf = (await import('html2pdf.js')).default;
            await html2pdf().from(element).set(opt).save();
        } catch (e) {
            console.error(e);
            alert("Error al generar PDF: " + e.message);
        } finally {
            // Restaurar estado
            element.style.height = originalHeight;
            element.style.overflow = originalOverflow;
            wrapper.style.display = 'none';
        }
    };

    const scrollToPreview = (id, highlight = true) => {
        /**
         * 🎯 IMPORTANTE: Funcionalidad Core de UX
         * 
         * Esta función implementa una guía de edición en tiempo real:
         * Cuando el usuario selecciona CUALQUIER campo editable (nombre, rol, experiencia, etc.),
         * el preview automáticamente se desplaza a ese campo y lo destaca con un contorno azul sutil.
         * 
         * Esto crea una experiencia de edición intuitiva donde el usuario siempre sabe dónde
         * aparecerá el cambio que está haciendo.
         * 
         * 📋 CÓMO MANTENER ESTA FUNCIONALIDAD:
         * 1. AGREGAR IDs: Cada elemento visible en el preview debe tener un ID único
         *    Patrón: id={`preview-{sección}-{campo}-${id || índice}`}
         *    Ejemplos: preview-hero-name, preview-exp-role-${id}, preview-proj-title-${id}
         * 
         * 2. AGREGAR onFocus: Cada input/textarea/select en Admin.jsx debe tener:
         *    onFocus={() => scrollToPreview('preview-element-id')}
         *    
         *    ⚠️ IMPORTANTE: Usar onFocus, no onChange
         *    - onChange: se dispara en cada tecla (distrayente)
         *    - onFocus: se dispara una sola vez al seleccionar el campo (perfecto)
         * 
         * 3. PATRONES DE ID POR SECCIÓN:
         *    - Perfil: preview-hero-{field}, preview-header-{field}
         *    - Experiencia: preview-exp-{field}-${id}
         *    - Proyectos: preview-project-{field}-${id}
         *    - Educación: preview-education-{field}-${id}
         *    - Formación Continua: preview-continuous-{field}-${id}
         *    - Skills: preview-skills-category-{category}
         *    - Contacto: preview-footer-{field}
         * 
         * 4. NO DEJAR CAMPOS SIN ESTO: Aplicar onFocus a TODOS los campos editables
         *    sin excepción. Si un campo no tiene onFocus, el usuario no verá dónde
         *    aparecerá su edición en el preview.
         * 
         * 5. VISUAL HIGHLIGHT (no cambiar):
         *    - Fondo: rgba(59, 130, 246, 0.1) - azul al 10%, apenas visible
         *    - Borde: 2px solid #3b82f6 - azul crispante
         *    - Offset: 2px - espacio entre elemento y borde
         *    - Transition: 0.3s ease - suave
         * 
         * Esta es una FUNCIONALIDAD CRÍTICA del editor. Mantenerla intacta es prioritario.
         */

        if (!previewMode) return;
        
        // Intentar dentro del iframe (Preview Web/Móvil)
        const iframe = document.querySelector('iframe[title="preview-frame"]');
        if (iframe && iframe.contentDocument) {
            const element = iframe.contentDocument.getElementById(id);
            if (element) {
                const prevHighlight = iframe.contentDocument.querySelector('[data-editing="true"]');
                if (prevHighlight) {
                    prevHighlight.removeAttribute('data-editing');
                    prevHighlight.style.backgroundColor = '';
                    prevHighlight.style.outline = '';
                    prevHighlight.style.outlineOffset = '';
                }

                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 50);

                if (highlight) {
                    element.setAttribute('data-editing', 'true');
                    element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    element.style.outline = '2px solid #3b82f6';
                    element.style.outlineOffset = '2px';
                    element.style.transition = 'all 0.3s ease';
                }
            }
            return;
        }

        // Fallback para modo PDF (CVContent renderizado directamente en el documento)
        const pdfElement = document.getElementById(id);
        if (pdfElement) {
            const container = document.getElementById('pdf-preview-scroll-container');
            const prevHighlight = (container ? container.querySelector('[data-editing="true"]') : document.querySelector('[data-editing="true"]'));
            if (prevHighlight) {
                prevHighlight.removeAttribute('data-editing');
                prevHighlight.style.backgroundColor = '';
                prevHighlight.style.outline = '';
                prevHighlight.style.outlineOffset = '';
            }

            setTimeout(() => {
                // scrollIntoView suele usar el ancestro desplazable más cercano
                pdfElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);

            if (highlight) {
                pdfElement.setAttribute('data-editing', 'true');
                pdfElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                pdfElement.style.outline = '2px solid #3b82f6';
                pdfElement.style.outlineOffset = '2px';
                pdfElement.style.transition = 'all 0.3s ease';
            }
        }
    };

    const location = useLocation();
    const [minLoadingTimePassed, setMinLoadingTimePassed] = useState(false);
    
    // Controlar animación inicial SOLO si venimos de 'Upload CV'
    useEffect(() => {
        if (location.state?.analyzing) {
            // Si venimos de upload, forzar animación de 5-6 segundos
            const timer = setTimeout(() => {
                setMinLoadingTimePassed(true);
                // Limpiar el estado de navegación para que al recargar NO salga
                navigate(location.pathname, { replace: true, state: {} });
            }, 6000);
            return () => clearTimeout(timer);
        } else {
            // Si no venimos de upload (ej: navegación normal o refresh), no mostrar animación
            setMinLoadingTimePassed(true);
        }
    }, [location.state, navigate, location.pathname]);

    // Lógica para mostrar loader
    // 1. Si está cargando datos reales (loading) -> Mostrar Loader Simple
    // 2. Si venimos de Upload (location.state.analyzing) y no ha pasado el tiempo -> Mostrar InitialLoader
    
    const showAnalyzingAnimation = location.state?.analyzing && !minLoadingTimePassed;

    if (showAnalyzingAnimation) {
        return <InitialLoader />;
    }

    if (loading) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader />
                <p className="mt-4 text-xs text-slate-400 font-mono">Cargando datos...</p>
             </div>
        );
    }

    if (!formData) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen text-slate-600 bg-white z-[9999] relative">
                <Loader />
                <p className="mt-4 font-bold">Inicializando editor...</p>
                <p className="text-xs mt-2 font-mono text-slate-400 max-w-md text-center px-4">
                    Si ves esto por mucho tiempo, hubo un problema cargando tus datos.
                </p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-slate-800 transition-colors"
                >
                    Recargar Página
                </button>
             </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans pb-20">
            {/* Sticky Header Moderno */}
            <header className="fixed top-0 left-0 w-full z-50 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all duration-300 p-2 md:p-4 text-white">
                <div className="container mx-auto flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Toggle Button */}
                        <button 
                            onClick={() => setPreviewMode(!previewMode)} 
                            className="flex items-center gap-1.5 text-xs md:text-sm font-bold bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 active:bg-slate-700 whitespace-nowrap hover:bg-slate-700 transition-colors shadow-sm"
                        >
                            {previewMode ? <Layout size={16} /> : <Eye size={16} />}
                            <span>{previewMode ? 'Ocultar Panel' : 'Vista Previa'}</span>
                        </button>
                    </div>

                    {/* ALWAYS VISIBLE: Undo/Redo Group */}
                    <div className="flex items-center bg-slate-800 rounded-lg p-0.5 md:p-1 border border-slate-700 mr-auto ml-2">
                        <button 
                            onClick={handleUndo} 
                            disabled={historyIndex <= 0}
                            className={`p-1 md:p-1.5 rounded transition-colors ${historyIndex > 0 ? 'hover:bg-slate-700 text-white' : 'text-slate-600 cursor-not-allowed'}`}
                            title="Deshacer"
                        >
                            <Undo2 className="w-3.5 h-3.5 min-[350px]:w-4 min-[350px]:h-4 md:w-[18px] md:h-[18px]" />
                        </button>
                        <div className="w-px h-3 md:h-4 bg-slate-700 mx-0.5 md:mx-1"></div>
                        <button 
                            onClick={handleRedo} 
                            disabled={historyIndex >= history.length - 1}
                            className={`p-1 md:p-1.5 rounded transition-colors ${historyIndex < history.length - 1 ? 'hover:bg-slate-700 text-white' : 'text-slate-600 cursor-not-allowed'}`}
                            title="Rehacer"
                        >
                            <Redo2 className="w-3.5 h-3.5 min-[350px]:w-4 min-[350px]:h-4 md:w-[18px] md:h-[18px]" />
                        </button>
                    </div>
                    
                    {/* Responsive Actions & Menu */}
                    <div className="flex gap-2 items-center shrink-0">

                         {/* Status */}
                         <span className={`text-[10px] md:text-sm font-bold duration-300 ${saveStatus.includes('Error') ? 'text-red-400' : 'text-emerald-400'} mr-2 hidden sm:block`}>
                            {saveStatus === '¡Guardado!' ? 
                                <span className="flex items-center gap-1"><Check size={16}/><span className="hidden lg:inline"> Guardado</span></span> 
                                : <span>{saveStatus}</span>}
                        </span>
                        
                        {/* Restaurar Plantilla (OCULTO POR SOLICITUD)
                        <button 
                            onClick={handleResetDefaults} 
                            className="hidden min-[450px]:flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 sm:px-3 sm:py-2 rounded-lg transition-colors font-bold text-xs md:text-sm border border-slate-300" 
                            title="Restaurar Plantilla Original"
                        >
                           <RotateCcw size={16} /> <span className="hidden xl:inline">Restaurar</span>
                        </button>
                        */}

                        {/* Feedback Button */}
                        <button 
                            onClick={() => setIsFeedbackOpen(true)}
                            className="hidden lg:flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 p-2 sm:px-3 sm:py-2 rounded-lg transition-colors font-bold text-xs md:text-sm border border-yellow-500/30"
                            title="Enviar Comentarios o Reportar Error"
                        >
                            <MessageCircle size={16} />
                            <span className="hidden xl:inline">Feedback</span>
                        </button>

                        {/* Messages Button (Inbox) - ADMIN ONLY */}
                        {user?.email === 'juandiegoarchilaeon@gmail.com' && (
                            <button 
                                onClick={() => navigate('/admin/messages')}
                                className="hidden lg:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 sm:px-3 sm:py-2 rounded-lg transition-colors font-bold text-xs md:text-sm border border-slate-700"
                                title="Ver Mensajes Recibidos"
                            >
                                <Mail size={16} />
                            </button>
                        )}

                        {/* Web - Visible solo en >420px (Móviles anchos) para aprovechar el espacio extra */}
                        {/* Botón Volver al Panel - Dashboard */}
                        <button onClick={() => navigate('/onboarding')} className="hidden min-[450px]:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white p-2 sm:px-3 sm:py-2 rounded-lg transition-colors font-bold text-xs md:text-sm border border-slate-700" title="Volver al Panel">
                            <Layout size={16} /> <span className="hidden xl:inline">Panel</span>
                        </button>

                        <button onClick={async () => {
                            const currentUsername = profile?.username;
                            const identifier = currentUsername || user?.uid;
                            const url = `${window.location.origin}/p/${identifier}`;
                            window.open(url, '_blank');
                        }} className="hidden min-[420px]:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white p-2 sm:px-3 sm:py-2 rounded-lg transition-colors font-bold text-xs md:text-sm shadow-lg shadow-purple-900/50" title="Ver mi Web Pública">
                           <Eye size={16} /> <span className="hidden xl:inline">Ver Sitio Web</span>
                        </button>

                        {/* Guardar - SIEMPRE VISIBLE */}
                        <button onClick={handleSave} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/50 hover:shadow-blue-600/30 transition-all active:scale-95 whitespace-nowrap">
                            <Save size={16} /> <span>Guardar</span>
                        </button>

                        {/* Compartir - Se oculta en SM/MD (<768px) */}
                        <button onClick={async () => {
                             const currentUsername = profile?.username;
                             const identifier = currentUsername || user?.uid;
                             const url = `${window.location.origin}/p/${identifier}`;
                            navigator.clipboard.writeText(url);
                            setSaveStatus('¡Link Copiado!');
                            setTimeout(() => setSaveStatus(''), 2000);
                        }} className="hidden md:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors border border-slate-700" title="Copiar Link Público">
                            <Share2 size={16} />
                        </button>
                        
                        {/* Cerrar Sesion - Se oculta en LG (<1024px) */}
                        <button onClick={handleLogout} className="hidden lg:flex items-center gap-2 bg-slate-800 hover:bg-red-900/80 text-white p-2 rounded-lg transition-colors border border-slate-700" title="Cerrar Sesión">
                            <LogOut size={16} />
                        </button>

                         {/* Menu button - Visible si algo está oculto (< LG) */}
                         <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
                         >
                             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                         </button>
                    </div>
                </div>

                    {/* Dropdown Inteligente */}
                    {isMobileMenuOpen && (
                    <div className="absolute top-full right-0 w-64 bg-slate-900 border-t md:border-t-0 md:border md:rounded-bl-xl border-slate-800 shadow-xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                        
                        {/* 1. Panel - Movil */}
                        <button 
                            onClick={() => navigate('/onboarding')} 
                            className="min-[450px]:hidden w-full flex items-center justify-start gap-3 text-slate-200 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors font-medium text-sm"
                        >
                           <Layout size={18} className="text-slate-400" /> Ir al Panel
                        </button>

                        {/* Feedback - Movil */}
                        <button 
                            onClick={() => { setIsFeedbackOpen(true); setIsMobileMenuOpen(false); }}
                            className="lg:hidden w-full flex items-center justify-start gap-3 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 p-2 rounded-lg transition-colors font-medium text-sm border border-yellow-500/20"
                        >
                           <MessageCircle size={18} /> Enviar Feedback
                        </button>

                        {/* 1. Web - Movil Extremo solamente */}
                         <button 
                            onClick={async () => {
                                const currentUsername = profile?.username;
                                const identifier = currentUsername || user?.uid;
                                const url = `${window.location.origin}/p/${identifier}`;
                                window.open(url, '_blank');
                            }} 
                            className="sm:hidden w-full flex items-center justify-start gap-3 text-slate-200 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors font-medium text-sm"
                        >
                           <Eye size={18} className="text-purple-400" /> Ver mi Web Pública
                        </button>

                        {/* 2. Guardar - SIEMPRE VISIBLE ARRIBA (Solo texto oculto) */}
                        {/* Solo aparece en menu si estamos en movil y queremos texto explicito, pero mejor dejarlo arriba */}

                        {/* 3. Compartir - Aparece si hidden arriba (MD) */}
                        <button 
                            onClick={async () => {
                                 const currentUsername = profile?.username;
                                 const identifier = currentUsername || user?.uid;
                                 const url = `${window.location.origin}/p/${identifier}`;
                                
                                if (navigator.share) {
                                    try {
                                        await navigator.share({
                                            title: `CV de ${profile?.name}`,
                                            text: `Mira el portafolio profesional de ${profile?.name}`,
                                            url: url
                                        });
                                        setSaveStatus('¡Compartido!');
                                    } catch (err) { }
                                } else {
                                    navigator.clipboard.writeText(url);
                                    alert('¡Link copiado!');
                                }
                                setIsMobileMenuOpen(false);
                            }} 
                            className="md:hidden w-full flex items-center justify-start gap-3 text-slate-200 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors font-medium text-sm"
                        >
                            <Share2 size={18} className="text-blue-400" /> Compartir Web
                        </button>

                        <div className="h-px bg-slate-800 my-1 lg:hidden"></div>

                        {/* 4. Logout - Aparece si hidden arriba (MD/LG) */}
                        <button 
                            onClick={handleLogout} 
                            className="lg:hidden w-full flex items-center justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-slate-800 p-2 rounded-lg transition-colors font-bold text-sm"
                        >
                            <LogOut size={18} /> Cerrar Sesión
                        </button>
                    </div>
                )}
            </header>

            <div className="container mx-auto p-4 md:p-6 pt-20 md:pt-24 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* LEFT: Editor Form */}
                <div className={`contentPanel space-y-6 overflow-y-auto max-h-[calc(100vh-9rem)] pr-2 ${previewMode ? 'hidden lg:block' : 'block'}`}>

                    {/* Editor Tabs - Top Navigation */}
                    <div className="flex p-1 bg-slate-100 rounded-xl mb-6 shadow-inner relative">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                activeTab === 'content'
                                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Layout size={16} />
                            <span>Content</span>
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('design');
                                if (previewType !== 'pdf') setPreviewType('pdf');
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                activeTab === 'design'
                                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Palette size={16} />
                            <span>Template</span>
                        </button>
                    </div>

                    {activeTab === 'design' ? (
                        <>
                            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-4 mb-6 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                                    <FileText size={120} />
                                </div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-indigo-600 text-white p-1 rounded-md shadow-sm">
                                            <FileText size={14} />
                                        </div>
                                        <h4 className="font-bold text-indigo-950 text-xs uppercase tracking-wide">
                                            Modo PDF Exclusivo
                                        </h4>
                                    </div>
                                    
                                    <p className="text-xs text-indigo-900/70 mb-3 leading-relaxed max-w-[95%]">
                                        Personaliza la apariencia de tu documento de descarga. Tu sitio web mantendrá su diseño "App" optimizado.
                                    </p>

                                    <details className="group/details">
                                        <summary className="list-none flex items-center gap-2 cursor-pointer select-none">
                                            <div className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg border border-indigo-200/50">
                                                <Info size={14} />
                                                <span className="text-[10px] sm:text-xs font-bold">
                                                    ¿Por qué mi Web no cambia?
                                                </span>
                                                <ChevronDown size={12} className="transform transition-transform duration-300 group-open/details:rotate-180 opacity-50" />
                                            </div>
                                        </summary>
                                        
                                        <div className="mt-3 text-xs bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-indigo-100/50 text-slate-600 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                            <p className="mb-3 leading-relaxed">
                                                <strong className="text-indigo-900 bloack">El desafío Técnico:</strong> Web y PDF son medios diferentes. Una web debe ser responsiva (estirarse) para funcionar en miles de dispositivos distintos.
                                            </p>
                                            <div className="flex gap-3 items-center bg-indigo-50/80 p-3 rounded-lg border border-indigo-100 text-indigo-900">
                                                <div className="w-1 h-8 bg-indigo-500 rounded-full shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                                <p className="italic font-medium text-[11px] sm:text-xs leading-tight">
                                                    "Es preferible tener <span className="underline decoration-indigo-300 decoration-2">UNA web increíble y moderna</span>, que 10 plantillas mediocres intentando adaptarse."
                                                </p>
                                            </div>
                                        </div>
                                    </details>
                                </div>
                            </div>

                            {/* PLANTILLAS SECTION */}
                            {/* PLANTILLAS SECTION */}
                            <Section 
                                title="Plantillas (optimizadas para los ATS)" 
                                isOpen={openSection === 'templates' || openSection === 'config'} 
                                toggle={() => setOpenSection(openSection === 'templates' ? '' : 'templates')} 
                                color="indigo"
                            >
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {[
                                        { id: 'new-york', name: 'New York', color: '#334155', type: 'single' },
                                        { id: 'paris', name: 'Paris', color: '#475569', type: 'center' },
                                        { id: 'toronto', name: 'Toronto', color: '#64748b', type: 'side' },
                                        { id: 'madrid', name: 'Madrid', color: '#0f172a', type: 'grid' },
                                        { id: 'chicago', name: 'Chicago', color: '#1e293b', type: 'single' },
                                        { id: 'santiago', name: 'Santiago', color: '#334155', type: 'center' },
                                        { id: 'istanbul', name: 'Istanbul', color: '#475569', type: 'side' },
                                        { id: 'london', name: 'London', color: '#0f172a', type: 'center' },
                                        { id: 'karachi', name: 'Karachi', color: '#1e293b', type: 'grid' },
                                        { id: 'mumbai', name: 'Mumbai', color: '#334155', type: 'center' },
                                        { id: 'delhi', name: 'Delhi', color: '#475569', type: 'grid' },
                                        { id: 'editorial', name: 'Editorial', color: '#6366f1', type: 'sidebar' }
                                    ].map(template => (
                                        <button 
                                            key={template.id}
                                            onClick={() => handleChange('theme', 'template', template.id)}
                                            className={`relative p-3 rounded-lg border-2 text-left transition-all group overflow-hidden hover:shadow-md ${
                                                (formData?.theme?.template || 'new-york') === template.id
                                                ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600/20'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                            }`}
                                        >
                                            <div className="text-xs font-bold text-slate-800 mb-2">{template.name}</div>
                                            
                                            {/* Real Mini Preview */}
                                            <div className="w-full h-40 bg-white border border-slate-100 rounded shadow-sm opacity-100 relative overflow-hidden pointer-events-none p-0">
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 origin-top transform scale-[0.16] w-[210mm] bg-white text-left">
                                                   <CVContent 
                                                       data={{ 
                                                           ...formData, 
                                                           theme: { 
                                                               ...formData?.theme, 
                                                               template: template.id 
                                                           },
                                                           // Optimización: Solo mostramos 1 o 2 items para que no pese tanto la vista
                                                           experience: formData?.experience?.slice(0, 2) || [],
                                                           education: formData?.education?.slice(0, 1) || [],
                                                           skills: { ...formData?.skills, main: (formData?.skills?.main || []).slice(0, 5) },
                                                           projects: []
                                                       }} 
                                                   />
                                                </div>
                                            </div>
                                            
                                            {(formData?.theme?.template || 'new-york') === template.id && (
                                                <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm">
                                                    <Check size={10} strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </Section>

                            {/* DISEÑO SECTION */}
                            <Section 
                                title="Diseño" 
                                isOpen={openSection === 'design' || openSection === 'config'} 
                                toggle={() => setOpenSection(openSection === 'design' ? '' : 'design')} 
                                color="pink"
                            >
                                <div className="space-y-6">
                                    {/* Selector de Fuente Mejorado */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase block">Tipografía</label>
                                            <div className="group relative">
                                                <Info size={14} className="text-slate-400 cursor-help hover:text-blue-500 transition-colors" />
                                                <div className="absolute -left-16 sm:left-0 bottom-full mb-3 w-64 sm:w-72 p-4 bg-slate-800 text-white text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed border border-slate-700">
                                                    <h4 className="font-bold text-blue-300 mb-1">¿Qué es ATS?</h4>
                                                    <p className="mb-2">ATS (Applicant Tracking System) es el software que usan las empresas para filtrar currículums automáticamente.</p>
                                                    <h4 className="font-bold text-pink-300 mb-1">¿Por qué importa la fuente?</h4>
                                                    <p>Algunas fuentes creativas transforman el texto en formas que el robot no puede leer. Las opciones de esta lista son 100% compatibles, asegurando que tu información sea extraída correctamente.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative group">
                                            <select
                                                value={formData?.theme?.font || 'Arimo'}
                                                onChange={(e) => handleChange('theme', 'font', e.target.value)}
                                                className="w-full pl-10 pr-10 py-3.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all appearance-none cursor-pointer hover:border-slate-300 shadow-sm"
                                                style={{ fontFamily: formData?.theme?.font || 'Arimo' }}
                                            >
                                                <optgroup label="Sans-Serif (Modernas y Limpias)">
                                                    <option value="Arimo" style={{fontFamily: 'Arimo'}}>Arimo (Estándar Profesional)</option>
                                                    <option value="Inter" style={{fontFamily: 'Inter'}}>Inter (Moderna para Pantallas)</option>
                                                    <option value="Roboto" style={{fontFamily: 'Roboto'}}>Roboto (Geométrica y Clara)</option>
                                                    <option value="Open Sans" style={{fontFamily: 'Open Sans'}}>Open Sans (Neutra y Amigable)</option>
                                                    <option value="Lato" style={{fontFamily: 'Lato'}}>Lato (Corporativa y Equilibrada)</option>
                                                    <option value="Montserrat" style={{fontFamily: 'Montserrat'}}>Montserrat (Estilizada y Audaz)</option>
                                                    <option value="PT Sans" style={{fontFamily: 'PT Sans'}}>PT Sans (Humanista)</option>
                                                    <option value="Source Sans 3" style={{fontFamily: 'Source Sans 3'}}>Source Sans (Legible en UI)</option>
                                                </optgroup>
                                                <optgroup label="Serif (Clásicas y Elegantes)">
                                                    <option value="Lora" style={{fontFamily: 'Lora'}}>Lora (Elegancia Contemporánea)</option>
                                                    <option value="Merriweather" style={{fontFamily: 'Merriweather'}}>Merriweather (Alta Lecturabilidad)</option>
                                                    <option value="EB Garamond" style={{fontFamily: 'EB Garamond'}}>EB Garamond (Clásica Atemporal)</option>
                                                    <option value="Playfair Display" style={{fontFamily: 'Playfair Display'}}>Playfair (Estilo Editorial)</option>
                                                    <option value="Bitter" style={{fontFamily: 'Bitter'}}>Bitter (Slab Serif Robusta)</option>
                                                </optgroup>
                                            </select>
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <span className="font-serif italic text-lg opacity-50">Aa</span>
                                            </div>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-pink-500 transition-colors">
                                                <ChevronDown size={16} />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5">
                                            <Check size={10} className="text-green-500" />
                                            Compatibilidad ATS 100%. ¿Se ven iguales? Verifica tu conexión a internet para descargar las fuentes.
                                        </p>
                                    </div>

                                    {/* Selector de Color Mejorado */}
                                    <div className="pt-5 border-t border-slate-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <label className="text-xs font-bold text-slate-500 uppercase block">Color de Acento</label>
                                            <div className="group relative">
                                                <Info size={14} className="text-slate-400 cursor-help hover:text-blue-500 transition-colors" />
                                                <div className="absolute -left-32 sm:left-0 bottom-full mb-3 w-64 sm:w-72 p-4 bg-slate-800 text-white text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed border border-slate-700">
                                                    <h4 className="font-bold text-blue-300 mb-1">Psicología del Color en CVs</h4>
                                                    <p className="mb-2">El color guía la vista del reclutador hacia las secciones clave (Títulos, Fechas, Cargos).</p>
                                                    <ul className="list-disc pl-3 text-slate-300 space-y-1">
                                                        <li><strong>Azules:</strong> Confianza, profesionalismo, tecnología.</li>
                                                        <li><strong>Verdes:</strong> Crecimiento, frescura, finanzas.</li>
                                                        <li><strong>Neutros (Gris/Negro):</strong> Lujo, formalidad, minimalismo.</li>
                                                        <li><strong>Cálidos (Rojo/Naranja):</strong> Energía, creatividad (usar con moderación).</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-3">
                                            {/* Paletas Predefinidas */}
                                            {[
                                                '#0f172a', '#334155', '#475569', '#000000', // Neutros
                                                '#dc2626', '#ea580c', '#d97706', '#ca8a04', // Cálidos
                                                '#16a34a', '#059669', '#0d9488', '#0891b2', // Frescos
                                                '#0284c7', '#2563eb', '#4f46e5', '#7c3aed', // Azules/Morados
                                                '#9333ea', '#c026d3', '#db2777', '#be185d'  // Rosas
                                            ].map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => handleChange('theme', 'color', color)}
                                                    className={`w-8 h-8 rounded-full shadow-sm transition-all hover:scale-110 flex items-center justify-center ${
                                                        (formData?.theme?.color || '#0f172a') === color 
                                                        ? 'ring-2 ring-slate-900 ring-offset-2 scale-110 z-10' 
                                                        : 'hover:ring-2 hover:ring-slate-200 hover:ring-offset-1'
                                                    }`}
                                                    style={{ backgroundColor: color }}
                                                    title={color}
                                                >
                                                    {(formData?.theme?.color || '#0f172a') === color && (
                                                        <Check size={12} className="text-white drop-shadow-md stroke-[3]" />
                                                    )}
                                                </button>
                                            ))}
                                            
                                            {/* Selector Circular Personalizado (Color Wheel) */}
                                            <div className="border-l border-slate-200 pl-3 ml-1 flex items-center">
                                                <div className="relative group">
                                                     <label 
                                                        className="w-10 h-10 rounded-full cursor-pointer shadow-md transition-all hover:scale-105 flex items-center justify-center p-[2px]"
                                                        style={{ 
                                                            background: 'conic-gradient(from 0deg, red, orange, yellow, green, blue, indigo, violet, red)' 
                                                        }}
                                                        title="Elegir color personalizado"
                                                     >
                                                        <div className="w-full h-full bg-slate-50 rounded-full flex items-center justify-center overflow-hidden relative">
                                                            
                                                            {/* Muestra el color actual si no está en la lista predefinida, o un icono de paleta */}
                                                            <div 
                                                                className="absolute inset-1 rounded-full border border-slate-100"
                                                                style={{ backgroundColor: formData?.theme?.color }}
                                                            ></div>

                                                            <img src="https://www.svgrepo.com/show/521993/color-filter.svg" className="w-4 h-4 text-slate-600 z-10 opacity-50 mix-blend-multiply" alt="" />

                                                            <DebouncedColorPicker 
                                                                value={formData?.theme?.color || '#0f172a'}
                                                                onChange={(val) => handleChange('theme', 'color', val)}
                                                            />
                                                        </div>
                                                     </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-indigo-50 text-indigo-900 text-xs rounded-xl border border-indigo-100 flex gap-3 shadow-sm">
                                        <div className="p-2 bg-indigo-100 rounded-lg shrink-0 h-fit">
                                           <Layout size={16} className="text-indigo-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-indigo-700">Nota sobre el Diseño</p>
                                            <p className="opacity-90 leading-relaxed text-indigo-800/80">
                                                Estas opciones configuran cómo se ve tu CV en PDF y Web. El contenido (texto) es lo que leen los robots ATS; el diseño es para impresionar a las personas que lo lean después.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Section>
                        </>
                    ) : ( 
                    <>

                    {/* (Sección de edición de nombres removida por solicitud) */}

                    {/* PROFILE - Título Estático */}
                    <Section 
                        title="Perfil Personal y Datos" 
                        isOpen={openSection === 'profile'} 
                        toggle={() => setOpenSection(openSection === 'profile' ? '' : 'profile')} 
                        color="blue"
                        onFocus={() => scrollToPreview('preview-hero')}
                        isVisible={formData.sectionVisibility?.profile ?? true}
                        onToggleVisibility={() => handleChange('sectionVisibility', 'profile', !(formData.sectionVisibility?.profile ?? true))}
                    >
                         <div className="space-y-4">
                             {/* Editor del Título Público */}
                             <div className="mb-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                <label className="text-xs font-bold text-blue-900 uppercase mb-1 block">Título de la Sección (Visible en CV)</label>
                                <input 
                                    value={formData?.labels?.sections?.profile || 'Perfil Personal'} 
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        labels: {
                                            ...prev.labels,
                                            sections: {
                                                ...prev.labels.sections,
                                                profile: e.target.value
                                            }
                                        }
                                    }))}
                                    className="w-full p-2.5 bg-white border border-blue-200 rounded text-sm text-blue-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-blue-300" 
                                    placeholder="Ej: Sobre Mí"
                                />
                            </div>

                            {/* Cabecera - Solo visible en modo Web (Móvil) ya que el PDF usa el Nombre */}
                            {previewType === 'mobile' && (
                                <>
                                <div className="pb-4 border-b border-slate-200">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Título del Logo (Ej: JD.Archila)</label>
                                    <input 
                                        value={formData.header?.title || ''} 
                                        onChange={(e) => handleChange('header', 'title', e.target.value)}
                                        onFocus={() => scrollToPreview('preview-header-title')}
                                        className="w-full p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Visible solo en la barra de navegación web.</p>
                                </div>

                                {/* Username / Public URL Setup */}
                                <div className="pb-4 border-b border-slate-200">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">URL Pública Personalizada (Opcional)</label>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                        <span className="text-sm text-slate-400 font-mono bg-slate-50 px-2 py-2.5 rounded border border-slate-200 text-center sm:text-left truncate">
                                            {window.location.host}/p/
                                        </span>
                                        <div className="relative flex-1">
                                            <input 
                                                value={formData.profile.username || ''} 
                                                onChange={(e) => {
                                                    // Validar caracteres (solo letras, números, guiones y puntos)
                                                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, '');
                                                    handleChange('profile', 'username', val);
                                                }}
                                                onFocus={() => scrollToPreview('preview-header-title')}
                                                placeholder={user?.uid}
                                                className="w-full p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" 
                                            />
                                            {formData.profile.username && (
                                                <div className="absolute right-2 top-2.5">
                                                     {/* Aquí podríamos mostrar un indicador de disponibilidad visual en el futuro */}
                                                     <span className="text-xs text-green-600 bg-green-50 px-1 rounded border border-green-200 font-bold">OK</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Deja en blanco para usar tu ID seguro. Usa letras, números y puntos (ej: juan.perez).
                                    </p>
                                </div>
                                </>
                            )}

                             {/* Photo Upload - Firebase */}
                             <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white border-2 border-slate-200 shrink-0 flex items-center justify-center relative shadow-sm group">
                                    {formData.profile.photoURL ? (
                                        <>
                                            <img src={formData.profile.photoURL} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                onClick={handleImageDelete}
                                                className="absolute inset-0 bg-black/50 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                                title="Eliminar foto"
                                            >
                                                <Trash2 size={24} />
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-3xl opacity-20">📷</span>
                                    )}
                                </div>
                                <div className="flex-1 w-full text-center sm:text-left">
                                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Foto de Perfil</label>
                                        {formData.profile.photoURL && (
                                            <button 
                                                onClick={handleImageDelete}
                                                className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 bg-white border border-transparent hover:border-red-100 rounded transition-all"
                                                title="Eliminar foto"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer mx-auto sm:mx-0 mb-2 truncate"
                                    />
                                    <p className="text-[10px] text-slate-400 leading-normal break-all px-1">
                                        Se guarda automáticamente en "gs://cv-juandiegoarchilaleon..."
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nombre</label>
                                    <input value={formData.profile.name} onChange={(e) => handleChange('profile', 'name', e.target.value)} onFocus={() => scrollToPreview('preview-hero-name')} className="w-full p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Rol</label>
                                    <input value={formData.profile.role} onChange={(e) => handleChange('profile', 'role', e.target.value)} onFocus={() => scrollToPreview('preview-hero-role')} className="w-full p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>


                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Resumen Profesional</label>
                                <textarea value={formData.profile.summary} onChange={(e) => handleChange('profile', 'summary', e.target.value)} onFocus={() => scrollToPreview('preview-hero-summary')} rows={4} className="w-full p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border-t pt-4 mt-2">
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Estado (Hero) {previewType === 'pdf' && <span onClick={handleSwitchToWeb} className="ml-2 text-[10px] bg-sky-100 text-sky-700 hover:bg-sky-200 px-2 py-0.5 rounded-full font-bold cursor-pointer transition-colors border border-sky-200 inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>}</label>
                                    <select 
                                        value={formData.profile.status} 
                                        onChange={(e) => handleChange('profile', 'status', e.target.value)}
                                        onFocus={() => { scrollToPreview('preview-hero-status'); handleSwitchToWeb(); }}
                                        className="w-full p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    >
                                        <option value="Disponible">Disponible</option>
                                        <option value="Open to Work">Open to Work</option>
                                        <option value="Trabajando">Trabajando</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="En Proyectos">En Proyectos</option>
                                        <option value="Desconectado">Desconectado</option>
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ubicación {previewType === 'pdf' && <span onClick={handleSwitchToWeb} className="ml-2 text-[10px] bg-sky-100 text-sky-700 hover:bg-sky-200 px-2 py-0.5 rounded-full font-bold cursor-pointer transition-colors border border-sky-200 inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>}</label>
                                    <input 
                                        value={formData.profile.location} 
                                        onChange={(e) => handleChange('profile', 'location', e.target.value)} 
                                        onFocus={() => { scrollToPreview('preview-hero-location'); handleSwitchToWeb(); }}
                                        className="w-full p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Botón Principal (Izq) {previewType === 'pdf' && <span onClick={handleSwitchToWeb} className="ml-2 text-[10px] bg-sky-100 text-sky-700 hover:bg-sky-200 px-2 py-0.5 rounded-full font-bold cursor-pointer transition-colors border border-sky-200 inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>}</label>
                                    {(() => {
                                        const type = formData.profile.socialType || 'linkedin';
                                        const isMessaging = ['whatsapp', 'telegram', 'phone'].includes(type);

                                        // Common Logic
                                        const rawUrl = formData.profile.linkedin || '';
                                        
                                        // Messaging Parsing Logic
                                        let prefix = 'https://wa.me/';
                                        if (rawUrl.startsWith('https://t.me/')) prefix = 'https://t.me/';
                                        if (rawUrl.startsWith('tel:')) prefix = 'tel:';
                                        
                                        const waFull = rawUrl.replace(prefix, '');
                                        const detected = COUNTRY_CODES.filter(c => c.code).sort((a,b) => b.code.length - a.code.length).find(c => waFull.startsWith(c.code));
                                        
                                        const activeCodeFinal = detected ? detected.code : '57';
                                        const activeNumber = detected ? waFull.slice(detected.code.length) : (waFull.startsWith('57') ? waFull.slice(2) : waFull);

                                        const updateContact = (newType, newCode, newNum) => {
                                             let newPrefix = 'https://wa.me/';
                                             if (newType === 'telegram') newPrefix = 'https://t.me/';
                                             if (newType === 'phone') newPrefix = 'tel:';
                                             handleChange('profile', 'socialType', newType);
                                             handleChange('profile', 'linkedin', `${newPrefix}${newCode}${newNum}`);
                                        };

                                        const updateSocial = (newType, newVal) => {
                                            handleChange('profile', 'socialType', newType);
                                            handleChange('profile', 'linkedin', newVal);
                                        }

                                        return (
                                            <div className={`group flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all overflow-hidden shadow-sm ${previewType === 'pdf' ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-300 hover:border-slate-400'}`}>
                                            
                                                <div className={`relative border-r transition-colors shrink-0 w-[42px] flex items-center justify-center ${previewType === 'pdf' ? 'border-slate-200 bg-slate-100' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                                                     <select 
                                                        value={type}
                                                        onChange={(e) => {
                                                            const newT = e.target.value;
                                                            if(['whatsapp', 'telegram', 'phone'].includes(newT)) {
                                                                updateContact(newT, activeCodeFinal, activeNumber); 
                                                            } else {
                                                                updateSocial(newT, rawUrl);
                                                            }
                                                        }}
                                                        onFocus={handleSwitchToWeb}
                                                        className="absolute inset-0 cursor-pointer opacity-0 z-10 w-full h-full"
                                                        title="Selecciona la red social"
                                                    >
                                                        <optgroup label="Redes Sociales">
                                                            <option value="linkedin">LinkedIn</option>
                                                            <option value="github">GitHub</option>
                                                            <option value="twitter">X (Twitter)</option>
                                                            <option value="globe">Web / Portafolio</option>
                                                        </optgroup>
                                                        <optgroup label="Contacto">
                                                            <option value="email">Email</option>
                                                            <option value="whatsapp">WhatsApp</option>
                                                            <option value="telegram">Telegram</option>
                                                            <option value="phone">Teléfono</option>
                                                        </optgroup>
                                                    </select>
                                                    
                                                    {/* Icon Preview */}
                                                    <div className={`pointer-events-none ${previewType === 'pdf' ? 'text-slate-400' : 'text-slate-600'}`}> 
                                                        {type === 'linkedin' && <span className="font-bold text-blue-700">in</span>}
                                                        {type === 'github' && <span className="font-bold">GH</span>}
                                                        {type === 'twitter' && <span className="font-bold">X</span>}
                                                        {type === 'globe' && <span className="font-bold">Web</span>}
                                                        {type === 'email' && <span className="font-bold">@</span>}
                                                        {type === 'whatsapp' && <MessageCircle size={16} className="text-green-600" />}
                                                        {type === 'telegram' && <Send size={16} className="text-sky-500" />}
                                                        {type === 'phone' && <Phone size={16} className="text-slate-700" />}
                                                    </div>
                                                </div>

                                                {isMessaging ? (
                                                    <>
                                                        {/* COUNTRY SELECTOR */}
                                                        <div className={`relative border-r transition-colors shrink-0 w-[72px] ${previewType === 'pdf' ? 'border-slate-200 bg-slate-100' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}> 
                                                            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                                                                <span className={`${previewType === 'pdf' ? 'text-slate-400' : 'text-slate-700'} font-medium text-sm`}>+{activeCodeFinal}</span>
                                                            </div>
                                                            <select
                                                                className="appearance-none bg-transparent py-2.5 pl-2 pr-6 text-transparent font-medium text-sm outline-none cursor-pointer w-full h-full relative z-10"
                                                                value={activeCodeFinal}
                                                                onChange={(e) => updateContact(type, e.target.value, activeNumber)}
                                                                onFocus={() => { scrollToPreview('preview-profile-button-primary'); handleSwitchToWeb(); }}
                                                            >
                                                                {COUNTRY_CODES.map(c => (
                                                                    <option key={c.name} value={c.code} className="text-slate-800">
                                                                        {c.flag} {c.name} (+{c.code})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 z-0">
                                                                <ChevronDown size={14} />
                                                            </div>
                                                        </div>

                                                        {/* NUMBER INPUT */}
                                                        <input 
                                                            type="tel"
                                                            value={activeNumber}
                                                            onChange={(e) => {
                                                                const raw = e.target.value;
                                                                const clean = raw.replace(/[^0-9]/g, '');
                                                                updateContact(type, activeCodeFinal, clean);
                                                            }}
                                                            onFocus={() => { scrollToPreview('preview-profile-button-primary'); handleSwitchToWeb(); }}
                                                            placeholder="314..."
                                                            className={`flex-1 w-full p-2.5 outline-none font-mono text-sm ${previewType === 'pdf' ? 'bg-slate-50 text-slate-500 placeholder:text-slate-400' : 'bg-transparent text-slate-700 placeholder:text-slate-400'}`} 
                                                        />
                                                    </>
                                                ) : (
                                                    <input 
                                                        value={formData.profile.linkedin || ''} 
                                                        onChange={(e) => handleChange('profile', 'linkedin', e.target.value)} 
                                                        onFocus={() => { scrollToPreview('preview-profile-button-primary'); handleSwitchToWeb(); }}
                                                        placeholder="URL completa..."
                                                        className={`flex-1 w-full p-2.5 outline-none text-sm ${previewType === 'pdf' ? 'bg-slate-50 text-slate-500 placeholder:text-slate-400' : 'bg-transparent text-slate-700 placeholder:text-slate-400'}`} 
                                                    />
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Botón Secundario (Der) {previewType === 'pdf' && <span onClick={handleSwitchToWeb} className="ml-2 text-[10px] bg-sky-100 text-sky-700 hover:bg-sky-200 px-2 py-0.5 rounded-full font-bold cursor-pointer transition-colors border border-sky-200 inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>}</label>
                                    {(() => {
                                        const type = formData.profile.messagingType || 'whatsapp';
                                        const isMessaging = ['whatsapp', 'telegram', 'phone'].includes(type);

                                        // Common Logic
                                        const rawUrl = formData.profile.whatsapp || '';
                                        
                                        // Messaging Parsing Logic
                                        let prefix = 'https://wa.me/';
                                        if (rawUrl.startsWith('https://t.me/')) prefix = 'https://t.me/';
                                        if (rawUrl.startsWith('tel:')) prefix = 'tel:';
                                        
                                        const waFull = rawUrl.replace(prefix, '');
                                        const detected = COUNTRY_CODES.filter(c => c.code).sort((a,b) => b.code.length - a.code.length).find(c => waFull.startsWith(c.code));
                                        
                                        const activeCodeFinal = detected ? detected.code : '57';
                                        const activeNumber = detected ? waFull.slice(detected.code.length) : (waFull.startsWith('57') ? waFull.slice(2) : waFull);

                                        const updateContact = (newType, newCode, newNum) => {
                                             let newPrefix = 'https://wa.me/';
                                             if (newType === 'telegram') newPrefix = 'https://t.me/';
                                             if (newType === 'phone') newPrefix = 'tel:';
                                             handleChange('profile', 'messagingType', newType);
                                             handleChange('profile', 'whatsapp', `${newPrefix}${newCode}${newNum}`);
                                        };

                                        const updateSocial = (newType, newVal) => {
                                            handleChange('profile', 'messagingType', newType);
                                            handleChange('profile', 'whatsapp', newVal);
                                        }

                                        return (
                                            <div className={`group flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all overflow-hidden shadow-sm ${previewType === 'pdf' ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-300 hover:border-slate-400'}`}>
                                                
                                                {/* SERVICE SELECTOR */}
                                                <div className={`relative border-r transition-colors shrink-0 w-[42px] flex items-center justify-center ${previewType === 'pdf' ? 'border-slate-200 bg-slate-100' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                                                     <select 
                                                        value={type}
                                                        onChange={(e) => {
                                                            const newT = e.target.value;
                                                            // If switching TO a messaging type, try to preserve/format existing value? 
                                                            // For simplicity: just switch type, user cleans up value.
                                                            if(['whatsapp', 'telegram', 'phone'].includes(newT)) {
                                                                updateContact(newT, activeCodeFinal, activeNumber); 
                                                            } else {
                                                                // Switching TO social -> just treat current value as string
                                                                updateSocial(newT, rawUrl);
                                                            }
                                                        }}
                                                        onFocus={handleSwitchToWeb}
                                                        className="absolute inset-0 cursor-pointer opacity-0 z-10 w-full h-full"
                                                        title="Selecciona App"
                                                    >
                                                        <optgroup label="Contacto">
                                                            <option value="whatsapp">WhatsApp</option>
                                                            <option value="telegram">Telegram</option>
                                                            <option value="phone">Teléfono</option>
                                                            <option value="email">Email</option>
                                                        </optgroup>
                                                        <optgroup label="Redes Sociales">
                                                            <option value="linkedin">LinkedIn</option>
                                                            <option value="github">GitHub</option>
                                                            <option value="twitter">X (Twitter)</option>
                                                            <option value="globe">Web / Portafolio</option>
                                                        </optgroup>
                                                    </select>
                                                   <div className={`pointer-events-none ${previewType === 'pdf' ? 'text-slate-400' : 'text-slate-600'}`}>
                                                        {type === 'whatsapp' && <MessageCircle size={16} className="text-green-600" />}
                                                        {type === 'telegram' && <Send size={16} className="text-sky-500" />}
                                                        {type === 'phone' && <Phone size={16} className="text-slate-700" />}
                                                        {type === 'linkedin' && <span className="font-bold text-blue-700">in</span>}
                                                        {type === 'github' && <span className="font-bold">GH</span>}
                                                        {type === 'twitter' && <span className="font-bold">X</span>}
                                                        {type === 'globe' && <span className="font-bold">Web</span>}
                                                        {type === 'email' && <span className="font-bold">@</span>}
                                                    </div>
                                                </div>

                                                {isMessaging ? (
                                                    <>
                                                        {/* COUNTRY SELECTOR */}
                                                        <div className={`relative border-r transition-colors shrink-0 w-[72px] ${previewType === 'pdf' ? 'border-slate-200 bg-slate-100' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                                                            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                                                                <span className={`${previewType === 'pdf' ? 'text-slate-400' : 'text-slate-700'} font-medium text-sm`}>+{activeCodeFinal}</span>
                                                            </div>
                                                            <select
                                                                className="appearance-none bg-transparent py-2.5 pl-2 pr-6 text-transparent font-medium text-sm outline-none cursor-pointer w-full h-full relative z-10"
                                                                value={activeCodeFinal}
                                                                onChange={(e) => updateContact(type, e.target.value, activeNumber)}
                                                                onFocus={() => { scrollToPreview('preview-profile-button-secondary'); handleSwitchToWeb(); }}
                                                            >
                                                                {COUNTRY_CODES.map(c => (
                                                                    <option key={c.name} value={c.code} className="text-slate-800">
                                                                        {c.flag} {c.name} (+{c.code})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 z-0">
                                                                <ChevronDown size={14} />
                                                            </div>
                                                        </div>

                                                        {/* NUMBER INPUT */}
                                                        <input 
                                                            type="tel"
                                                            value={activeNumber}
                                                            onChange={(e) => {
                                                                const raw = e.target.value;
                                                                const clean = raw.replace(/[^0-9]/g, '');
                                                                updateContact(type, activeCodeFinal, clean);
                                                            }}
                                                            onFocus={() => { scrollToPreview('preview-profile-button-secondary'); handleSwitchToWeb(); }}
                                                            placeholder="314..."
                                                            className={`flex-1 w-full p-2.5 outline-none font-mono text-sm ${previewType === 'pdf' ? 'bg-slate-50 text-slate-500 placeholder:text-slate-400' : 'bg-transparent text-slate-700 placeholder:text-slate-400'}`} 
                                                        />
                                                    </>
                                                ) : (
                                                    /* GENERIC INPUT FOR SOCIALS */
                                                    <input 
                                                        value={rawUrl}
                                                        onChange={(e) => updateSocial(type, e.target.value)}
                                                        onFocus={() => { scrollToPreview('preview-profile-button-secondary'); handleSwitchToWeb(); }}
                                                        placeholder="URL completa..."
                                                        className={`flex-1 w-full p-2.5 outline-none text-sm ${previewType === 'pdf' ? 'bg-slate-50 text-slate-500 placeholder:text-slate-400' : 'bg-transparent text-slate-700 placeholder:text-slate-400'}`} 
                                                    />
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* EXPERIENCE - Título Estático para Editor */}
                    <Section 
                        title="Experiencia Laboral" 
                        isOpen={openSection === 'experience'} 
                        toggle={() => setOpenSection(openSection === 'experience' ? '' : 'experience')} 
                        color="indigo"
                        onFocus={() => scrollToPreview('preview-experience-title')}
                        isVisible={formData.sectionVisibility?.experience ?? true}
                        onToggleVisibility={() => handleChange('sectionVisibility', 'experience', !(formData.sectionVisibility?.experience ?? true))}
                    >
                        {/* Editor del Título Público */}
                        <div className="mb-6 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                            <label className="text-xs font-bold text-indigo-900 uppercase mb-1 block">Título de la Sección (Visible en CV/Web)</label>
                            <input 
                                value={formData?.labels?.sections?.experience || 'Experiencia Profesional'} 
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    labels: {
                                        ...prev.labels,
                                        sections: {
                                            ...prev.labels.sections,
                                            experience: e.target.value
                                        }
                                    }
                                }))}
                                onFocus={() => scrollToPreview('preview-experience-title')}
                                className="w-full p-2.5 bg-white border border-indigo-200 rounded text-sm text-indigo-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-indigo-300" 
                                placeholder="Ej: Experiencia Profesional"
                            />
                        </div>
                        
                        <div className="flex justify-end mb-4">
                            <button onClick={() => handleArrayItemAdd('experience', { role: 'Nuevo Cargo', company: 'Nueva Empresa', period: '', location: '', description: '', summary: [], details: [], tech: [], link: '', linkLabel: '' })} className="flex items-center gap-2 text-sm bg-indigo-600 text-white px-4 py-2 rounded-full shadow hover:bg-indigo-700 transition-colors">
                               <Plus size={16} /> Añadir Entrada
                            </button>
                        </div>
                        
                        <Reorder.Group axis="y" values={formData.experience} onReorder={(newOrder) => handleReorder('experience', newOrder)} className="space-y-4">
                            {formData.experience.map((exp, idx) => (
                                <DraggableItem 
                                    key={exp._id} 
                                    item={exp} 
                                    title={exp.role} 
                                    subtitle={`${exp.company} • ${exp.period}`}
                                    onDelete={() => handleArrayItemDelete('experience', idx)}
                                    onFocus={() => scrollToPreview(`preview-experience-${exp._id || idx}`)}
                                >
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Cargo</label>
                                                <input value={exp.role} onChange={(e) => handleArrayChange('experience', idx, 'role', e.target.value)} onFocus={() => scrollToPreview(`preview-exp-role-${exp._id || idx}`)} className="w-full p-2 bg-white border border-slate-300 rounded" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Empresa</label>
                                                <input value={exp.company} onChange={(e) => handleArrayChange('experience', idx, 'company', e.target.value)} onFocus={() => scrollToPreview(`preview-exp-company-${exp._id || idx}`)} className="w-full p-2 bg-white border border-slate-300 rounded" />
                                            </div>
                                        </div>
                                        
                                        {(() => {
                                            const parts = (exp.period || '').split(' - ');
                                            const startParts = (parts[0] || '').trim().split(' ');
                                            const endParts = (parts[1] || '').trim().split(' ');
                                            
                                            // Heurística simple
                                            const startMonth = startParts.length >= 2 ? startParts[0] : '';
                                            const startYear = startParts.length >= 2 ? startParts[1] : (startParts.length === 1 ? startParts[0] : '');
                                            
                                            const isCurrent = (parts[1] || '').toLowerCase() === 'actualidad';
                                            
                                            const endMonth = !isCurrent && endParts.length >= 2 ? endParts[0] : '';
                                            const endYear = !isCurrent && endParts.length >= 2 ? endParts[1] : (!isCurrent && endParts.length === 1 ? endParts[0] : '');

                                            const locParts = (exp.location || '').split(',');
                                            const city = locParts[0] ? locParts[0].trim() : '';
                                            const country = locParts[1] ? locParts[1].trim() : '';

                                            const updatePeriod = (sM, sY, eM, eY, cur) => {
                                                const start = (sM && sY) ? `${sM} ${sY}` : (sM || sY || '');
                                                const end = cur ? 'Actualidad' : ((eM && eY) ? `${eM} ${eY}` : (eM || eY || ''));
                                                
                                                handleArrayChange('experience', idx, 'period', `${start} - ${end}`);
                                                scrollToPreview(`preview-exp-period-${exp._id || idx}`);
                                            };

                                            const updateLoc = (c, cy) => {
                                                 handleArrayChange('experience', idx, 'location', cy ? `${c}, ${cy}` : c);
                                                 scrollToPreview(`preview-exp-location-${exp._id || idx}`);
                                            }

                                            return (
                                                <div className="space-y-4">
                                                    {/* Ubicación */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                         <div>
                                                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Ciudad (Ej: Bogotá) {previewType === 'pdf' && <span onClick={handleSwitchToWeb} className="ml-2 text-[10px] bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer px-2 py-0.5 rounded-full font-semibold transition-colors inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>}</label>
                                                            <input 
                                                                value={city} 
                                                                onChange={(e) => updateLoc(e.target.value, country)}
                                                                onFocus={() => { scrollToPreview(`preview-exp-location-${exp._id || idx}`); handleSwitchToWeb(); }}
                                                                className="w-full p-2 bg-white border border-slate-300 rounded text-sm" 
                                                                placeholder="Ciudad"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">País (Opcional) {previewType === 'pdf' && <span onClick={handleSwitchToWeb} className="ml-2 text-[10px] bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer px-2 py-0.5 rounded-full font-semibold transition-colors inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>}</label>
                                                            <input 
                                                                value={country} 
                                                                onChange={(e) => updateLoc(city, e.target.value)}
                                                                onFocus={() => { scrollToPreview(`preview-exp-location-${exp._id || idx}`); handleSwitchToWeb(); }}
                                                                className="w-full p-2 bg-white border border-slate-300 rounded text-sm" 
                                                                placeholder="País"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Fechas */}
                                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Periodo Laboral</label>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                            {/* Inicio */}
                                                            <div>
                                                                <label className="text-[10px] text-slate-400 block mb-1">Inicia Mes</label>
                                                                <select 
                                                                    value={startMonth} 
                                                                    onChange={(e) => updatePeriod(e.target.value, startYear, endMonth, endYear, isCurrent)}
                                                                    onFocus={() => scrollToPreview(`preview-exp-period-${exp._id || idx}`)}
                                                                    className="w-full p-1.5 bg-white border border-slate-300 rounded"
                                                                >
                                                                    <option value="">Mes...</option>
                                                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-slate-400 block mb-1">Inicia Año</label>
                                                                <select 
                                                                    value={startYear} 
                                                                    onChange={(e) => updatePeriod(startMonth, e.target.value, endMonth, endYear, isCurrent)}
                                                                    onFocus={() => scrollToPreview(`preview-exp-period-${exp._id || idx}`)}
                                                                    className="w-full p-1.5 bg-white border border-slate-300 rounded"
                                                                >
                                                                    <option value="">Año...</option>
                                                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                                </select>
                                                            </div>

                                                            {/* Fin */}
                                                            <div>
                                                                <label className="text-[10px] text-slate-400 block mb-1">Finaliza Mes</label>
                                                                <select 
                                                                    value={endMonth} 
                                                                    disabled={isCurrent}
                                                                    onChange={(e) => updatePeriod(startMonth, startYear, e.target.value, endYear, isCurrent)}
                                                                    onFocus={() => scrollToPreview(`preview-exp-period-${exp._id || idx}`)}
                                                                    className="w-full p-1.5 bg-white border border-slate-300 rounded disabled:bg-slate-100 disabled:text-slate-400"
                                                                >
                                                                    <option value="">Mes...</option>
                                                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-slate-400 block mb-1">Finaliza Año</label>
                                                                <select 
                                                                    value={endYear} 
                                                                    disabled={isCurrent}
                                                                    onChange={(e) => updatePeriod(startMonth, startYear, endMonth, e.target.value, isCurrent)}
                                                                    onFocus={() => scrollToPreview(`preview-exp-period-${exp._id || idx}`)}
                                                                    className="w-full p-1.5 bg-white border border-slate-300 rounded disabled:bg-slate-100 disabled:text-slate-400"
                                                                >
                                                                    <option value="">Año...</option>
                                                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="mt-3 flex items-center gap-2">
                                                            <input 
                                                                type="checkbox" 
                                                                id={`current-${exp._id}`}
                                                                checked={isCurrent}
                                                                onChange={(e) => updatePeriod(startMonth, startYear, endMonth, endYear, e.target.checked)}
                                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                            />
                                                            <label htmlFor={`current-${exp._id}`} className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                                                                Actualmente trabajo aquí (Puesto Actual)
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Descripción General</label>
                                            <textarea value={exp.description} onChange={(e) => handleArrayChange('experience', idx, 'description', e.target.value)} onFocus={() => scrollToPreview(`preview-exp-description-${exp._id || idx}`)} className="w-full p-2 bg-white border border-slate-300 rounded" rows={2} />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Logros Principales (Visible siempre)</label>
                                            <textarea 
                                                value={listToString(exp.summary)} 
                                                onChange={(e) => handleArrayListChange('experience', idx, 'summary', e.target.value)} 
                                                onFocus={() => scrollToPreview(`preview-exp-achievements-${exp._id || idx}`)}
                                                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-sm" 
                                                rows={4} 
                                                placeholder="Ej: Lideré equipo de 5 personas..."
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Detalles Adicionales (Desplegable 'Ver más') {previewType === 'pdf' && <span onClick={handleSwitchToWeb} className="ml-2 text-[10px] bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer px-2 py-0.5 rounded-full font-semibold transition-colors inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>}</label>
                                            <textarea 
                                                value={listToString(exp.details)} 
                                                onChange={(e) => handleArrayListChange('experience', idx, 'details', e.target.value)} 
                                                onFocus={() => { scrollToPreview(`preview-exp-details-${exp._id || idx}`); handleSwitchToWeb(); }}
                                                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-sm" 
                                                rows={4} 
                                                placeholder="Ej: Migración de base de datos..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Enlace (URL) {previewType === 'pdf' && <span onClick={handleSwitchToWeb} className="ml-2 text-[10px] bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer px-2 py-0.5 rounded-full font-semibold transition-colors inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>}</label>
                                                <input 
                                                    value={exp.link || ''} 
                                                    onChange={(e) => handleArrayChange('experience', idx, 'link', e.target.value)} 
                                                    onFocus={() => { scrollToPreview(`preview-exp-link-${exp._id || idx}`); handleSwitchToWeb(); }}
                                                    className="w-full p-2 bg-white border border-slate-300 rounded" 
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Texto del Enlace {previewType === 'pdf' && <span onClick={handleSwitchToWeb} className="ml-2 text-[10px] bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer px-2 py-0.5 rounded-full font-semibold transition-colors inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>}</label>
                                                <select 
                                                    value={exp.linkLabel || ''} 
                                                    onChange={(e) => handleArrayChange('experience', idx, 'linkLabel', e.target.value)} 
                                                    onFocus={() => { scrollToPreview(`preview-exp-link-${exp._id || idx}`); handleSwitchToWeb(); }}
                                                    className="w-full p-2 bg-white border border-slate-300 rounded text-sm" 
                                                >
                                                    <option value="">Seleccionar opción...</option>
                                                    {LINK_OPTIONS.experience.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Tecnologías (Uno por línea) {previewType === 'pdf' && <span onClick={handleSwitchToWeb} className="ml-2 text-[10px] bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer px-2 py-0.5 rounded-full font-semibold transition-colors inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>}</label>
                                            <textarea 
                                                value={listToString(exp.tech)} 
                                                onChange={(e) => handleArrayListChange('experience', idx, 'tech', e.target.value)} 
                                                onFocus={() => { scrollToPreview(`preview-exp-tech-${exp._id || idx}`); handleSwitchToWeb(); }}
                                                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-sm" 
                                                rows={3}
                                                placeholder="Ej: React&#10;Node.js"
                                            />
                                        </div>

                                    </div>
                                </DraggableItem>
                            ))}
                        </Reorder.Group>
                    </Section>

                    {/* PROJECTS - Título Estático para Editor */}
                    <Section 
                        title="Portafolio de Proyectos" 
                        isOpen={openSection === 'projects'} 
                        toggle={() => setOpenSection(openSection === 'projects' ? '' : 'projects')} 
                        color="purple"
                         onFocus={() => scrollToPreview('preview-projects-title')}
                         isVisible={formData.sectionVisibility?.projects ?? true}
                         onToggleVisibility={() => handleChange('sectionVisibility', 'projects', !(formData.sectionVisibility?.projects ?? true))}
                    >
                        {/* Editor del Título Público */}
                        <div className="mb-6 p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                            <label className="text-xs font-bold text-purple-900 uppercase mb-1 block">Título de la Sección (Visible en CV/Web)</label>
                            <input 
                                value={formData?.labels?.sections?.projects || 'Proyectos'} 
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    labels: {
                                        ...prev.labels,
                                        sections: {
                                            ...prev.labels.sections,
                                            projects: e.target.value
                                        }
                                    }
                                }))}
                                onFocus={() => scrollToPreview('preview-projects-title')}
                                className="w-full p-2.5 bg-white border border-purple-200 rounded text-sm text-purple-900 font-bold focus:ring-2 focus:ring-purple-500 outline-none placeholder:text-purple-300" 
                                placeholder="Ej: Proyectos Reales"
                            />
                        </div>

                        <div className="flex justify-end mb-4">
                            <button onClick={() => handleArrayItemAdd('projects', { title: 'Nuevo Proyecto', description: '', tech: [], features: [], link: '', linkLabel: '', featured: false })} className="flex items-center gap-2 text-sm bg-purple-600 text-white px-4 py-2 rounded-full shadow hover:bg-purple-700 transition-colors">
                            <Plus size={16} /> Añadir Proyecto
                            </button>
                        </div>

                         <Reorder.Group axis="y" values={formData.projects} onReorder={(newOrder) => handleReorder('projects', newOrder)}>
                            {formData.projects.map((proj, idx) => (
                                <DraggableItem 
                                    key={proj._id}
                                    item={proj}
                                    title={proj.title}
                                    subtitle={proj.role}
                                    onDelete={() => handleArrayItemDelete('projects', idx)}
                                    onFocus={() => scrollToPreview(`preview-project-${proj._id}`)}
                                >
                                    <div className="space-y-4">
                                        <div className={`flex items-center gap-2 mb-2 p-2 rounded border flex-wrap ${previewType === 'pdf' ? 'bg-slate-100 border-slate-200' : 'bg-purple-50 border-purple-100'}`}>
                                            <div className="flex items-center gap-2 mr-4">
                                                <input 
                                                    type="checkbox" 
                                                    id={`featured-${proj._id}`}
                                                    checked={proj.featured || false}
                                                    onChange={(e) => handleArrayChange('projects', idx, 'featured', e.target.checked)}
                                                    onFocus={() => { scrollToPreview(`preview-project-${proj._id}`); handleSwitchToWeb(); }}
                                                    className={`w-4 h-4 rounded border-gray-300 ${previewType === 'pdf' ? 'text-slate-400' : 'text-purple-600 focus:ring-purple-500'}`}
                                                />
                                                <label htmlFor={`featured-${proj._id}`} className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                                                    Diseño Grande (Featured)
                                                    {previewType === 'pdf' && <span onClick={handleSwitchToWeb} className="ml-2 text-[10px] bg-sky-100 text-sky-700 hover:bg-sky-200 cursor-pointer px-2 py-0.5 rounded-full font-semibold transition-colors inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>}
                                                </label>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    id={`badge-${proj._id}`}
                                                    checked={proj.showFeaturedBadge ?? true} // Default to true if undefined
                                                    onChange={(e) => handleArrayChange('projects', idx, 'showFeaturedBadge', e.target.checked)}
                                                    onFocus={() => { scrollToPreview(`preview-project-${proj._id}`); handleSwitchToWeb(); }}
                                                    className={`w-4 h-4 rounded border-gray-300 ${previewType === 'pdf' ? 'text-slate-400' : 'text-blue-600 focus:ring-blue-500'}`}
                                                />
                                                <label htmlFor={`badge-${proj._id}`} className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                                                    Mostrar Insignia "Proyecto Destacado"
                                                    {previewType === 'pdf' && <span onClick={handleSwitchToWeb} className="ml-2 text-[10px] bg-sky-100 text-sky-700 hover:bg-sky-200 cursor-pointer px-2 py-0.5 rounded-full font-semibold transition-colors inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>}
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Título del Proyecto</label>
                                            <input value={proj.title} onChange={(e) => handleArrayChange('projects', idx, 'title', e.target.value)} onFocus={() => scrollToPreview(`preview-project-title-${proj._id}`)} className="w-full p-2 bg-white border border-slate-300 rounded" />
                                        </div>
                                        
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Descripción</label>
                                            <textarea value={proj.description} onChange={(e) => handleArrayChange('projects', idx, 'description', e.target.value)} onFocus={() => scrollToPreview(`preview-project-description-${proj._id}`)} className="w-full p-2 bg-white border border-slate-300 rounded" rows={3} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="hidden">
                                                 <input value={proj.role || ''} onChange={(e) => handleArrayChange('projects', idx, 'role', e.target.value)} placeholder="Ej: Proyecto Destacado" className="w-full p-2 bg-white border border-slate-300 rounded" />
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Link URL</label>
                                                <input 
                                                    value={proj.link || ''} 
                                                    onChange={(e) => handleArrayChange('projects', idx, 'link', e.target.value)} 
                                                    onFocus={() => { scrollToPreview(`preview-project-link-${proj._id}`); handleSwitchToWeb(); }}
                                                    className="w-full p-2 bg-white border border-slate-300 rounded" 
                                                />
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Texto del Botón {previewType === 'pdf' && <span onClick={handleSwitchToWeb} className="ml-2 text-[10px] bg-sky-100 text-sky-700 hover:bg-sky-200 cursor-pointer px-2 py-0.5 rounded-full font-semibold transition-colors inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>}</label>
                                                <input 
                                                    type="text"
                                                    value={proj.linkLabel || ''} 
                                                    onChange={(e) => handleArrayChange('projects', idx, 'linkLabel', e.target.value)} 
                                                    onFocus={() => { scrollToPreview(`preview-project-button-${proj._id}`); handleSwitchToWeb(); }}
                                                    placeholder="Ver Proyecto (predeterminado)"
                                                    className="w-full p-2 bg-white border border-slate-300 rounded text-sm" 
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block border-t pt-4 mt-2">Estadísticas / Métricas (Opcional) {previewType === 'pdf' && <span onClick={handleSwitchToWeb} className="ml-2 text-[10px] bg-sky-100 text-sky-700 hover:bg-sky-200 cursor-pointer px-2 py-0.5 rounded-full font-semibold transition-colors inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>}</label>
                                            <div className={`grid grid-cols-2 gap-4 p-3 rounded-lg border ${previewType === 'pdf' ? 'bg-slate-100 border-slate-200' : 'bg-slate-50 border-slate-200'}`}>
                                                 <div className="col-span-2">
                                                     <label className="text-[10px] text-slate-400 block mb-1">Ícono (Opcional)</label>
                                                     <div className="flex flex-wrap gap-2">
                                                         {STAT_ICONS.map(icon => {
                                                             const isSelected = (proj.stats?.icon || 'Star') === icon.id;
                                                             return (
                                                                 <button
                                                                    key={icon.id}
                                                                    onClick={() => {
                                                                        const newStats = { ...(proj.stats || {}), icon: icon.id };
                                                                        handleArrayChange('projects', idx, 'stats', newStats);
                                                                    }}
                                                                    onFocus={() => { scrollToPreview(`preview-project-stats-${proj._id}`); handleSwitchToWeb(); }}
                                                                    className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${
                                                                        isSelected 
                                                                        ? 'bg-purple-100 text-purple-700 border-purple-300' 
                                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                                    }`}
                                                                    title={icon.name}
                                                                 >
                                                                     {icon.id}
                                                                 </button>
                                                             )
                                                         })}
                                                     </div>
                                                 </div>
                                                 <div>
                                                    <label className="text-[10px] text-slate-400 block mb-1">Valor Grande (Ej: 50+)</label>
                                                    <input 
                                                        value={proj.stats?.value || ''} 
                                                        onChange={(e) => {
                                                            const newStats = { ...(proj.stats || {}), value: e.target.value };
                                                            handleArrayChange('projects', idx, 'stats', newStats);
                                                        }}
                                                        onFocus={() => { scrollToPreview(`preview-project-stats-${proj._id}`); handleSwitchToWeb(); }}
                                                        placeholder="50+"
                                                        className="w-full p-2 bg-white border border-slate-300 rounded text-sm font-bold" 
                                                    />
                                                 </div>
                                                 <div>
                                                    <label className="text-[10px] text-slate-400 block mb-1">Etiqueta (Ej: Pedidos/Día)</label>
                                                    <input 
                                                        value={proj.stats?.label || ''} 
                                                        onChange={(e) => {
                                                            const newStats = { ...(proj.stats || {}), label: e.target.value };
                                                            handleArrayChange('projects', idx, 'stats', newStats);
                                                        }}
                                                        onFocus={() => { scrollToPreview(`preview-project-stats-${proj._id}`); handleSwitchToWeb(); }}
                                                        placeholder="Pedidos"
                                                        className="w-full p-2 bg-white border border-slate-300 rounded text-sm" 
                                                    />
                                                 </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Características (Una por línea)</label>
                                            <textarea 
                                                value={listToString(proj.features)} 
                                                onChange={(e) => handleArrayListChange('projects', idx, 'features', e.target.value)} 
                                                onFocus={() => scrollToPreview(`preview-project-features-${proj._id}`)}
                                                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-sm" 
                                                rows={3} 
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Tech Stack (Una por línea) {previewType === 'pdf' && <span onClick={handleSwitchToWeb} className="ml-2 text-[10px] bg-sky-100 text-sky-700 hover:bg-sky-200 cursor-pointer px-2 py-0.5 rounded-full font-semibold transition-colors inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>}</label>
                                            <textarea 
                                                value={listToString(proj.tech)} 
                                                onChange={(e) => handleArrayListChange('projects', idx, 'tech', e.target.value)} 
                                                onFocus={() => { scrollToPreview(`preview-project-tech-${proj._id}`); handleSwitchToWeb(); }}
                                                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-sm" 
                                                rows={2} 
                                            />
                                        </div>
                                    </div>
                                </DraggableItem>
                            ))}
                        </Reorder.Group>
                    </Section>

                    {/* SKILLS - Título Estático */}
                    <Section 
                        title="Habilidades y Stack" 
                        isOpen={openSection === 'skills'} 
                        toggle={() => setOpenSection(openSection === 'skills' ? '' : 'skills')} 
                        color="amber"
                        onFocus={() => scrollToPreview('preview-skills-title')}
                        isVisible={formData.sectionVisibility?.skills ?? true}
                         onToggleVisibility={() => handleChange('sectionVisibility', 'skills', !(formData.sectionVisibility?.skills ?? true))}
                    >
                         {/* Editor del Título Público */}
                         <div className="mb-6 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                            <label className="text-xs font-bold text-amber-900 uppercase mb-1 block">Título de la Sección (Visible en CV/Web)</label>
                            <input 
                                value={formData?.labels?.sections?.skills || 'Habilidades'} 
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    labels: {
                                        ...prev.labels,
                                        sections: {
                                            ...prev.labels.sections,
                                            skills: e.target.value
                                        }
                                    }
                                }))}
                                onFocus={() => scrollToPreview('preview-skills-title')}
                                className="w-full p-2.5 bg-white border border-amber-200 rounded text-sm text-amber-900 font-bold focus:ring-2 focus:ring-amber-500 outline-none placeholder:text-amber-300" 
                                placeholder="Ej: Stack Técnico"
                            />
                        </div>

                         <div className="bg-amber-50 p-4 rounded text-sm text-amber-800 mb-4 border border-amber-100">
                            Edita las habilidades por categoría. Puedes agregar nuevas habilidades o editar las existentes.
                         </div>
                        
                         {Object.entries(formData.skills.categories || {}).map(([key, items], idx) => (
                                                         <div key={idx} className="mb-8 pb-6 border-b border-slate-200 last:border-b-0">
                                                                <div className="mb-4 flex items-center gap-3">
                                                                    <div className="flex-1">
                                                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nombre de la categoría</label>
                                                                        <input
                                                                            type="text"
                                                                            value={key}
                                                                            onChange={(e) => {
                                                                                const newKey = (e.target.value || '').trim();
                                                                                setFormData(prev => {
                                                                                    const entries = Object.entries(prev.skills.categories || {}).map(([k, v]) => (k === key ? [newKey, v] : [k, v]));
                                                                                    const newCats = Object.fromEntries(entries);
                                                                                    return {
                                                                                        ...prev,
                                                                                        skills: { ...prev.skills, categories: newCats }
                                                                                    };
                                                                                });
                                                                            }}
                                                                            onFocus={() => {
                                                                                scrollToPreview(`preview-skills-category-${key}`);
                                                                                handleSwitchToWeb();
                                                                            }}
                                                                            onClick={() => scrollToPreview(`preview-skills-category-${key}`)}
                                                                            className={`w-full p-2 border rounded bg-white text-sm ${previewType === 'pdf' ? 'border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400' : 'border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400'}`}
                                                                        />
                                                                    </div>
                                                                    {previewType === 'pdf' && (
                                                                        <span onClick={handleSwitchToWeb} className="cursor-pointer text-[10px] bg-amber-200 text-amber-800 hover:bg-amber-300 px-2 py-0.5 rounded-full font-semibold border border-amber-300 shadow-sm inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>
                                                                    )}
                                                                </div>
                                
                                {/* Lista de skills existentes */}
                                <div className="space-y-2 mb-4">
                                  {items.map((skill, skillIdx) => (
                                    <div key={skillIdx} className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg p-3 hover:bg-amber-50 transition-colors">
                                                                            <input 
                                        type="text"
                                        value={skill || ''} 
                                        onChange={(e) => {
                                          const newItems = [...items];
                                          newItems[skillIdx] = e.target.value;
                                          setFormData(prev => ({
                                              ...prev,
                                              skills: {
                                                  ...prev.skills,
                                                  categories: {
                                                      ...prev.skills.categories,
                                                      [key]: newItems
                                                  }
                                              }
                                          }));
                                        }}
                                                                                onFocus={() => scrollToPreview(`preview-skills-category-${key}`)}
                                                                                onClick={() => scrollToPreview(`preview-skills-category-${key}`)}
                                        placeholder="Ingresa una habilidad"
                                        className="flex-1 p-2 border border-amber-300 rounded bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                      />
                                      <button 
                                        onClick={() => {
                                          const newItems = items.filter((_, i) => i !== skillIdx);
                                          setFormData(prev => ({
                                              ...prev,
                                              skills: {
                                                  ...prev.skills,
                                                  categories: {
                                                      ...prev.skills.categories,
                                                      [key]: newItems
                                                  }
                                              }
                                          }));
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Botón para agregar nueva habilidad */}
                                <button 
                                  onClick={() => {
                                    const newItems = [...items, ''];
                                    setFormData(prev => ({
                                        ...prev,
                                        skills: {
                                            ...prev.skills,
                                            categories: {
                                                ...prev.skills.categories,
                                                [key]: newItems
                                            }
                                        }
                                    }));
                                  }}
                                  className="w-full p-2 border-2 border-dashed border-amber-300 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors text-sm font-semibold"
                                >
                                  + Agregar Habilidad
                                </button>
                             </div>
                         ))}

                                                 {/* Habilidades Principales (nombre + icono) */}
                        <div className="mb-8">
                            <label className="text-sm font-bold text-slate-700 uppercase mb-4 block tracking-wider bg-amber-100 p-3 rounded-lg flex items-center justify-between">
                                <span>Principales (Destacadas)</span>
                                {previewType === 'pdf' && (
                                    <span 
                                        onClick={handleSwitchToWeb} 
                                        className="text-[10px] bg-amber-200 text-amber-800 hover:bg-amber-300 px-2 py-1 rounded-full font-bold cursor-pointer transition-colors border border-amber-300 inline-flex items-center gap-1 shadow-sm"
                                    >
                                        <ExternalLink size={10}/> Solo Web
                                    </span>
                                )}
                            </label>
                            
                            <div className="grid grid-cols-1 gap-4">
                                {(formData.skills.main || []).map((item, i) => (
                                    <div key={i} className="bg-white border border-amber-200 rounded-lg p-3 hover:bg-amber-50 transition-colors">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nombre</label>
                                                <input
                                                    type="text"
                                                    value={item?.name || ''}
                                                    onChange={(e) => {
                                                        const newMain = [...(formData.skills.main || [])];
                                                        newMain[i] = { ...(newMain[i] || {}), name: e.target.value };
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            skills: { ...prev.skills, main: newMain }
                                                        }));
                                                    }}
                                                    onFocus={() => {
                                                        scrollToPreview(`preview-skills-main-${i}`);
                                                        handleSwitchToWeb();
                                                    }} 
                                                    className="w-full p-2.5 border border-amber-300 rounded bg-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                                    placeholder="p.ej. JavaScript"
                                                />
                                            </div>
                                            <div className="w-full sm:w-56">
                                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Icono</label>
                                                <div className="flex gap-2">
                                                    <select
                                                        value={item?.icon || 'Code2'}
                                                        onChange={(e) => {
                                                            const newMain = [...(formData.skills.main || [])];
                                                            newMain[i] = { ...(newMain[i] || {}), icon: e.target.value };
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                skills: { ...prev.skills, main: newMain }
                                                            }));
                                                        }}
                                                        onFocus={() => {
                                                            scrollToPreview(`preview-skills-main-${i}`);
                                                            handleSwitchToWeb();
                                                        }}
                                                        className="flex-1 p-2.5 border border-amber-300 rounded bg-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                                    >
                                                        {['Code2','Database','Globe','Layout','LayoutTemplate','Server','Smartphone','Terminal','Cpu','Briefcase','UserCheck','Zap','GitBranch','Cloud'].map((opt) => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => {
                                                            const newMain = (formData.skills.main || []).filter((_, idx) => idx !== i);
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                skills: { ...prev.skills, main: newMain }
                                                            }));
                                                        }}
                                                        className="p-2.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded transition-colors self-end"
                                                        title="Eliminar habilidad"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                                                     <button
                                                         onClick={() => {
                                                             handleSwitchToWeb();
                                                             const newMain = [...(formData.skills.main || []), { name: '', icon: 'Code2' }];
                                                             setFormData(prev => ({
                                                                 ...prev,
                                                                 skills: { ...prev.skills, main: newMain }
                                                             }));
                                                         }}
                                                         className="w-full mt-3 p-2 border-2 border-dashed border-amber-300 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors text-sm font-semibold"
                                                     >
                                                         + Agregar Habilidad Principal
                                                     </button>
                                                 </div>
                    </Section>

                     {/* EDUCATION - Título Estático */}
                    <Section 
                        title="Formación Académica" 
                        isOpen={openSection === 'education'} 
                        toggle={() => setOpenSection(openSection === 'education' ? '' : 'education')} 
                        color="emerald"
                        onFocus={() => scrollToPreview('preview-education-title')}
                        isVisible={formData.sectionVisibility?.education ?? true}
                         onToggleVisibility={() => handleChange('sectionVisibility', 'education', !(formData.sectionVisibility?.education ?? true))}
                    >
                         {/* Editor del Título Público */}
                         <div className="mb-6 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                            <label className="text-xs font-bold text-emerald-900 uppercase mb-1 block">Título de la Sección (Visible en CV/Web)</label>
                            <input 
                                value={formData?.labels?.sections?.education || 'Educación'} 
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    labels: {
                                        ...prev.labels,
                                        sections: {
                                            ...prev.labels.sections,
                                            education: e.target.value
                                        }
                                    }
                                }))}
                                onFocus={() => scrollToPreview('preview-education-title')}
                                className="w-full p-2.5 bg-white border border-emerald-200 rounded text-sm text-emerald-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-emerald-300" 
                                placeholder="Ej: Historial Académico"
                            />
                        </div>

                        {/* FORMACIÓN ACADÉMICA */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-slate-700">Formación Académica</h4>
                                <button onClick={() => handleArrayItemAdd('education', { degree: 'Nuevo Título', institution: '', period: '', location: '', details: '', link: '', linkLabel: '' })} className="flex items-center gap-2 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-full shadow hover:bg-emerald-700 transition-colors">
                                <Plus size={14} /> Añadir
                                </button>
                            </div>

                            <Reorder.Group axis="y" values={formData.education} onReorder={(newOrder) => handleReorder('education', newOrder)}>
                                {formData.education.map((edu, idx) => (
                                    <DraggableItem 
                                        key={edu._id}
                                        item={edu}
                                        title={edu.degree}
                                        subtitle={`${edu.institution}`}
                                        onDelete={() => handleArrayItemDelete('education', idx)}
                                        onFocus={() => scrollToPreview(`preview-education-${edu._id || idx}`)}
                                    >
                                        <div className="space-y-4">
                                            <input value={edu.degree} onChange={(e) => handleArrayChange('education', idx, 'degree', e.target.value)} onFocus={() => scrollToPreview(`preview-education-degree-${edu._id || idx}`)} placeholder="Título" className="w-full p-2 bg-white border border-slate-300 rounded font-bold" />
                                            <input value={edu.institution} onChange={(e) => handleArrayChange('education', idx, 'institution', e.target.value)} onFocus={() => scrollToPreview(`preview-education-institution-${edu._id || idx}`)} placeholder="Institución" className="w-full p-2 bg-white border border-slate-300 rounded" />
                                            
                                            {/* Periodo y Ubicación */}
                                            {(() => {
                                                const parts = (edu.period || '').split(' - ');
                                                const startParts = (parts[0] || '').trim().split(' ');
                                                const endParts = (parts[1] || '').trim().split(' ');
                                                
                                                const startMonth = startParts.length >= 2 ? startParts[0] : '';
                                                const startYear = startParts.length >= 2 ? startParts[1] : (startParts.length === 1 ? startParts[0] : '');
                                                
                                                const isCurrent = (parts[1] || '').toLowerCase() === 'actualidad';
                                                
                                                const endMonth = !isCurrent && endParts.length >= 2 ? endParts[0] : '';
                                                const endYear = !isCurrent && endParts.length >= 2 ? endParts[1] : (!isCurrent && endParts.length === 1 ? endParts[0] : '');

                                                const updatePeriod = (sM, sY, eM, eY, cur) => {
                                                    const start = (sM && sY) ? `${sM} ${sY}` : (sM || sY || '');
                                                    const end = cur ? 'Actualidad' : ((eM && eY) ? `${eM} ${eY}` : (eM || eY || ''));
                                                    handleArrayChange('education', idx, 'period', `${start} - ${end}`);
                                                };

                                                return (
                                                    <div className="space-y-4">
                                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Periodo Académico</label>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                                <div>
                                                                    <label className="text-[10px] text-slate-400 block mb-1">Inicia Mes</label>
                                                                    <select 
                                                                        value={startMonth} 
                                                                        onChange={(e) => updatePeriod(e.target.value, startYear, endMonth, endYear, isCurrent)}
                                                                        onFocus={() => scrollToPreview(`preview-education-period-${edu._id || idx}`)}
                                                                        className="w-full p-1.5 bg-white border border-slate-300 rounded"
                                                                    >
                                                                        <option value="">Mes...</option>
                                                                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] text-slate-400 block mb-1">Inicia Año</label>
                                                                    <select 
                                                                        value={startYear} 
                                                                        onChange={(e) => updatePeriod(startMonth, e.target.value, endMonth, endYear, isCurrent)}
                                                                        onFocus={() => scrollToPreview(`preview-education-period-${edu._id || idx}`)}
                                                                        className="w-full p-1.5 bg-white border border-slate-300 rounded"
                                                                    >
                                                                        <option value="">Año...</option>
                                                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] text-slate-400 block mb-1">Finaliza Mes</label>
                                                                    <select 
                                                                        value={endMonth} 
                                                                        disabled={isCurrent}
                                                                        onChange={(e) => updatePeriod(startMonth, startYear, e.target.value, endYear, isCurrent)}
                                                                        onFocus={() => scrollToPreview(`preview-education-period-${edu._id || idx}`)}
                                                                        className="w-full p-1.5 bg-white border border-slate-300 rounded disabled:bg-slate-100 disabled:text-slate-400"
                                                                    >
                                                                        <option value="">Mes...</option>
                                                                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] text-slate-400 block mb-1">Finaliza Año</label>
                                                                    <select 
                                                                        value={endYear} 
                                                                        disabled={isCurrent}
                                                                        onChange={(e) => updatePeriod(startMonth, startYear, endMonth, e.target.value, isCurrent)}
                                                                        onFocus={() => scrollToPreview(`preview-education-period-${edu._id || idx}`)}
                                                                        className="w-full p-1.5 bg-white border border-slate-300 rounded disabled:bg-slate-100 disabled:text-slate-400"
                                                                    >
                                                                        <option value="">Año...</option>
                                                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 flex items-center gap-2">
                                                                <input 
                                                                    type="checkbox" 
                                                                    id={`current-edu-${edu._id}`}
                                                                    checked={isCurrent}
                                                                    onChange={(e) => updatePeriod(startMonth, startYear, endMonth, endYear, e.target.checked)}
                                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                                />
                                                                <label htmlFor={`current-edu-${edu._id}`} className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                                                                    Sigo estudiando aquí
                                                                </label>
                                                            </div>
                                                        </div>

                                                        <input value={edu.location} onChange={(e) => handleArrayChange('education', idx, 'location', e.target.value)} onFocus={() => scrollToPreview(`preview-education-location-${edu._id || idx}`)} placeholder="Ubicación" className="w-full p-2 bg-white border border-slate-300 rounded" />
                                                    </div>
                                                );
                                            })()}

                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                <div className="col-span-2">
                                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Recursos Adicionales {previewType === 'pdf' && <span onClick={handleSwitchToWeb} className="ml-2 text-[10px] bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer px-2 py-0.5 rounded-full font-semibold transition-colors inline-flex items-center gap-1"><ExternalLink size={10}/> Solo Web</span>}</label>
                                                </div>
                                                <input 
                                                    value={edu.link || ''} 
                                                    onChange={(e) => handleArrayChange('education', idx, 'link', e.target.value)} 
                                                    onFocus={() => { scrollToPreview(`preview-education-link-${edu._id || idx}`); handleSwitchToWeb(); }}
                                                    placeholder="URL (Opcional)" 
                                                    className="w-full p-2 bg-white border border-slate-300 rounded" 
                                                />
                                                <select 
                                                    value={edu.linkLabel || ''} 
                                                    onChange={(e) => handleArrayChange('education', idx, 'linkLabel', e.target.value)} 
                                                    onFocus={() => { scrollToPreview(`preview-education-link-${edu._id || idx}`); handleSwitchToWeb(); }}
                                                    className="w-full p-2 bg-white border border-slate-300 rounded text-sm"
                                                >
                                                     <option value="">Texto del enlace...</option>
                                                     {LINK_OPTIONS.education.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <textarea value={edu.details} onChange={(e) => handleArrayChange('education', idx, 'details', e.target.value)} onFocus={() => scrollToPreview(`preview-education-details-${edu._id || idx}`)} placeholder="Detalles adicionales..." className="w-full p-2 bg-white border border-slate-300 rounded" rows={2}/>
                                        </div>
                                    </DraggableItem>
                                ))}
                            </Reorder.Group>
                        </div>

                        {/* FORMACIÓN CONTINUA */}
                        <div>
                             <div className="flex justify-between items-center mb-4 pt-4 border-t border-slate-200">
                                <h4 className="font-bold text-slate-700">Formación Continua</h4>
                                <button onClick={() => handleArrayItemAdd('continuousEducation', { title: 'Nuevo Curso/Habilidad', description: '' })} className="flex items-center gap-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full shadow hover:bg-blue-700 transition-colors">
                                <Plus size={14} /> Añadir
                                </button>
                            </div>

                            <Reorder.Group axis="y" values={formData.continuousEducation} onReorder={(newOrder) => handleReorder('continuousEducation', newOrder)}>
                                {formData.continuousEducation.map((item, idx) => (
                                    <DraggableItem 
                                        key={item._id}
                                        item={item}
                                        title={item.title}
                                        subtitle="Formación Continua"
                                        onDelete={() => handleArrayItemDelete('continuousEducation', idx)}
                                        onFocus={() => scrollToPreview(`preview-continuous-${item._id || idx}`)}
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Título / Logro</label>
                                                <input 
                                                    value={item.title} 
                                                    onChange={(e) => handleArrayChange('continuousEducation', idx, 'title', e.target.value)} 
                                                    onFocus={() => scrollToPreview(`preview-continuous-title-${item._id || idx}`)}
                                                    placeholder="Ej: Aprendizaje Constante" 
                                                    className="w-full p-2 bg-white border border-slate-300 rounded font-bold" 
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Descripción</label>
                                                <textarea 
                                                    value={item.description} 
                                                    onChange={(e) => handleArrayChange('continuousEducation', idx, 'description', e.target.value)} 
                                                    onFocus={() => scrollToPreview(`preview-continuous-description-${item._id || idx}`)}
                                                    placeholder="Descripción del aprendizaje..." 
                                                    className="w-full p-2 bg-white border border-slate-300 rounded" 
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </DraggableItem>
                                ))}
                            </Reorder.Group>
                        </div>
                    </Section>

                    {/* CONTACTO & FOOTER */}
                    <Section 
                        title="📞 Contacto" 
                        isOpen={openSection === 'contact'} 
                        toggle={() => setOpenSection(openSection === 'contact' ? '' : 'contact')} 
                        color="slate"
                        onFocus={() => scrollToPreview('preview-footer')}
                        isVisible={formData.sectionVisibility?.contact ?? true}
                        onToggleVisibility={() => handleChange('sectionVisibility', 'contact', !(formData.sectionVisibility?.contact ?? true))}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Título de Disponibilidad</label>
                                <input 
                                    value={formData.footer?.availabilityTitle || ''} 
                                    onChange={(e) => handleChange('footer', 'availabilityTitle', e.target.value)} 
                                    onFocus={() => scrollToPreview('preview-footer-availability-title')}
                                    placeholder="Disponible para oportunidades como"
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Descripción de Disponibilidad</label>
                                <textarea 
                                    value={formData.footer?.availabilityDescription || ''} 
                                    onChange={(e) => handleChange('footer', 'availabilityDescription', e.target.value)} 
                                    onFocus={() => scrollToPreview('preview-footer-availability-description')}
                                    placeholder="Estoy disponible para asumir nuevos retos..."
                                    rows={3}
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                />
                            </div>
                            
                            <div>
                                <h5 className="font-bold text-slate-700 mb-3 block border-t pt-4">Información de Contacto</h5>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email</label>
                                        <input 
                                             value={formData.footer?.email || ''} 
                                             onChange={(e) => handleChange('footer', 'email', e.target.value)} 
                                             onFocus={() => scrollToPreview('preview-footer-email')}
                                             placeholder={formData.profile?.email}
                                             className="w-full p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Teléfono</label>
                                        <input 
                                             value={formData.footer?.phone || ''} 
                                             onChange={(e) => handleChange('footer', 'phone', e.target.value)} 
                                             onFocus={() => scrollToPreview('preview-footer-phone')}
                                             placeholder={formData.profile?.phone}
                                             className="w-full p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ubicación</label>
                                        <input 
                                            value={formData.footer?.location || ''} 
                                            onChange={(e) => handleChange('footer', 'location', e.target.value)} 
                                            onFocus={() => scrollToPreview('preview-footer-location')}
                                            placeholder={formData.profile?.location}
                                            className="w-full p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Section>
                    </>
                )}

                </div>

                {/* RIGHT: Live Preview */}
                {previewMode && (
                    <div className="sticky top-20 lg:top-24 h-[calc(100vh-5rem)] lg:h-[calc(100vh-8rem)] w-full flex flex-col items-center justify-start bg-slate-100 p-2 md:p-6 rounded-3xl border-2 border-slate-200 border-dashed overflow-hidden">
                         
                         {/* FLOATING TOGGLE: Visible in Mobile/Desktop inside Preview Context */}
                         <div className="shrink-0 mb-4 z-40 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-full shadow-lg border border-slate-200 flex gap-1 scale-[0.85] sm:scale-100 origin-center ring-1 ring-black/5 relative">
                            <button
                                onClick={() => setPreviewType('mobile')}
                                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 ${
                                    previewType === 'mobile' 
                                    ? 'bg-slate-900 text-white shadow-md' 
                                    : 'text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" className="sm:w-[14px] sm:h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                                <span>Sitio Web</span>
                            </button>
                            <button
                                onClick={() => setPreviewType('pdf')}
                                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 ${
                                    previewType === 'pdf' 
                                    ? 'bg-slate-900 text-white shadow-md' 
                                    : 'text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                <FileText size={12} className="sm:w-[14px] sm:h-[14px]" />
                                <span>Hoja de Vida</span>
                            </button>
                         </div>

                         {previewType === 'mobile' ? (
                             <div className="flex-1 w-full max-w-[375px] border-[4px] sm:border-[8px] border-slate-800 rounded-[25px] sm:rounded-[35px] shadow-2xl bg-white flex flex-col overflow-hidden relative box-border ring-2 sm:ring-4 ring-slate-300 transform sm:scale-100 scale-[1] origin-top sm:origin-center">
                                {/* Notch / Speaker */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 sm:h-5 w-24 sm:w-32 bg-slate-800 rounded-b-xl z-30"></div>

                                {/* Status Bar Fake */}
                                <div className="bg-slate-50 px-4 sm:px-5 pt-2 sm:pt-3 pb-1 flex justify-between items-center text-[10px] font-medium text-slate-800 shrink-0 z-20 select-none">
                                    <span>9:41</span>
                                    <div className="flex gap-1.5 items-center">
                                        <div className="bg-slate-800 text-white rounded px-1 py-[1px] text-[8px] font-bold">5G</div>
                                        <div className="w-4 h-2.5 border border-slate-400 rounded-[1px] relative">
                                            <div className="absolute inset-[1px] bg-slate-800 w-[70%]"></div>
                                        </div>
                                    </div>
                                </div>
                            
                                <div className="flex-1 overflow-hidden bg-white relative w-full h-full">
                                    <Frame className="bg-white">
                                        <div className="w-full bg-slate-50 min-h-screen">
                                            <div id="preview-header"><Header customData={formData.header} customLabels={formData.labels} /></div>
                                            {(formData.sectionVisibility?.profile ?? true) && <div id="preview-hero"><Hero customData={formData.profile} customFullData={formData} customSectionVisibility={formData.sectionVisibility} /></div>}
                                            {(formData.sectionVisibility?.experience ?? true) && <div id="preview-experience"><Experience customData={formData.experience} customLabels={formData.labels} customSectionVisibility={formData.sectionVisibility} /></div>}
                                            {(formData.sectionVisibility?.projects ?? true) && <div id="preview-projects"><Projects customData={formData.projects} customLabels={formData.labels} customSectionVisibility={formData.sectionVisibility} /></div>}
                                            {(formData.sectionVisibility?.skills ?? true) && <div id="preview-skills"><Skills customData={formData.skills} customLabels={formData.labels} customSectionVisibility={formData.sectionVisibility} /></div>}
                                            {(formData.sectionVisibility?.education ?? true) && <div id="preview-education"><Education customData={formData.education} customContinuousData={formData.continuousEducation} customLabels={formData.labels} customSectionVisibility={formData.sectionVisibility} /></div>}
                                            {(formData.sectionVisibility?.contact ?? true) && <div id="preview-footer"><Footer customData={formData} customSectionVisibility={formData.sectionVisibility} /></div>}
                                        </div>
                                    </Frame>
                                </div>
                                
                                {/* Home Indicator */}
                                <div className="h-5 shrink-0 bg-white flex justify-center items-end pb-1.5 pointer-events-none z-20 absolute bottom-0 w-full left-0">
                                    <div className="w-32 h-1 bg-slate-900 rounded-full"></div>
                                </div>
                            </div>
                         ) : (
                            /* PDF PREVIEW MODE */
                            <div className="w-full h-full overflow-hidden flex flex-col items-center">
                                <div id="pdf-preview-scroll-container" className="w-full flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 flex justify-center scrollbar-hide">
                                    <DynamicPdfPage data={{
                                        ...formData,
                                        experience: (formData.sectionVisibility?.experience ?? true) ? formData.experience : [],
                                        projects: (formData.sectionVisibility?.projects ?? true) ? formData.projects : [],
                                        skills: (formData.sectionVisibility?.skills ?? true) ? formData.skills : { main: [], categories: {} },
                                        education: (formData.sectionVisibility?.education ?? true) ? formData.education : [],
                                        continuousEducation: (formData.sectionVisibility?.education ?? true) ? formData.continuousEducation : [], // Tied to education visibility usually
                                        // Profile and Footer handling could be more complex but typically:
                                        // If profile hidden, maybe only name? For now, we only hide "sections"
                                        // Footer contact info is usually part of 'contact' visibility.
                                        footer: (formData.sectionVisibility?.contact ?? true) ? formData.footer : { ...formData.footer, email: '', phone: '', location: '', availabilityTitle: '', availabilityDescription: '' }
                                    }} />
                                </div>
                            </div>
                         )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-[90%] sm:max-w-md overflow-hidden relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                            
                            <div className="p-5 sm:p-6 text-center">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-50 shadow-inner">
                                    <AlertTriangle size={28} className="sm:w-8 sm:h-8" />
                                </div>
                                
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 leading-tight">
                                    ¿Eliminar permanentemente?
                                </h3>
                                
                                <p className="text-sm sm:text-base text-slate-500 mb-6 leading-relaxed px-2">
                                    Esta acción eliminará el elemento de tu CV <span className="text-red-600 font-bold">para siempre</span>. No podrás recuperarlo.
                                </p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setDeleteTarget(null)}
                                        className="order-2 sm:order-1 w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm sm:text-base"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={confirmDelete}
                                        className="order-1 sm:order-2 w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-transform active:scale-95 text-sm sm:text-base flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        <span>Sí, Eliminar</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Confirm Delete Photo Modal */}
                {showDeletePhotoModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowDeletePhotoModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 text-center">
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                        <img src={formData.profile.photoURL} className="w-full h-full object-cover opacity-50 grayscale" alt="Delete Preview" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-2 rounded-full border-2 border-white shadow-sm">
                                        <Trash2 size={16} />
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-800 mb-2">¿Eliminar foto?</h3>
                                <p className="text-slate-500 text-sm mb-6">
                                    Tu perfil se quedará sin imagen. Puedes subir otra cuando quieras o dejarlo así.
                                </p>
                                
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setShowDeletePhotoModal(false)}
                                        className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={confirmImageDelete}
                                        className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-transform active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Image Cropper Modal */}
                {croppingImg && (
                    <ImageCropper 
                        imageSrc={croppingImg} 
                        onCancel={() => setCroppingImg(null)} 
                        onCropComplete={handleCropSave} 
                    />
                )}
            </AnimatePresence>

            {/* Hidden PDF Preview Render */}
            {formData && <CVPreview customData={formData} />}

            {/* Feedback Modal - Renderizado Condicional */}
            {isFeedbackOpen && (
                <FeedbackModal 
                    isOpen={isFeedbackOpen} 
                    onClose={() => setIsFeedbackOpen(false)} 
                    source="Admin"
                    userEmail={user?.email}
                />
            )}
        </div>
    );
};

export default Admin;