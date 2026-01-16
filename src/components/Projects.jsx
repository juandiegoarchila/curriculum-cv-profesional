import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, ArrowRight, Star, TrendingUp, Users, Zap, Layout, Globe, BarChart3, ShoppingCart } from 'lucide-react';
import { useData } from '../context/DataContext';
import { normalizeUrl } from '../utils/urlHelpers';

const iconMap = {
  TrendingUp, Users, Zap, Layout, Globe, BarChart3, ShoppingCart, Star
};

const Projects = ({ customData, customLabels, customSectionVisibility }) => {
  const { projects: contextProjects, sectionVisibility, labels } = useData();
  const projects = customData || contextProjects;
  const activeLabels = customLabels || labels;
  if (!projects) return null;
  // Determinar visibilidad efectiva (override desde Admin si está disponible)
  const effectiveVisibility = customSectionVisibility ?? sectionVisibility;
  // Ocultar sección si está desactivada
  if (effectiveVisibility && effectiveVisibility.projects === false) return null;

  const featuredProjects = projects.filter(p => p.featured || p.role === 'Proyecto Destacado');
  const otherProjects = projects.filter(p => !p.featured && p.role !== 'Proyecto Destacado');

  return (
    <section id="projects" className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4" id="preview-projects-title">{activeLabels?.sections?.projects || 'Proyectos Reales'}</h2>
          <div className="w-20 h-1 bg-primary rounded-full"></div>
        </div>

        {/* Featured Projects */}
        <div className="space-y-12 mb-16">
          {featuredProjects.map((project, index) => (
            <motion.div
              id={project._id ? `preview-project-${project._id}` : `preview-project-featured-${index}`}
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 lg:flex"
            >
              <div className="p-8 lg:p-12 lg:w-2/3">
                <div className="flex items-center gap-3 mb-4">
                  {(project.showFeaturedBadge !== false) && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Star size={12} fill="currentColor" /> Proyecto Destacado
                    </span>
                  )}
                </div>
                
                <h3 className="text-3xl font-bold text-slate-900 mb-4" id={`preview-project-title-${project._id || project.id}`}>{project.title}</h3>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed" id={`preview-project-description-${project._id || project.id}`}>
                  {project.description}
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-8" id={`preview-project-features-${project._id || project.id}`}>
                  {project.features.filter(f => f && f.trim()).map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 p-1 bg-green-100 text-green-700 rounded-full">
                        <ArrowRight size={14} />
                      </div>
                      <span className="text-slate-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-8" id={`preview-project-tech-${project._id || project.id}`}>
                  {project.tech.filter(t => t && t.trim()).map((t, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-sm font-medium mr-2">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4">
                    <a 
                      href={normalizeUrl(project.link)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                      id={`preview-project-link-${project._id || project.id}`}
                    >
                      <ExternalLink size={18} /> <span id={`preview-project-button-${project._id || project.id}`}>{project.linkLabel || 'Ver Proyecto'}</span>
                    </a>
                </div>
              </div>
              
              {/* Stats Section with Dynamic Data */}
              {project.stats && (
                <div className="bg-slate-50 lg:w-1/3 min-h-[300px] relative overflow-hidden flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-200 group" id={`preview-project-stats-${project._id || project.id}`}>
                   
                   {/* Background Decorative Icon */}
                   {project.stats.icon && (
                        <div className={`absolute inset-0 flex items-center justify-center transform transition-transform duration-700 group-hover:scale-105 pointer-events-none select-none ${
                            !project.stats.value && !project.stats.label ? 'text-slate-400 opacity-100' : 'text-slate-300/50'
                        }`}>
                           {(() => {
                               const Icon = iconMap[project.stats.icon] || Star;
                               // Si no hay texto, el icono es el protagonista (centrado, sin rotar tanto, o estilo cover)
                               // Si hay texto, es decorativo (rotado, grande)
                               const isIconOnly = !project.stats.value && !project.stats.label;
                               
                               return <Icon 
                                    className={`
                                        ${isIconOnly ? 'w-[60%] h-[60%] opacity-80' : 'w-[120%] h-[120%] -rotate-12'} 
                                        transition-all duration-500
                                    `} 
                                    strokeWidth={isIconOnly ? 1 : 0.5} 
                                />; 
                           })()}
                        </div>
                   )}

                   {(project.stats.value || project.stats.label) && (
                       <div className="text-center p-8 flex flex-col items-center relative z-10 w-full transition-opacity duration-300">
                          {project.stats.value && (
                              <span className="block text-6xl lg:text-8xl font-black text-slate-800 mb-2 tracking-tighter drop-shadow-sm leading-none">
                                  {project.stats.value}
                              </span>
                          )}
                          {project.stats.label && (
                              <span className="text-slate-600 font-bold uppercase tracking-[0.2em] text-sm lg:text-base">
                                {project.stats.label}
                              </span>
                          )}
                       </div>
                   )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Other Projects */}
        {otherProjects.length > 0 && (
        <div className="grid md:grid-cols-2 gap-8">
          {otherProjects.map((project, index) => (
            <motion.div
              id={project._id ? `preview-project-${project._id}` : `preview-project-other-${index}`}
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-slate-100/80 hover:border-slate-200 transition-all flex flex-col"
            >
              <div className="mb-4">
                  {(project.showFeaturedBadge !== false) && (
                    <span className="inline-flex px-3 py-1 mb-3 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider items-center gap-1 border border-blue-100">
                        <Star size={10} fill="currentColor" /> Proyecto Destacado
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-slate-900">{project.title}</h3>
              </div>
              
              <p className="text-slate-600 mb-6 text-sm flex-grow">{project.description}</p>
              
              <ul className="space-y-2 mb-6">
                {project.features.map((feature, i) => (
                   <li key={i} className="text-slate-500 text-sm flex items-start gap-2">
                     <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-2 shrink-0"></span>
                     {feature}
                   </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2">
                 {project.tech.map((t, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-50 text-slate-500 rounded text-xs">
                      {t}
                    </span>
                 ))}
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
