import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Github, Linkedin, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

import { useData } from '../context/DataContext';

const Header = ({ customData, customLabels }) => {
  const { header: contextHeader, sectionVisibility, labels } = useData();
  const header = customData || contextHeader;
  const activeLabels = customLabels || labels;

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const headerRef = useRef(null);


  useEffect(() => {
    // Detectar el contexto de la ventana (Main window o Iframe)
    const currentWindow = headerRef.current?.ownerDocument?.defaultView || window;

    const handleScroll = () => {
      setScrolled(currentWindow.scrollY > 20);
    };

    const handleResize = () => {
         if (headerRef.current) {
             // Si el ancho del componente es menor a 768px, activar modo móvil
             // Esto ayuda a que el Preview en el Admin se vea como móvil si es angosto
             setIsMobile(headerRef.current.offsetWidth < 768);
         }
    };

    currentWindow.addEventListener('scroll', handleScroll);
    currentWindow.addEventListener('resize', handleResize);
    
    // Configurar ResizeObserver para detectar cambios en el tamaño del contenedor (útil para el preview)
    const resizeObserver = new ResizeObserver(handleResize);
    if (headerRef.current) {
        resizeObserver.observe(headerRef.current);
    }

    // Chequeo inicial
    handleScroll();
    handleResize();

    return () => {
        currentWindow.removeEventListener('scroll', handleScroll);
        currentWindow.removeEventListener('resize', handleResize);
        resizeObserver.disconnect();
    };
  }, []);

  // Filtrar enlaces según visibilidad de secciones
  const rawLinks = [
    { name: activeLabels?.nav?.home || 'Inicio', href: '#home', key: 'profile', id: 'preview-header-nav-home' },
    { name: activeLabels?.nav?.experience || 'Experiencia', href: '#experience', key: 'experience', id: 'preview-header-nav-experience' },
    { name: activeLabels?.nav?.projects || 'Proyectos', href: '#projects', key: 'projects', id: 'preview-header-nav-projects' },
    { name: activeLabels?.nav?.skills || 'Habilidades', href: '#skills', key: 'skills', id: 'preview-header-nav-skills' },
    { name: activeLabels?.nav?.contact || 'Contacto', href: '#contact', key: 'contact', id: 'preview-header-nav-contact' },
  ];
  const navLinks = rawLinks.filter(l => (sectionVisibility?.[l.key] ?? true));

  return (
    <header ref={headerRef} className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <a href="#" className="text-2xl font-bold text-slate-900">
            {/* Si el titulo es el default 'JD.Portafolio' o variantes, no mostrarlo si el usuario quiere 'limpiar' su marca */}
            {/* Simplemente renderizamos lo que venga en header.title, pero permitimos override */}
            <span id="preview-header-title">{header?.title || ''}</span>
        </a>

        {/* Desktop Menu - Condicional basado en el ancho real del componente */}
        {!isMobile && (
            <nav className="flex items-center space-x-8">
            {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="text-slate-600 hover:text-primary font-medium transition-colors mx-2" id={link.id}>
                  {link.name}
                </a>
            ))}
            </nav>
        )}

        {/* Mobile Menu Button - Se muestra si detectamos ancho móvil */}
        {isMobile && (
            <button className="text-slate-700" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
        )}

        {/* Mobile Menu Dropdown */}
        {isOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 w-full bg-white shadow-lg py-8 px-6 flex flex-col space-y-4"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-lg font-medium text-slate-700"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;

