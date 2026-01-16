import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import FeedbackModal from './FeedbackModal';

const Footer = ({ customData, customSectionVisibility }) => {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const { profile: contextProfile, footer: contextFooter, sectionVisibility } = useData();
    
    // Logic to handle both legacy and new customData structure
    const activeProfile = customData?.name ? customData : (customData?.profile || contextProfile);
    const footer = customData?.footer ? customData.footer : contextFooter;

    if(!activeProfile) return null;
    // Determinar visibilidad efectiva (override desde Admin si está disponible)
    const effectiveVisibility = customSectionVisibility ?? sectionVisibility;
    // Ocultar sección si está desactivada
    if (effectiveVisibility && effectiveVisibility.contact === false) return null;

    // Use overrides from footer config if available, otherwise fallback to profile
    const displayEmail = footer?.email || activeProfile.email;
    const displayPhone = footer?.phone || activeProfile.phone;
    const displayLocation = footer?.location || activeProfile.location;

    return (
        <footer id="contact" className="bg-slate-900 text-slate-300 py-16">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 mb-12">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight" id="preview-footer-availability-title">
                            {footer?.availabilityTitle || "Disponible para oportunidades como"}<br/>
                            <span className="text-primary">{activeProfile.role}</span>
                        </h2>
                        <p className="text-lg text-slate-400 mb-8 max-w-md" id="preview-footer-availability-description">
                            {footer?.availabilityDescription || "Estoy disponible para asumir nuevos retos profesionales. Busco oportunidades donde pueda aportar valor inmediato y continuar creciendo."}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a
                                href={`https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${displayEmail}&su=Contacto%20desde%20Portafolio`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-colors text-center"
                            >
                                {footer?.buttonEmail || "Enviar Correo"}
                            </a>
                            <a
                                href={`https://wa.me/${displayPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-transparent border border-white/20 text-white rounded-lg font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={20} /> {footer?.buttonWhatsapp || "WhatsApp"}
                            </a>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <a 
                                href={`https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${displayEmail}&su=Contacto%20desde%20Portafolio`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-slate-800 rounded-lg text-primary hover:bg-slate-700 transition-colors"
                                aria-label="Enviar correo"
                            >
                                <Mail size={24} />
                            </a>
                            <div>
                                <p className="text-sm text-slate-500">Email</p>
                                <a 
                                    href={`https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${displayEmail}&su=Contacto%20desde%20Portafolio`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white hover:text-primary transition-colors block break-all"
                                    id="preview-footer-email"
                                >
                                    {displayEmail}
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-800 rounded-lg text-primary">
                                <Phone size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Teléfono</p>
                                <p className="text-white hover:text-primary transition-colors" id="preview-footer-phone">{displayPhone}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-800 rounded-lg text-primary">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Ubicación</p>
                                <p className="text-white" id="preview-footer-location">{displayLocation}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800">
                    {/* Primera línea: Copyright */}
                    <div className="text-center mb-3">
                        <p className="text-slate-500 text-sm">
                            © {new Date().getFullYear()} CV Profesional. Todos los derechos reservados.
                        </p>
                    </div>

                    {/* Segunda línea: Desarrollado con amor */}
                    <div className="text-center mb-3">
                        <p className="text-slate-600 text-xs">
                            Desarrollado con ❤️ por{' '}
                            <a 
                                href="https://curriculum-cv-profesional.web.app/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 transition-colors font-medium"
                            >
                                Juan Diego Archila León
                            </a>
                        </p>
                    </div>

                    {/* Tercera línea: Crea tu CV gratis */}
                    <div className="text-center mb-4">
                        <a 
                            href="https://curriculum-cv-profesional.web.app/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors text-sm font-semibold"
                        >
                            Crea tu CV gratis aquí
                        </a>
                    </div>

                    {/* Cuarta línea: Reportar error */}
                    <div className="text-center">
                        <button
                            onClick={() => setIsFeedbackOpen(true)}
                            className="text-slate-600 hover:text-slate-400 transition-colors text-xs underline"
                        >
                            Reportar error o enviar sugerencia
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Feedback Modal */}
            <FeedbackModal 
                isOpen={isFeedbackOpen} 
                onClose={() => setIsFeedbackOpen(false)} 
                source="PublicProfile"
            />
        </footer>
    );
};

export default Footer;
