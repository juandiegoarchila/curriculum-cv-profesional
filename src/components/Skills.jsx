import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Code2, Database, Globe, Layout, LayoutTemplate, Server, Smartphone, Terminal, Cpu, Briefcase, UserCheck, Zap, GitBranch, Cloud } from 'lucide-react';
import { useData } from '../context/DataContext';

const iconMap = {
  Code2, Database, Globe, Layout, LayoutTemplate, Server, Smartphone, Terminal, Cpu, Briefcase, UserCheck, Zap, GitBranch, Cloud
};

const Skills = ({ customData, customLabels, customSectionVisibility }) => {
  const { skills: contextSkills, sectionVisibility, labels } = useData();
  const skills = customData || contextSkills;
  const activeLabels = customLabels || labels;
  // Mostrar automáticamente categorías por defecto
  const [showAll, setShowAll] = useState(true);
    
  if (!skills) return null;
  // Determinar visibilidad efectiva (override desde Admin si está disponible)
  const effectiveVisibility = customSectionVisibility ?? sectionVisibility;
  // Ocultar sección si está desactivada
  if (effectiveVisibility && effectiveVisibility.skills === false) return null;

  return (
    <section id="skills" className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-3xl font-bold text-slate-900 mb-4" id="preview-skills-title">{activeLabels?.sections?.skills || 'Stack Técnico'}</h2>
          <div className="w-20 h-1 bg-primary rounded-full mx-auto md:mx-0"></div>
        </div>

        {/* Main Skills (Visible by default) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {skills.main && Array.isArray(skills.main) && skills.main.map((skill, index) => {
            // Manejar tanto string (desde DB) como objeto (legacy data.js)
            const Icon = typeof skill.icon === 'string' ? (iconMap[skill.icon] || Code2) : skill.icon;
            
            return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-primary hover:shadow-md transition-all"
              id={`preview-skills-main-${index}`}
            >
              <div className="text-primary mb-3">
                <Icon size={32} />
              </div>
              <span className="font-semibold text-slate-700">{skill.name}</span>
            </motion.div>
          )})}
        </div>

        {/* Toggle Button */}
        <div className="text-center">
            <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:text-primary transition-all shadow-sm"
            >
                {showAll ? (
                    <>
                        <ChevronUp size={20} /> Ocultar detalles
                    </>
                ) : (
                    <>
                        <ChevronDown size={20} /> Ver todo el stack
                    </>
                )}
            </button>
        </div>

        {/* Hidden Skills */}
        <AnimatePresence>
            {showAll && skills.categories && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="grid md:grid-cols-4 gap-8 mt-12 pt-8 border-t border-slate-200">
                        {Object.entries(skills.categories).map(([category, items], idx) => {
                            const validItems = Array.isArray(items) ? items.filter(item => item && item.trim()) : [];
                            // Si no hay items válidos, no renderizar esta columna
                            if (validItems.length === 0) return null;
                            
                            return (
                                <div key={idx} id={`preview-skills-category-${category}`}>
                                    <h3 className="font-bold text-slate-900 capitalize mb-4">{category === 'habilidades' ? 'Habilidades Blandas' : category}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {validItems.map((item, i) => (
                                            <span key={i} className="px-3 py-1 bg-white text-slate-600 text-sm border border-slate-100 rounded-md">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Skills;
