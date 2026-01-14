import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe, MessageCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

const Footer = ({ customData, customSectionVisibility }) => {
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

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        {footer?.copyrightText || `© ${new Date().getFullYear()} ${activeProfile.name}. Todos los derechos reservados.`}
                    </p>
                    <div className="flex gap-6">
                        <a href={activeProfile.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                            <Linkedin size={20} />
                        </a>
                        <a href={activeProfile.website} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                            <Globe size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
