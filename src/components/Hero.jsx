import React from 'react';
import { motion } from 'framer-motion';
import { Download, Linkedin, MessageCircle, Github, Mail, Globe, Twitter, Send, Phone } from 'lucide-react';
import { useData } from '../context/DataContext';
import { normalizeUrl } from '../utils/urlHelpers';


const Hero = ({ customData, customFullData, customSectionVisibility }) => {
  const {
    profile: contextProfile,
    experience: ctxExperience,
    projects: ctxProjects,
    skills: ctxSkills,
    education: ctxEducation,
    continuousEducation: ctxContinuousEducation,
    header: ctxHeader,
    footer: ctxFooter,
    theme: ctxTheme,
    labels: ctxLabels,
    sectionVisibility: ctxVisibility,
  } = useData();
    const profile = customData || contextProfile;
    const photoSrc = profile?.photoBase64 || profile?.photoURL;

  if (!profile) return null;
    // Determinar visibilidad efectiva (override desde Admin si está disponible)
    const effectiveVisibility = customSectionVisibility ?? ctxVisibility;
    // Ocultar sección si está desactivada
    if (effectiveVisibility && effectiveVisibility.profile === false) return null;


  // Usar la función global para descargar el PDF dinámico
  const handleDownloadPDF = () => {
    if (typeof window.handleDownloadCV === 'function') {
      // Usar customFullData si está disponible (datos editados en Admin), sino mergedData
      const dataToExport = customFullData || {
        profile: profile,
        experience: ctxExperience,
        projects: ctxProjects,
        skills: ctxSkills,
        education: ctxEducation,
        continuousEducation: ctxContinuousEducation,
        header: ctxHeader,
        footer: ctxFooter,
        theme: ctxTheme,
        labels: ctxLabels,
        sectionVisibility: customSectionVisibility ?? ctxVisibility,
      };

      window.handleDownloadCV(dataToExport);
    } else {
      alert('No se encontró la función de descarga de CV. Asegúrate de estar en el panel correcto.');
    }
  };

  const getStatusStyles = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('disponible') || s.includes('open')) return 'bg-green-50 text-green-700 border-green-200';
    if (s.includes('trabajando')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s.includes('freelance')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (s.includes('proyectos')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s.includes('desconectado')) return 'bg-slate-100 text-slate-500 border-slate-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getSocialConfig = (type) => {
      switch(type) {
          case 'github': return { icon: Github, label: 'GitHub', border: 'hover:border-slate-800', text: 'hover:text-slate-900' };
          case 'email': return { icon: Mail, label: 'Email', border: 'hover:border-red-500', text: 'hover:text-red-500' };
          case 'twitter': return { icon: Twitter, label: 'Twitter', border: 'hover:border-sky-500', text: 'hover:text-sky-500' };
          case 'globe': return { icon: Globe, label: 'Web', border: 'hover:border-indigo-500', text: 'hover:text-indigo-500' };
          case 'whatsapp': return { icon: MessageCircle, label: 'WhatsApp', border: 'hover:border-green-600', text: 'hover:text-green-600' };
          case 'telegram': return { icon: Send, label: 'Telegram', border: 'hover:border-sky-500', text: 'hover:text-sky-500' };
          case 'phone': return { icon: Phone, label: 'Llamar', border: 'hover:border-slate-800', text: 'hover:text-slate-900' };
          default: return { icon: Linkedin, label: 'LinkedIn', border: 'hover:border-blue-600', text: 'hover:text-blue-600' };
      }
  };

  const getMessagingConfig = (type) => {
      switch(type) {
          case 'telegram': return { icon: Send, label: 'Telegram', border: 'hover:border-sky-500', text: 'hover:text-sky-500' };
          case 'phone': return { icon: Phone, label: 'Llamar', border: 'hover:border-slate-800', text: 'hover:text-slate-900' };
          case 'linkedin': return { icon: Linkedin, label: 'LinkedIn', border: 'hover:border-blue-600', text: 'hover:text-blue-600' };
          case 'github': return { icon: Github, label: 'GitHub', border: 'hover:border-slate-800', text: 'hover:text-slate-900' };
          case 'email': return { icon: Mail, label: 'Email', border: 'hover:border-red-500', text: 'hover:text-red-500' };
          case 'twitter': return { icon: Twitter, label: 'Twitter', border: 'hover:border-sky-500', text: 'hover:text-sky-500' };
          case 'globe': return { icon: Globe, label: 'Web', border: 'hover:border-indigo-500', text: 'hover:text-indigo-500' };
          default: return { icon: MessageCircle, label: 'WhatsApp', border: 'hover:border-green-600', text: 'hover:text-green-600' };
      }
  };
  
  // Normalizar URLs para evitar rutas relativas (ahora usando helper compartido)
  const social = getSocialConfig(profile.socialType || 'linkedin');
  const messaging = getMessagingConfig(profile.messagingType || 'whatsapp');

  return (
    <section id="home" className="pt-20 pb-16 md:pt-28 md:pb-24 bg-white">
      <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
          >
            {/* 1. TOP HEADER: Full Width (Status, Name, Role) */}
            <div className="mb-8 text-left">
                <div className="flex items-center justify-start gap-3 mb-4">
                    <span id="preview-hero-status" className={`shrink-0 inline-block font-bold text-xs uppercase tracking-wide transition-colors duration-300 whitespace-nowrap border ${getStatusStyles(profile.status)} px-3 py-1 rounded-full`}>
                        {profile.status || 'Disponible'}
                    </span>
                    <span className="shrink-0 text-slate-300">•</span>
                    <span id="preview-hero-location" className="text-slate-400 text-sm font-medium truncate">
                        <span className="mr-1">📍</span> {profile.location}
                    </span>
                </div>

                <h1 id="preview-hero-name" className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight mb-2 break-words">
                    {profile.name}
                </h1>
                <span id="preview-hero-role" className="block text-xl sm:text-2xl md:text-3xl text-slate-500 font-medium whitespace-normal leading-snug">
                    {profile.role}
                </span>
            </div>

            {/* 2. BOTTOM CONTENT: Summary + Buttons (Left) & Photo (Right) */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start justify-between">
                 
                 {/* Left Column: Summary & Actions */}
                 <div className="flex-1 w-full md:w-auto">
                    {/* Only show 'about' if it's distict from summary and short (like a quote/tagline) */}
                    {profile.about && profile.about !== profile.summary && profile.about.length < 150 && (
                        <p id="preview-hero-about" className="text-xl md:text-2xl text-slate-800 font-semibold mb-6 italic leading-relaxed max-w-2xl">
                            "{profile.about}"
                        </p>
                    )}
                    <p id="preview-hero-summary" className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl">
                        {profile.summary}
                    </p>

                    {/* Photo (Mobile Only) */}
                    {photoSrc && (
                        <div className="flex md:hidden justify-center mb-8 w-full">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                                <div className="w-48 h-48 rounded-full overflow-hidden border-[8px] border-white shadow-2xl relative z-10 transition-transform duration-300 group-hover:scale-[1.02] bg-white">
                                    <img src={photoSrc} alt={profile.name} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <button 
                            onClick={(e) => {
                            e.preventDefault();
                            handleDownloadPDF();
                            }}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors w-full sm:w-auto order-1"
                        >
                            <Download size={20} />
                            Descargar CV
                        </button>

                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-2">
                            <a 
                            href={normalizeUrl(profile.linkedin)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 rounded-lg font-bold text-slate-700 transition-colors w-full sm:w-auto ${social.border} ${social.text}`}
                            id="preview-profile-button-primary"
                            >
                            <social.icon size={20} /> {social.label}
                            </a>

                            <a 
                            href={normalizeUrl(profile.whatsapp || "https://wa.me/573142749518")}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 rounded-lg font-bold text-slate-700 transition-colors w-full sm:w-auto ${messaging.border} ${messaging.text}`}
                            id="preview-profile-button-secondary"
                            >
                            <messaging.icon size={20} /> {messaging.label}
                            </a>
                        </div>
                    </div>
                 </div>

                 {/* Right Column: Photo (Desktop Only, larger & positioned) */}
                 <div className="hidden md:flex flex-1 justify-center items-start w-full relative">
                     <div className="relative group w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 lg:-mt-12">
                         {photoSrc && (
                             <>
                                <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                                <div className="w-full h-full rounded-full overflow-hidden border-[8px] border-white shadow-2xl relative z-10 transition-transform duration-300 group-hover:scale-[1.02] bg-white">
                                    <img src={photoSrc} alt={profile.name} className="w-full h-full object-cover" />
                                </div>
                             </>
                         )}
                     </div>
                 </div>
            </div>
          </motion.div>
      </div>
    </section>
  );
};

export default Hero;
