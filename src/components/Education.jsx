import React from 'react';
import { GraduationCap, Trophy } from 'lucide-react';
import { useData } from '../context/DataContext';

const Education = ({ customData, customContinuousData, customLabels, customSectionVisibility }) => {
  const { education: contextEducation, continuousEducation: contextContinuous, sectionVisibility, labels } = useData();
  const education = customData || contextEducation;
  const continuousEducation = customContinuousData || contextContinuous;
  const activeLabels = customLabels || labels;

  if (!education) return null;
  // Determinar visibilidad efectiva (override desde Admin si está disponible)
  const effectiveVisibility = customSectionVisibility ?? sectionVisibility;
  // Ocultar sección si está desactivada
  if (effectiveVisibility && effectiveVisibility.education === false) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Education Column */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3" id="preview-education-title">
                <GraduationCap className="text-primary" />
                {activeLabels?.sections?.education || 'Formación Académica'}
              </h2>
            </div>
            
            <div className="space-y-6">
              {education.map((edu, index) => (
                <div 
                    key={index} 
                    id={edu._id ? `preview-education-${edu._id}` : `preview-education-${index}`}
                    className="bg-slate-50 p-6 rounded-2xl border border-slate-100"
                >
                  <h3 className="text-lg font-bold text-slate-900" id={`preview-education-degree-${edu._id || index}`}>{edu.degree}</h3>
                  <p className="text-primary font-medium mb-2" id={`preview-education-institution-${edu._id || index}`}>{edu.institution}</p>
                  <p className="text-slate-500 text-sm mb-4" id={`preview-education-period-${edu._id || index}`}>{edu.period || edu.year} • <span id={`preview-education-location-${edu._id || index}`}>{edu.location}</span></p>
                  <p className="text-slate-600 text-sm" id={`preview-education-details-${edu._id || index}`}>{edu.details}</p>
                  
                  {edu.link && (
                    <div className="mt-3">
                        <a 
                            href={edu.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wide"
                            id={`preview-education-link-${edu._id || index}`}
                        >
                            {edu.linkLabel || 'Ver Credencial'} <span className="text-lg">›</span>
                        </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Continuous Learning (Dynamic) */}
          <div className="md:col-span-2 lg:col-span-1">
             <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3" id="preview-continuous-title">
                <Trophy className="text-primary" />
                {activeLabels?.sections?.continuous || 'Formación Continua'}
              </h2>
            </div>
            
            <div className="h-full space-y-6">
               {(continuousEducation || []).map((item, index) => (
                 <div 
                    key={index} 
                    id={item._id ? `preview-continuous-${item._id}` : `preview-continuous-${index}`}
                    className="bg-blue-50 p-8 rounded-2xl border border-blue-100"
                >
                    <p className="text-blue-900 font-medium text-lg mb-4" id={`preview-continuous-title-${item._id || index}`}>{item.title}</p>
                    <p className="text-blue-700 leading-relaxed" id={`preview-continuous-description-${item._id || index}`}>
                        {item.description}
                    </p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Education;
