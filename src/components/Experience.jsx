import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useData } from '../context/DataContext';
import { normalizeUrl } from '../utils/urlHelpers';

const Experience = ({ customData, customLabels, customSectionVisibility }) => {
  const { experience: contextExperience, sectionVisibility, labels } = useData();
  const experience = customData || contextExperience;
  const activeLabels = customLabels || labels;
  if (!experience) return null;
  // Determinar visibilidad efectiva (override desde Admin si está disponible)
  const effectiveVisibility = customSectionVisibility ?? sectionVisibility;
  // Ocultar sección si está desactivada
  if (effectiveVisibility && effectiveVisibility.experience === false) return null;

  return (
    <section id="experience" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4" id="preview-experience-title">{activeLabels?.sections?.experience || 'Experiencia Profesional'}</h2>
          <div className="w-20 h-1 bg-primary rounded-full"></div>
        </div>

        <div className="space-y-8">
          {experience.map((job, index) => (
            <JobCard key={index} job={job} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const JobCard = ({ job, index }) => {
  // Abrir automáticamente si hay detalles
  const [isOpen, setIsOpen] = useState(job.details && job.details.filter(item => item && item.trim()).length > 0);

  return (
    <motion.div 
      id={job._id ? `preview-experience-${job._id}` : `preview-experience-${index}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-0"
    >
      <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-all duration-300">
        <div className="md:flex justify-between items-start mb-6">
          <div>
            <h3 id={`preview-exp-role-${job._id || index}`} className="text-xl font-bold text-slate-900">{job.role}</h3>
            <h4 id={`preview-exp-company-${job._id || index}`} className="text-primary font-medium text-lg">{job.company}</h4>
          </div>
          <div className="md:text-right mt-2 md:mt-0 text-slate-500 text-sm">
            <div className="flex items-center gap-2 md:justify-end">
              <Calendar size={16} />
              <span id={`preview-exp-period-${job._id || index}`}>{job.period}</span>
            </div>
            <div className="flex items-center gap-2 md:justify-end mt-1">
              <MapPin size={16} />
              <span id={`preview-exp-location-${job._id || index}`}>{job.location}</span>
            </div>
          </div>
        </div>

        <p id={`preview-exp-description-${job._id || index}`} className="text-slate-700 font-medium mb-4 italic border-l-4 border-slate-300 pl-4">
          {job.description}
        </p>

        <ul className="space-y-3 mb-6" id={`preview-exp-achievements-${job._id || index}`}>
          {job.summary && Array.isArray(job.summary) && job.summary.filter(item => item && item.trim()).map((item, i) => (
            <li key={i} className="text-slate-600 flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {job.details && Array.isArray(job.details) && job.details.filter(item => item && item.trim()).length > 0 && (
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <ul className="space-y-3 pt-2 pb-4 border-t border-slate-200 mt-4" id={`preview-exp-details-${job._id || index}`}>
                  {job.details.filter(item => item && item.trim()).map((item, i) => (
                    <li key={i} className="text-slate-500 flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        
        {/* Conocimientos / Tech Stack */}
         {job.tech && job.tech.filter(t => t && t.trim()).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4" id={`preview-exp-tech-${job._id || index}`}>
               {job.tech.filter(t => t && t.trim()).map((t, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200 font-medium">
                    {t}
                  </span>
               ))}
            </div>
        )}

        <div className="flex flex-wrap gap-4 mt-2">
            {job.details && job.details.filter(item => item && item.trim()).length > 0 && (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
                >
                  {isOpen ? (
                    <>
                      <ChevronUp size={16} /> Ver menos detalles
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} /> Ver más detalles
                    </>
                  )}
                </button>
            )}

            {job.link && (
                <a 
                    href={normalizeUrl(job.link)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                    id={`preview-exp-link-${job._id || index}`}
                >
                    <ExternalLink size={16} /> {job.linkLabel || 'Visitar sitio web'}
                </a>
            )}
        </div>
      </div>
    </motion.div>
  );
};

export default Experience;
