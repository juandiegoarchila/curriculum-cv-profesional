import React from 'react';
import ReactDOM from 'react-dom';
import { useData } from '../context/DataContext';

export const CVContent = ({ data }) => {
    const { profile, experience, skills, education, continuousEducation, projects, footer, theme, labels, sectionVisibility } = data;

    const photoSrc = profile?.photoBase64 || profile?.photoURL;

  if(!profile) return null;

  // Theme Defaults
  const { font = 'Arimo', color = '#0f172a', template = 'new-york' } = theme || {};

  const fontMap = {
      Inter: "'Inter', sans-serif",
      Roboto: "'Roboto', sans-serif",
      Arimo: "'Arimo', sans-serif",
      Lora: "'Lora', serif",
      Merriweather: "'Merriweather', serif",
      'Open Sans': "'Open Sans', sans-serif",
      Lato: "'Lato', sans-serif",
      Montserrat: "'Montserrat', sans-serif",
      'PT Sans': "'PT Sans', sans-serif",
      'Source Sans 3': "'Source Sans 3', sans-serif",
      'EB Garamond': "'EB Garamond', serif",
      'Playfair Display': "'Playfair Display', serif",
      Bitter: "'Bitter', serif",
  };
  const fontFamily = fontMap[font] || "Arial, sans-serif";

    // Helper: visibilidad por sección
    const isVisible = (key) => {
        const vis = (sectionVisibility || {})[key];
        console.log(`isVisible(${key}):`, vis, '!== false:', vis !== false);
        return vis !== false;
    };

    // Data Normalization for Contact Info (Priority: Footer > Profile, but when contact is hidden, blank)
    const contactEmail = (sectionVisibility?.contact === false) ? '' : (footer?.email || profile.email || '');
    const contactPhone = (sectionVisibility?.contact === false) ? '' : (footer?.phone || profile.phone || '');
    const contactLocation = (sectionVisibility?.contact === false) ? '' : (footer?.location || profile.location || '');

    // If all sections are hidden, render nothing (blank CV)
    const allHidden = ['profile','experience','projects','skills','education','contact'].every(k => sectionVisibility?.[k] === false);
    if (allHidden) return null;

  const getAllSkills = () => {
    const main = (skills.main || []).map(s => typeof s === 'string' ? s : s.name);
    const cats = Object.values(skills.categories || {}).flat();
    return [...new Set([...main, ...cats])].join(', ');
  };

    // Labels defaults and helper
    const defaultLabels = {
        profile: 'Perfil Profesional',
        skills: 'Stack Técnico',
        experience: 'Experiencia Profesional',
        education: 'Educación',
        contact: 'Contacto'
    };
    const sectionLabel = (key, opts = {}) => {
            const base = labels?.sections?.[key] || defaultLabels[key] || key;
            if (opts.upper) return (base || '').toUpperCase();
            return base;
    };

    // Helper: Extras por empleo (link y tech)
    const renderJobExtras = (job, idx) => {
        const jid = job._id || idx;
        const hasTech = Array.isArray(job.tech) && job.tech.filter(t => t && t.trim()).length > 0;
        if (!hasTech) return null;
        return (
            <div style={{ marginTop: '2mm' }}>
                <div className="cv-text" id={`preview-exp-tech-${jid}`}>{job.tech.filter(t => t && t.trim()).join(', ')}</div>
            </div>
        );
    };

    // Helper: Projects Section (Generic for all templates)
    const renderProjectsSection = () => {
        if (!isVisible('projects')) return null;
        const list = Array.isArray(projects) ? projects : [];
        if (!list.length) return null;
        return (
            <div className="cv-section">
                <h3 className="cv-section-title" id="preview-projects-title">{labels?.sections?.projects || 'Proyectos Reales'}</h3>
                {list.map((p, idx) => {
                    const pid = p._id || p.id || idx;
                    return (
                        <div key={pid} className="cv-job" style={{ marginBottom: '4mm' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <h4 className="cv-company" id={`preview-project-title-${pid}`}>{p.title}</h4>
                                {p.stats && (p.stats.value || p.stats.label) && (
                                    <span className="cv-meta" id={`preview-project-stats-${pid}`}>{p.stats.value ? `${p.stats.value}` : ''}{p.stats.label ? ` ${p.stats.label}` : ''}</span>
                                )}
                            </div>
                            {p.description && (
                                <p className="cv-text" id={`preview-project-description-${pid}`}>{p.description}</p>
                            )}
                            {Array.isArray(p.features) && p.features.filter(f => f && f.trim()).length > 0 && (
                                <ul className="cv-list" id={`preview-project-features-${pid}`}>
                                    {p.features.filter(f => f && f.trim()).map((f, i) => <li key={i}>{f}</li>)}
                                </ul>
                            )}
                            {Array.isArray(p.tech) && p.tech.filter(t => t && t.trim()).length > 0 && (
                                <div className="cv-text" id={`preview-project-tech-${pid}`}>{p.tech.filter(t => t && t.trim()).join(', ')}</div>
                            )}
                            {/* En CV (ATS) omitimos CTA 'Ver Proyecto' */}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Helper: Continuous Education Section
    const renderContinuousSection = () => {
        const list = Array.isArray(continuousEducation) ? continuousEducation : [];
        if (!list.length) return null;
        return (
            <div className="cv-section">
                <h3 className="cv-section-title" id="preview-continuous-title">{labels?.sections?.continuous || 'Formación Continua'}</h3>
                {list.map((item, idx) => {
                    const cid = item._id || idx;
                    return (
                        <div key={cid} className="cv-job" style={{ marginBottom: '3mm' }}>
                            <div className="cv-company" id={`preview-continuous-title-${cid}`}>{item.title}</div>
                            <p className="cv-text" id={`preview-continuous-description-${cid}`}>{item.description}</p>
                        </div>
                    );
                })}
            </div>
        );
    };


    // --- TEMPLATE RENDERERS ---

  // 1. NEW YORK (Modern Standard) - Current Default
  // Left aligned header, standard sections
  const renderNewYork = () => (
      <>
          {/* Header */}
          <div className="cv-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6mm' }}>
             <div style={{ flex: 1, paddingRight: '4mm' }}>
                {isVisible('profile') && (
                    <>
                        <h1 className="cv-name" id="preview-hero-name" style={{ lineHeight: '1.1', marginBottom: '2mm' }}>{profile.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h2 className="cv-role" id="preview-hero-role" style={{ margin: 0, fontSize: '11pt', fontWeight: '600' }}>{profile.role}</h2>
                            {isVisible('contact') && contactLocation && (
                                <span id="preview-hero-location" style={{ fontSize: '11pt', color: '#666' }}>• {contactLocation}</span>
                            )}
                        </div>
                    </>
                )}
             </div>
             {photoSrc && (
                <div style={{ width: '30mm', height: '30mm', overflow: 'hidden', borderRadius: '4mm', flexShrink: 0, border: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
                    {/* Eliminamos crossOrigin para evitar bloqueo en visualización web si no hay headers CORS configurados */}
                    <img 
                        src={photoSrc} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                        alt="Foto"
                    />
                </div>
             )}
          </div>
                {isVisible('contact') && (
                        <div className="cv-contact-grid">
                            <div id="preview-footer-email"><strong>Email:</strong> {contactEmail}</div>
                            <div id="preview-footer-phone"><strong>Tel:</strong> {contactPhone}</div>
                            <div id="preview-footer-location"><strong>Loc:</strong> {contactLocation}</div>
                            {profile.linkedin && <div><strong>IN:</strong> {profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</div>}
                        </div>
                )}

          <hr className="cv-divider" />

          {/* Body */}
                    {isVisible('profile') && (
                            <div className="cv-section">
                                <h3 className="cv-section-title">{sectionLabel('profile')}</h3>
                                <p className="cv-text" id="preview-hero-summary">{profile.summary}</p>
                            </div>
                    )}

                    {isVisible('skills') && (
                        <div className="cv-section">
                            <h3 className="cv-section-title" id="preview-skills-title">{sectionLabel('skills')}</h3>
                            <div className="cv-text" id="preview-skills-list" style={{ fontSize: '10pt' }}>{getAllSkills()}</div>
                        </div>
                    )}

          {isVisible('experience') && (
              <div className="cv-section">
                  <h3 className="cv-section-title" id="preview-experience-title">{sectionLabel('experience')}</h3>
                  <div className="cv-jobs">
                      {experience.map((job, index) => (
                          <div key={index} className="cv-job">
                              <div className="cv-job-header">
                                  <h4 className="cv-company" id={`preview-exp-company-${job._id || index}`}>{job.company}</h4>
                                  <span className="cv-meta" id={`preview-exp-period-${job._id || index}`}>{job.period}</span>
                              </div>
                              <div className="cv-job-subheader">
                                  <span className="cv-job-role" id={`preview-exp-role-${job._id || index}`}>{job.role}</span>
                                  <span className="cv-meta-loc" id={`preview-exp-location-${job._id || index}`}>{job.location}</span>
                              </div>
                              {job.description && <p className="cv-text" id={`preview-exp-description-${job._id || index}`} style={{ marginBottom: '4px', fontStyle: 'italic' }}>{job.description}</p>}
                              {Array.isArray(job.summary) && job.summary.filter(line => line && line.trim()).length > 0 && (
                                  <ul className="cv-list" id={`preview-exp-achievements-${job._id || index}`}>
                                      {job.summary.filter(line => line && line.trim()).map((point, i) => <li key={i}>{point}</li>)}
                                  </ul>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {isVisible('education') && (
                        <div className="cv-section">
                            <h3 className="cv-section-title" id="preview-education-title">{sectionLabel('education')}</h3>
                            {education.map((edu, index) => (
                                <div key={index} style={{ marginBottom: '6px' }}>
                          <div className="cv-job-header">
                              <h4 className="cv-institution" id={`preview-education-institution-${edu._id || index}`}>{edu.institution}</h4>
                              <span className="cv-meta" id={`preview-education-period-${edu._id || index}`}>{edu.period}</span>
                          </div>
                          <p className="cv-degree" id={`preview-education-degree-${edu._id || index}`}>{edu.degree}</p>
                          {edu.location && (
                              <div className="cv-meta" id={`preview-education-location-${edu._id || index}`}>{edu.location}</div>
                          )}
                          {edu.details && (
                              <p className="cv-text" id={`preview-education-details-${edu._id || index}`}>{edu.details}</p>
                          )}
                          {edu.link && (
                              <div style={{ fontSize: '9pt', marginTop: '1mm' }}>
                                  <span id={`preview-education-link-${edu._id || index}`}>{edu.linkLabel || 'Ver Credencial'}</span>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          )}
      </>
  );

  // 2. PARIS (Elegant Centered)
  // Centered header, serif vibe, very clean
  const renderParis = () => (
      <>
         <div style={{ textAlign: 'center', marginBottom: '6mm' }}>
             {photoSrc && (
                <div style={{ width: '28mm', height: '28mm', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 4mm auto', border: '1px solid #eee' }}>
                    <img src={photoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                </div>
             )}
             <h1 className="cv-name" id="preview-hero-name" style={{ fontSize: '22pt', marginBottom: '2mm' }}>{profile.name}</h1>
             <p className="cv-role" id="preview-hero-role" style={{ fontSize: '11pt', justifyContent: 'center', display: 'flex', gap: '8px', color: '#555', textTransform: 'uppercase', letterSpacing: '2px' }}>
                 {profile.role}
             </p>
             <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '9pt', color: '#666', marginTop: '2mm' }}>
                 <span id="preview-footer-email">{contactEmail}</span>
                 <span>|</span>
                 <span id="preview-footer-phone">{contactPhone}</span>
                 <span>|</span>
                 <span id="preview-footer-location">{contactLocation}</span>
             </div>
         </div>
         {/* Sections */}
         {isVisible('profile') && (
             <div className="cv-section" style={{ textAlign: 'center' }}>
                 <h3 className="cv-section-title" style={{ border: 'none', textAlign: 'center', fontSize: '12pt', letterSpacing: '3px', marginBottom: '3mm' }}>{sectionLabel('profile')}</h3>
                 <p className="cv-text" id="preview-hero-summary">{profile.summary}</p>
             </div>
         )}
         {isVisible('skills') && (
             <div className="cv-section" style={{ textAlign: 'center' }}>
                 <h3 className="cv-section-title" style={{ border: 'none', textAlign: 'center', fontSize: '12pt', letterSpacing: '3px', marginBottom: '3mm' }}>{sectionLabel('skills')}</h3>
                 <p className="cv-text" id="preview-skills-list">{getAllSkills()}</p>
             </div>
         )}

            {isVisible('experience') && (
              <div className="cv-section">
                <h3 className="cv-section-title" style={{ border: 'none', textAlign: 'center', fontSize: '12pt', letterSpacing: '3px', marginBottom: '3mm' }}>{sectionLabel('experience')}</h3>
                {experience.map((job, index) => (
                <div key={index} className="cv-job" style={{ marginBottom: '6mm' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1mm' }}>
                         <h4 className="cv-company" id={`preview-exp-company-${job._id || index}`} style={{ fontSize: '12pt' }}>{job.company}</h4>
                         <div style={{ fontStyle: 'italic', fontSize: '10pt', color: '#444' }} id={`preview-exp-role-${job._id || index}`}>{job.role}</div>
                         <div style={{ fontSize: '9pt', color: '#888' }}><span id={`preview-exp-period-${job._id || index}`}>{job.period}</span> • <span id={`preview-exp-location-${job._id || index}`}>{job.location}</span></div>
                    </div>
                                        {job.description && (
                                            <p className="cv-text" id={`preview-exp-description-${job._id || index}`} style={{ marginBottom: '3mm', fontStyle: 'italic', textAlign: 'center' }}>{job.description}</p>
                                        )}
                                        {Array.isArray(job.summary) && job.summary.filter(line => line && line.trim()).length > 0 && (
                                            <ul className="cv-list" id={`preview-exp-achievements-${job._id || index}`} style={{ maxWidth: '90%', margin: '0 auto' }}>
                                                    {job.summary.filter(line => line && line.trim()).map((point, i) => <li key={i}>{point}</li>)}
                                            </ul>
                                        )}
                </div>
                        ))}
                     </div>
                 )}
      </>
  );
  
  // 3. TORONTO (Bold Side Border)
  // Left border on titles, modern clean look
  const renderToronto = () => (
      <>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm' }}>
             <div style={{ borderLeft: `5px solid ${color}`, paddingLeft: '5mm', flex: 1 }}>
                <h1 className="cv-name" id="preview-hero-name" style={{ lineHeight: '1' }}>{profile.name}</h1>
                <h2 className="cv-role" id="preview-hero-role" style={{ marginTop: '2mm', fontSize: '12pt', color: '#555' }}>{profile.role}</h2>
                {isVisible('contact') && (
                    <div style={{ marginTop: '3mm', fontSize: '9pt', color: '#444', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                        <span>email: <strong id="preview-footer-email">{contactEmail}</strong></span>
                        <span>cel: <strong id="preview-footer-phone">{contactPhone}</strong></span>
                        <span>loc: <strong id="preview-footer-location">{contactLocation}</strong></span>
                    </div>
                )}
             </div>
             {photoSrc && (
                <div style={{ width: '25mm', height: '25mm', borderRadius: '3mm', overflow: 'hidden', marginLeft: '4mm' }}>
                    <img src={photoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                </div>
             )}
         </div>

             {/* Sections */}
            {isVisible('profile') && (
                 <div className="cv-section">
                     <h3 className="cv-section-title" style={{ borderBottom: 'none', textTransform: 'uppercase', background: '#f4f4f4', padding: '1mm 2mm', display: 'inline-block' }}>{sectionLabel('profile')}</h3>
                     <p className="cv-text" id="preview-hero-summary" style={{ marginTop: '2mm' }}>{profile.summary}</p>
                 </div>
            )}

         {isVisible('skills') && (
             <div className="cv-section">
                <h3 className="cv-section-title" style={{ borderBottom: 'none', textTransform: 'uppercase', background: '#f4f4f4', padding: '1mm 2mm', display: 'inline-block' }}>{sectionLabel('skills')}</h3>
                 <div className="cv-text" id="preview-skills-list" style={{ marginTop: '2mm' }}>{getAllSkills()}</div>
             </div>
         )}

                 {isVisible('experience') && (
                     <div className="cv-section">
                         <h3 className="cv-section-title" style={{ borderBottom: 'none', textTransform: 'uppercase', background: '#f4f4f4', padding: '1mm 2mm', display: 'inline-block' }}>{sectionLabel('experience')}</h3>
                         <div style={{ marginTop: '3mm' }}>
                {experience.map((job, index) => (
                    <div key={index} className="cv-job" style={{ borderLeft: '2px solid #eee', paddingLeft: '4mm', marginLeft: '1mm' }}>
                        <div className="cv-job-header">
                            <h4 className="cv-company" id={`preview-exp-company-${job._id || index}`}>{job.company}</h4>
                            <span className="cv-meta" id={`preview-exp-period-${job._id || index}`}>{job.period}</span>
                        </div>
                        <div className="cv-job-subheader">
                             <span className="cv-job-role" id={`preview-exp-role-${job._id || index}`} style={{ color: color }}>{job.role}</span>
                             {job.location && <span className="cv-meta" id={`preview-exp-location-${job._id || index}`}>{job.location}</span>}
                        </div>
                                                {job.description && (
                                                    <p className="cv-text" id={`preview-exp-description-${job._id || index}`} style={{ marginBottom: '2mm', fontStyle: 'italic' }}>{job.description}</p>
                                                )}
                                                {Array.isArray(job.summary) && job.summary.filter(line => line && line.trim()).length > 0 && (
                                                    <ul className="cv-list" id={`preview-exp-achievements-${job._id || index}`}>
                                                            {job.summary.filter(line => line && line.trim()).map((point, i) => <li key={i}>{point}</li>)}
                                                    </ul>
                                                )}
                    </div>
                ))}
                         </div>
                     </div>
                 )}
      </>
  );

  // 4. MADRID (Structured Grid)
  // Two columns for contact info, strong headers
  const renderMadrid = () => (
      <>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8mm',  borderBottom: `2px solid ${color}`, paddingBottom: '5mm', gap: '4mm' }}>
             <div style={{ flex: 1 }}>
                 <h1 className="cv-name" id="preview-hero-name" style={{ fontSize: '24pt' }}>{profile.name}</h1>
                 <h2 className="cv-role" id="preview-hero-role" style={{ fontSize: '12pt', marginTop: '2mm' }}>{profile.role}</h2>
             </div>
             <div style={{ textAlign: 'right', fontSize: '9pt', lineHeight: '1.6', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                 {photoSrc && (
                    <div style={{ width: '22mm', height: '22mm', borderRadius: '50%', overflow: 'hidden', marginBottom: '2mm', border: '1px solid #eee' }}>
                        <img src={photoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                    </div>
                 )}
                 {isVisible('contact') && (
                     <>
                         <div id="preview-footer-email" style={{ fontWeight: 'bold' }}>{contactEmail}</div>
                         <div id="preview-footer-phone">{contactPhone}</div>
                         <div id="preview-footer-location">{contactLocation}</div>
                         {profile.linkedin && <div>LinkedIn Profile</div>}
                     </>
                 )}
             </div>
         </div>

            {isVisible('profile') && (
                 <div className="cv-section">
                     <h3 className="cv-section-title" style={{ color: 'black', borderBottom: `1px solid ${color}` }}>{sectionLabel('profile')}</h3>
                     <p className="cv-text" id="preview-hero-summary">{profile.summary}</p>
                 </div>
            )}

                    {isVisible('skills') && (
                        <div className="cv-section">
                            <h3 className="cv-section-title" style={{ color: 'black', borderBottom: `1px solid ${color}` }}>{sectionLabel('skills')}</h3>
                            <p className="cv-text" id="preview-skills-list"><strong>Core:</strong> {getAllSkills()}</p>
                        </div>
                    )}

                    {isVisible('experience') && (
                        <div className="cv-section">
                            <h3 className="cv-section-title" style={{ color: 'black', borderBottom: `1px solid ${color}` }}>{sectionLabel('experience')}</h3>
                            {experience.map((job, index) => (
                    <div key={index} className="cv-job">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
                            <h4 className="cv-company" style={{ fontSize: '11pt', fontWeight: 'bold' }}>
                                <span id={`preview-exp-company-${job._id || index}`}>{job.company}</span> — <span id={`preview-exp-role-${job._id || index}`} style={{ fontWeight: 'normal', fontStyle: 'italic' }}>{job.role}</span>
                            </h4>
                            <span className="cv-meta" id={`preview-exp-period-${job._id || index}`} style={{ fontWeight: 'bold' }}>{job.period}</span>
                        </div>
                                                {job.description && (
                                                    <p className="cv-text" id={`preview-exp-description-${job._id || index}`} style={{ marginBottom: '2mm', fontStyle: 'italic' }}>{job.description}</p>
                                                )}
                                                {Array.isArray(job.summary) && job.summary.filter(line => line && line.trim()).length > 0 && (
                                                    <ul className="cv-list" id={`preview-exp-achievements-${job._id || index}`}>
                                                            {job.summary.filter(line => line && line.trim()).map((point, i) => <li key={i}>{point}</li>)}
                                                    </ul>
                                                )}
                                        </div>
                            ))}
                        </div>
                    )}
      </>
  );

  // 5. CHICAGO (Minimalist)
  // Clean, no borders, emphasis on typography
  const renderChicago = () => (
      <>
         <div style={{ marginBottom: '8mm' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="cv-name" id="preview-hero-name" style={{ fontSize: '26pt', fontWeight: '300', letterSpacing: '-1px' }}>{profile.name}</h1>
                    <h2 className="cv-role" id="preview-hero-role" style={{ fontSize: '11pt', textTransform: 'uppercase', color: '#666', letterSpacing: '2px', marginTop: '2mm' }}>{profile.role}</h2>
                </div>
                {photoSrc && (
                    <div style={{ width: '22mm', height: '22mm', overflow: 'hidden', marginLeft: '4mm', borderRadius: '2px' }}>
                        <img src={photoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                    </div>
                )}
             </div>
             {isVisible('contact') && (
                 <div style={{ marginTop: '4mm', fontSize: '9pt', color: '#888' }}>
                     <span id="preview-footer-email">{contactEmail}</span>  —  <span id="preview-footer-phone">{contactPhone}</span>  —  <span id="preview-footer-location">{contactLocation}</span>
                 </div>
             )}
         </div>

         <div className="cv-section">
            <h3 className="cv-section-title" style={{ border: 'none', fontSize: '14pt', color: '#000', marginBottom: '4mm' }}>{sectionLabel('experience')}</h3>
            {experience.map((job, index) => (
                <div key={index} className="cv-job" style={{ marginBottom: '6mm' }}>
                    <div style={{ marginBottom: '2mm' }}>
                        <h4 style={{ fontSize: '12pt', fontWeight: '700', color: color }} id={`preview-exp-company-${job._id || index}`}>{job.company}</h4>
                        <div style={{ display: 'flex', gap: '10px', fontSize: '10pt', color: '#555', marginTop: '1px' }}>
                            <span id={`preview-exp-role-${job._id || index}`}>{job.role}</span>
                            <span>|</span>
                            <span id={`preview-exp-period-${job._id || index}`}>{job.period}</span>
                             {job.location && (<><span>|</span><span id={`preview-exp-location-${job._id || index}`}>{job.location}</span></>)}
                        </div>
                    </div>
                    <p className="cv-text" id={`preview-exp-description-${job._id || index}`} style={{ fontSize: '10pt', lineHeight: '1.5' }}>
                        {job.description || (job.summary && job.summary[0]) || 'Role description...'}
                    </p>
                    {/* Tech (Experiencia) omitido en CV por pedido */}
                </div>
            ))}
         </div>

         <div className="cv-section">
            <h3 className="cv-section-title" style={{ border: 'none', fontSize: '14pt', color: '#000', marginBottom: '2mm' }}>{sectionLabel('skills')}</h3>
            <p className="cv-text" id="preview-skills-list" style={{ lineHeight: '1.8' }}>{getAllSkills()}</p>
         </div>
      </>
  );

  // 6. SANTIAGO (Bold Header Block)
  // Colored header background
  const renderSantiago = () => (
      <>
         <div style={{ margin: '-12mm -20mm 8mm -20mm', background: color, color: 'white', padding: '15mm 20mm 10mm 20mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
                <h1 id="preview-hero-name" style={{ margin: 0, fontSize: '28pt', fontWeight: '800' }}>{profile.name}</h1>
                <p id="preview-hero-role" style={{ margin: '2mm 0 0 0', fontSize: '12pt', opacity: 0.9 }}>{profile.role}</p>
                {isVisible('contact') && (
                    <div style={{ marginTop: '5mm', fontSize: '9pt', opacity: 0.8, display: 'flex', gap: '15px' }}>
                        <span id="preview-footer-email">{contactEmail}</span>
                        <span id="preview-footer-phone">{contactPhone}</span>
                        <span id="preview-footer-location">{contactLocation}</span>
                    </div>
                )}
             </div>
             {photoSrc && (
                <div style={{ width: '32mm', height: '32mm', borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.3)', flexShrink: 0, marginLeft: '4mm' }}>
                    <img src={photoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                </div>
             )}
         </div>

            {isVisible('profile') && (
                <div className="cv-section">
                    <h3 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', color: color, marginBottom: '2mm' }}>{sectionLabel('profile')}</h3>
                    <p className="cv-text" id="preview-hero-summary">{profile.summary}</p>
                </div>
            )}

{isVisible('experience') && (
             <div className="cv-section">
                <h3 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', color: color, marginBottom: '2mm' }}>{sectionLabel('experience')}</h3>
                {experience.map((job, index) => (
                    <div key={index} style={{ marginBottom: '5mm', borderLeft: `3px solid ${color}`, paddingLeft: '4mm' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '11pt' }} id={`preview-exp-company-${job._id || index}`}>{job.company}</div>
                        <div style={{ fontSize: '9pt', color: '#666', marginBottom: '1mm' }}><span id={`preview-exp-role-${job._id || index}`}>{job.role}</span> / <span id={`preview-exp-period-${job._id || index}`}>{job.period}</span></div>
                              {job.description && (
                                 <p className="cv-text" id={`preview-exp-description-${job._id || index}`} style={{ marginBottom: '2mm', fontStyle: 'italic' }}>{job.description}</p>
                              )}
                              {Array.isArray(job.summary) && job.summary.filter(line => line && line.trim()).length > 0 && (
                                  <ul className="cv-list" id={`preview-exp-achievements-${job._id || index}`}>
                                      {job.summary.filter(line => line && line.trim()).slice(0, 3).map((point, i) => <li key={i}>{point}</li>)}
                                  </ul>
                              )}
                    </div>
                ))}
             </div>
         )}
         
         {isVisible('skills') && (
             <div className="cv-section">
                    <h3 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', color: color, marginBottom: '2mm' }}>{sectionLabel('skills')}</h3>
                    <div className="cv-text" id="preview-skills-list">{getAllSkills()}</div>
             </div>
         )}
      </>
  );

  // 7. ISTANBUL (Right Sidebar)
  const renderIstanbul = () => (
      <div style={{ display: 'grid', gridTemplateColumns: '70% 30%', gap: '8mm' }}>
          <div>
             <div style={{ marginBottom: '8mm' }}>
                 <h1 id="preview-hero-name" style={{ fontSize: '24pt', fontWeight: 'bold', color: color, lineHeight: 1 }}>{profile.name}</h1>
                 <h2 id="preview-hero-role" style={{ fontSize: '12pt', fontWeight: 'bold', color: '#333', marginTop: '2mm' }}>{profile.role}</h2>
             </div>
             
             {isVisible('experience') && (
                 <div className="cv-section">
                    <h3 className="cv-section-title" id="preview-experience-title" style={{ borderColor: color }}>Experiencia</h3>
                    {experience.map((job, index) => (
                        <div key={index} className="cv-job">
                            <h4 className="cv-company" id={`preview-exp-company-${job._id || index}`}>{job.company}</h4>
                            <div style={{ fontSize: '9pt', fontStyle: 'italic', marginBottom: '1mm' }}><span id={`preview-exp-role-${job._id || index}`}>{job.role}</span> | <span id={`preview-exp-period-${job._id || index}`}>{job.period}</span></div>
                                                    {job.description && (
                                                        <p className="cv-text" id={`preview-exp-description-${job._id || index}`} style={{ marginBottom: '2mm', fontStyle: 'italic' }}>{job.description}</p>
                                                    )}
                                                    {Array.isArray(job.summary) && job.summary.filter(line => line && line.trim()).length > 0 && (
                                                        <ul className="cv-list" id={`preview-exp-achievements-${job._id || index}`}>
                                                                {job.summary.filter(line => line && line.trim()).map((point, i) => <li key={i}>{point}</li>)}
                                                        </ul>
                                                    )}
                        </div>
                    ))}
                 </div>
             )}
          </div>
          
          <div style={{ borderLeft: '1px solid #eee', paddingLeft: '6mm' }}>
              {photoSrc && (
                  <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '4px', marginBottom: '6mm' }}>
                      <img src={photoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                  </div>
              )}
              {isVisible('contact') && (
                  <div style={{ marginBottom: '6mm', breakInside: 'avoid' }}>
                      <h4 style={{ fontWeight: 'bold', color: color, marginBottom: '2mm' }}>{sectionLabel('contact')}</h4>
                      <div style={{ fontSize: '9pt', wordBreak: 'break-all' }}>
                          <div id="preview-footer-email" style={{ marginBottom: '1mm' }}>{contactEmail}</div>
                          <div id="preview-footer-phone" style={{ marginBottom: '1mm' }}>{contactPhone}</div>
                          <div id="preview-footer-location">{contactLocation}</div>
                      </div>
                  </div>
              )}

              {isVisible('skills') && (
                  <div style={{ marginBottom: '6mm', breakInside: 'avoid' }}>
                      <h4 style={{ fontWeight: 'bold', color: color, marginBottom: '2mm' }}>{sectionLabel('skills')}</h4>
                      <div style={{ fontSize: '9pt' }}>
                          {(skills.main || []).map((s, i) => (
                              <div key={i} style={{ marginBottom: '1mm' }}>• {typeof s === 'string' ? s : s.name}</div>
                          ))}
                      </div>
                  </div>
              )}

              {isVisible('education') && (
                  <div style={{ breakInside: 'avoid' }}>
                      <h4 style={{ fontWeight: 'bold', color: color, marginBottom: '2mm' }}>{sectionLabel('education')}</h4>
                      {education.map((edu, i) => (
                          <div key={i} style={{ fontSize: '9pt', marginBottom: '3mm' }}>
                              <div style={{ fontWeight: 'bold' }} id={`preview-education-degree-${edu._id || i}`}>{edu.degree}</div>
                              <div id={`preview-education-institution-${edu._id || i}`}>{edu.institution}</div>
                              <div style={{ color: '#666' }} id={`preview-education-period-${edu._id || i}`}>{edu.period}</div>
                              {edu.location && (
                                  <div style={{ color: '#666' }} id={`preview-education-location-${edu._id || i}`}>{edu.location}</div>
                              )}
                              {edu.details && (
                                  <div id={`preview-education-details-${edu._id || i}`}>{edu.details}</div>
                              )}
                              {edu.link && (
                                  <div style={{ fontSize: '8.5pt', marginTop: '0.5mm' }} id={`preview-education-link-${edu._id || i}`}>{edu.linkLabel || 'Ver Credencial'}</div>
                              )}
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
  );

  // 8. LONDON (Classic Serif)
  const renderLondon = () => (
      <div style={{ textAlign: 'center' }}>
          {photoSrc && (
              <div style={{ width: '25mm', height: '25mm', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 4mm auto', border: '1px solid #333' }}>
                  <img src={photoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
              </div>
          )}
          <h1 id="preview-hero-name" style={{ fontSize: '24pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '2mm' }}>{profile.name.toUpperCase()}</h1>
          {isVisible('contact') && (
              <div style={{ fontSize: '10pt', borderTop: '1px solid black', borderBottom: '1px solid black', padding: '2mm 0', marginBottom: '8mm' }}>
                  <span id="preview-footer-location">{contactLocation}</span> • <span id="preview-footer-phone">{contactPhone}</span> • <span id="preview-footer-email">{contactEmail}</span>
              </div>
          )}

          <h3 style={{ fontSize: '12pt', textTransform: 'uppercase', marginBottom: '4mm', letterSpacing: '1px', fontWeight: 'bold' }}>{sectionLabel('experience')}</h3>
          
          <div style={{ textAlign: 'left' }}>
            {isVisible('experience') && experience.map((job, index) => (
                <div key={index} style={{ marginBottom: '5mm' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11pt' }}>
                        <span id={`preview-exp-company-${job._id || index}`}>{job.company}</span>
                        <span id={`preview-exp-location-${job._id || index}`}>{job.location}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontStyle: 'italic', fontSize: '10pt', marginBottom: '1mm' }}>
                        <span id={`preview-exp-role-${job._id || index}`}>{job.role}</span>
                        <span id={`preview-exp-period-${job._id || index}`}>{job.period}</span>
                    </div>
                                        {job.description && (
                                            <p className="cv-text" id={`preview-exp-description-${job._id || index}`} style={{ marginBottom: '2mm', fontStyle: 'italic' }}>{job.description}</p>
                                        )}
                                        {Array.isArray(job.summary) && job.summary.filter(line => line && line.trim()).length > 0 && (
                                            <ul className="cv-list" id={`preview-exp-achievements-${job._id || index}`} style={{ marginTop: '1mm' }}>
                                                    {job.summary.filter(line => line && line.trim()).map((point, i) => <li key={i}>{point}</li>)}
                                            </ul>
                                        )}
                </div>
            ))}
          </div>

          {isVisible('skills') && (
              <>
                  <h3 style={{ fontSize: '12pt', textTransform: 'uppercase', margin: '6mm 0 4mm 0', letterSpacing: '1px', fontWeight: 'bold' }}>{sectionLabel('skills')}</h3>
                  <p style={{ textAlign: 'center', fontSize: '10pt' }} id="preview-skills-list">{getAllSkills()}</p>
              </>
          )}
      </div>
  );
  
  // 9. KARACHI (Compact Grid)
  const renderKarachi = () => (
      <>
        <div style={{ borderBottom: `4px solid ${color}`, marginBottom: '6mm', paddingBottom: '4mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
                <h1 className="cv-name" id="preview-hero-name" style={{ fontSize: '22pt' }}>{profile.name}</h1>
                <h2 id="preview-hero-role" style={{ fontSize: '12pt', color: color, fontWeight: 'bold' }}>{profile.role}</h2>
                {isVisible('contact') && (
                    <div style={{ fontSize: '9pt', marginTop: '2mm', display: 'flex', gap: '15px' }}>
                        <span><strong>E:</strong> <span id="preview-footer-email">{contactEmail}</span></span>
                        <span><strong>M:</strong> <span id="preview-footer-phone">{contactPhone}</span></span>
                        {profile.linkedin && <span><strong>IN:</strong> {profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>}
                    </div>
                )}
            </div>
            {photoSrc && (
                <div style={{ width: '25mm', height: '25mm', overflow: 'hidden', marginLeft: '4mm', border: `1px solid ${color}` }}>
                    <img src={photoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                </div>
            )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8mm' }}>
             <div>
                 <h3 style={{ background: '#eee', padding: '1mm 2mm', fontSize: '10pt', fontWeight: 'bold', marginBottom: '3mm' }}>{sectionLabel('experience', { upper: true })}</h3>
                 {isVisible('experience') && experience.map((job, index) => (
                    <div key={index} style={{ marginBottom: '4mm' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '10pt' }} id={`preview-exp-company-${job._id || index}`}>{job.company}</div>
                        <div style={{ fontSize: '9pt', color: color }} id={`preview-exp-role-${job._id || index}`}>{job.role}</div>
                        <div style={{ fontSize: '8pt', color: '#666', marginBottom: '1mm' }} id={`preview-exp-period-${job._id || index}`}>{job.period}</div>
                        <p style={{ fontSize: '9pt', lineHeight: '1.3', margin: 0 }}>
                            {job.description || (job.summary && job.summary[0])}
                        </p>
                        {/* Tech omitido en CV */}
                    </div>
                 ))}
             </div>
             <div>
                 <h3 style={{ background: '#eee', padding: '1mm 2mm', fontSize: '10pt', fontWeight: 'bold', marginBottom: '3mm' }}>{sectionLabel('education', { upper: true })} & {sectionLabel('skills', { upper: true })}</h3>
                 <div style={{ marginBottom: '4mm' }}>
                    {isVisible('education') && education.map((edu, i) => (
                        <div key={i} style={{ marginBottom: '2mm' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '10pt' }} id={`preview-education-degree-${edu._id || i}`}>{edu.degree}</div>
                            <div style={{ fontSize: '9pt' }}>
                                <span id={`preview-education-institution-${edu._id || i}`}>{edu.institution}</span>, <span id={`preview-education-period-${edu._id || i}`}>{edu.period}</span>
                            </div>
                            {edu.location && (
                                <div style={{ fontSize: '9pt', color: '#666' }} id={`preview-education-location-${edu._id || i}`}>{edu.location}</div>
                            )}
                            {edu.details && (
                                <div style={{ fontSize: '9pt' }} id={`preview-education-details-${edu._id || i}`}>{edu.details}</div>
                            )}
                            {edu.link && (
                                <div style={{ fontSize: '8.5pt', marginTop: '0.5mm' }} id={`preview-education-link-${edu._id || i}`}>{edu.linkLabel || 'Ver Credencial'}</div>
                            )}
                        </div>
                    ))}
                 </div>
                 
                 {isVisible('skills') && (
                     <>
                         <h4 style={{ fontSize: '10pt', fontWeight: 'bold', marginBottom: '1mm', color: color }}>Skills</h4>
                         <div style={{ fontSize: '9pt', display: 'flex', flexWrap: 'wrap', gap: '1mm' }} id="preview-skills-list">
                             {getAllSkills().split(', ').map((s, i) => (
                                 <span key={i} style={{ background: '#f5f5f5', padding: '1px 3px', borderRadius: '2px', border: '1px solid #ddd' }}>{s}</span>
                             ))}
                         </div>
                     </>
                 )}
             </div>
        </div>
      </>
  );

  // 10. MUMBAI (Creative Circle)
  const renderMumbai = () => (
      <>
         <div style={{ display: 'flex', alignItems: 'center', gap: '6mm', marginBottom: '8mm' }}>
             <div style={{ width: '25mm', height: '25mm', borderRadius: '50%', background: color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16pt', fontWeight: 'bold', overflow: 'hidden', flexShrink: 0 }}>
                 {photoSrc ? (
                     <img src={photoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                 ) : (
                    (profile.name || 'JP').substring(0,2).toUpperCase()
                 )}
             </div>
             <div>
                 <h1 id="preview-hero-name" style={{ fontSize: '22pt', fontWeight: 'bold', lineHeight: 1 }}>{profile.name}</h1>
                 <p id="preview-hero-role" style={{ fontSize: '12pt', color: '#666', marginTop: '1mm' }}>{profile.role}</p>
             </div>
         </div>
         
         <div className="cv-section">
             <h3 style={{ borderLeft: `4px solid ${color}`, paddingLeft: '3mm', fontSize: '12pt', fontWeight: 'bold', color: '#333', marginBottom: '3mm' }}>{sectionLabel('experience')}</h3>
             {isVisible('experience') && experience.map((job, index) => (
                 <div key={index} style={{ marginBottom: '5mm', paddingLeft: '4mm' }}>
                     <h4 style={{ fontSize: '11pt', fontWeight: 'bold' }} id={`preview-exp-company-${job._id || index}`}>{job.company}</h4>
                     <p style={{ fontSize: '9pt', color: '#666', margin: '0 0 1mm 0' }}><span id={`preview-exp-role-${job._id || index}`}>{job.role}</span> • <span id={`preview-exp-period-${job._id || index}`}>{job.period}</span></p>
                                         {job.description && (
                                             <p className="cv-text" id={`preview-exp-description-${job._id || index}`} style={{ marginBottom: '2mm', fontStyle: 'italic' }}>{job.description}</p>
                                         )}
                                         {Array.isArray(job.summary) && job.summary.filter(line => line && line.trim()).length > 0 && (
                                             <ul className="cv-list" id={`preview-exp-achievements-${job._id || index}`}>
                                                     {job.summary.filter(line => line && line.trim()).map((point, i) => <li key={i}>{point}</li>)}
                                             </ul>
                                         )}
                 </div>
             ))}
         </div>
      </>
  );

  // 11. DELHI (Split Header)
  const renderDelhi = () => (
      <>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: '8mm' }}>
             <div style={{ paddingRight: '6mm', borderRight: '1px solid #ddd', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                 {photoSrc && (
                     <div style={{ width: '22mm', height: '22mm', borderRadius: '50%', overflow: 'hidden', marginBottom: '3mm', border: `2px solid ${color}` }}>
                         <img src={photoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                     </div>
                 )}
                 <h1 id="preview-hero-name" style={{ fontSize: '20pt', fontWeight: 'bold', color: color }}>{profile.name}</h1>
                 <h2 id="preview-hero-role" style={{ fontSize: '11pt', color: '#000' }}>{profile.role}</h2>
             </div>
             <div style={{ paddingLeft: '6mm', fontSize: '9pt', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                 {isVisible('contact') && (
                     <>
                         <div id="preview-footer-email">{contactEmail}</div>
                         <div id="preview-footer-phone">{contactPhone}</div>
                         <div id="preview-footer-location">{contactLocation}</div>
                     </>
                 )}
             </div>
         </div>
         
         <div className="cv-section">
             <h3 className="cv-section-title" style={{ textAlign: 'center', border: 'none', background: color, color: 'white', padding: '1mm' }}>{sectionLabel('experience', { upper: true })}</h3>
             {isVisible('experience') && experience.map((job, index) => (
                 <div key={index} className="cv-job">
                     <div className="cv-job-header">
                         <h4 className="cv-company" id={`preview-exp-company-${job._id || index}`}>{job.company}</h4>
                         <span className="cv-meta" id={`preview-exp-period-${job._id || index}`}>{job.period}</span>
                     </div>
                     <p style={{ fontStyle: 'italic', fontSize: '10pt', margin: '0 0 1mm 0' }} id={`preview-exp-role-${job._id || index}`}>{job.role}</p>
                                         {job.description && (
                                             <p className="cv-text" id={`preview-exp-description-${job._id || index}`} style={{ marginBottom: '2mm', fontStyle: 'italic' }}>{job.description}</p>
                                         )}
                                         {Array.isArray(job.summary) && job.summary.filter(line => line && line.trim()).length > 0 && (
                                             <ul className="cv-list" id={`preview-exp-achievements-${job._id || index}`}>
                                                     {job.summary.filter(line => line && line.trim()).map((point, i) => <li key={i}>{point}</li>)}
                                             </ul>
                                         )}
                 </div>
             ))}
         </div>
      </>
  );

  // 11. EDITORIAL (Two-Column Minimalist with Left Accent Bar)
  const renderEditorial = () => {
    // Principal flex container
    const containerStyle = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        minHeight: '100%',
        // Counteract parent padding to fill full width
        margin: '-12mm -20mm', // Assumes parent padding is roughly these values 
        width: 'calc(100% + 40mm)',
    };

    // The decorative colored bar on the far left
    const accentBarStyle = {
         width: '2.5%', // Much thinner, almost like a thick border
         minWidth: '5mm', // Ensure visible but slim width
         // backgroundColor: '#eaddcf', // Removed duplicate default
         backgroundColor: color === '#0f172a' ? '#d1d5db' : (color + '30'), // Fallback logic for opacity or gray
         borderRight: '1px solid #eee'
    };

    // Adjusted logic for accent bar color: 
    // If the user picked a dark color, we want a pastel version of it for the side? 
    // Or just the color itself if it's the "margin" style.
    // The user said "Color afuera", implies the color IS the margin.
    // Let's use the main theme color but maybe muted if it's too dark, or just the color itself.
    // Visual reference showed a beige bar. Let's make it the theme color but allow the user to control it via the color picker.
    // Since the color picker sets 'color' (text color usually), we might want to use a specific hex for the background.
    // PROPOSAL: Use the theme color as the background of this bar.
    
    // HOWEVER, if the theme color is #000000, a black bar might be too heavy?
    // The user said "Sidebar blanco o muy claro". The BAR is the 'color outside'.
    // Let's us the theme color.
    
    const sidebarContainerStyle = {
         display: 'flex',
         flex: 1, // Takes remaining width
         flexDirection: 'row',
    };

    const leftColStyle = {
        width: '32%',
        backgroundColor: '#fff', // White sidebar
        padding: '12mm 4mm 12mm 8mm',
        color: '#444',
        fontSize: '9pt',
        borderRight: '1px solid #eee' // Vertical thin line separator
    };

    const rightColStyle = {
        width: '68%',
        backgroundColor: '#fff',
        padding: '12mm 12mm 12mm 12mm',
        color: '#333'
    };

    const h3StyleLeft = {
        fontSize: '10pt',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        borderBottom: `1px solid ${color}`, // 1px for thinner line
        paddingBottom: '3mm', // Increased padding to separate line from text
        marginBottom: '6mm', // Keeping space below
        fontWeight: 'bold',
        color: '#222'
    };

    const h3StyleRight = {
        fontSize: '11pt',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: 'bold',
        marginBottom: '4mm',
        marginTop: '2mm',
        color: '#222', // Clean black/dark gray title
        display: 'inline-block',
        borderBottom: '2px solid #f0f0f0' // Very subtle separator
    };
    
    // We need to use "color" (the theme color) for the accent bar on the left.
    // But ensure it's not too jarring if it's pure blue/red. 
    // Actually, "Color afuera" usually implies the brand color is the bar.
    
    return (
        <div style={containerStyle}>
            {/* DECORATIVE LEFT BAR (The "Color Out") */}
            <div style={{ ...accentBarStyle, backgroundColor: color }}></div>

            <div style={sidebarContainerStyle}>
                {/* LEFT CONTENT COLUMN (White) */}
                <div style={leftColStyle}>
                    {photoSrc && (
                        <div style={{ width: '32mm', height: '32mm', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 8mm auto', filter: 'grayscale(20%)' }}>
                            <img src={photoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Foto" />
                        </div>
                    )}
                    
                    {isVisible('contact') && (
                        <div style={{ marginBottom: '8mm' }}>
                            <h3 style={h3StyleLeft}>{sectionLabel('contact')}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {contactEmail && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                        <span style={{ fontSize: '10pt', color: color }}>✉</span> <span id="preview-footer-email" style={{ wordBreak: 'break-all' }}>{contactEmail}</span>
                                    </div>
                                )}
                                {contactPhone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '10pt', color: color }}>📞</span> <span id="preview-footer-phone">{contactPhone}</span>
                                    </div>
                                )}
                                {contactLocation && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '10pt', color: color }}>📍</span> <span id="preview-footer-location">{contactLocation}</span>
                                    </div>
                                )}
                                 {profile.linkedin && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '8.5pt' }}>
                                       <span style={{ fontSize: '10pt', color: color }}>in</span> <span>{profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {isVisible('skills') && (
                        <div style={{ marginBottom: '8mm' }}>
                            <h3 style={h3StyleLeft}>{sectionLabel('skills')}</h3>
                            <ul className="cv-list" style={{ paddingLeft: '2mm', margin: 0, listStyle: 'none' }}>
                               {(skills.main || []).map((s, i) => (
                                   <li key={i} style={{ marginBottom: '1.2mm', display: 'flex', alignItems: 'baseline' }}>
                                        <span style={{ fontSize: '10pt', color: color, marginRight: '4px', lineHeight: '0' }}>•</span>
                                        <span style={{ lineHeight: '1.2', fontSize: '9pt', color: '#444' }}>{typeof s === 'string' ? s : s.name}</span>
                                   </li>
                               ))}
                               {Object.entries(skills.categories || {}).map(([cat, items]) => (
                                   items.length > 0 && items.map((s, i) => (
                                       <li key={`${cat}-${i}`} style={{ marginBottom: '1.2mm', display: 'flex', alignItems: 'baseline' }}>
                                            <span style={{ fontSize: '10pt', color: color, marginRight: '4px', lineHeight: '0' }}>•</span>
                                            <span style={{ lineHeight: '1.2', fontSize: '9pt', color: '#444' }}>{s}</span>
                                       </li>
                                    ))
                               ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* RIGHT CONTENT COLUMN (White) */}
                <div style={rightColStyle}>
                    <div style={{ marginBottom: '10mm', marginTop: '2mm' }}>
                        <h1 className="cv-name" id="preview-hero-name" style={{ fontSize: '26pt', color: '#111', marginBottom: '2mm', letterSpacing: '-0.5px' }}>{profile.name}</h1>
                        <h2 className="cv-role" id="preview-hero-role" style={{ fontSize: '11pt', fontWeight: '500', color: '#666', marginTop: '0', textTransform: 'uppercase', letterSpacing: '3px' }}>{profile.role}</h2>
                    </div>

                    {isVisible('profile') && (
                        <div style={{ marginBottom: '8mm' }}>
                             <h3 style={h3StyleRight}>{sectionLabel('profile')}</h3>
                             <p className="cv-text" id="preview-hero-summary" style={{ lineHeight: '1.6', color: '#444' }}>{profile.summary}</p>
                        </div>
                    )}

                    {isVisible('experience') && (
                        <div style={{ marginBottom: '8mm' }}>
                            <h3 style={h3StyleRight}>{sectionLabel('experience')}</h3>
                            {experience.map((job, index) => (
                                <div key={index} className="cv-job" style={{ marginBottom: '6mm', pageBreakInside: 'avoid' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1mm' }}>
                                        <h4 style={{ fontSize: '12pt', fontWeight: '700', margin: 0, color: '#111' }}>{job.role}</h4>
                                        <span style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap', marginLeft: '2mm' }}>{job.period}</span>
                                    </div>
                                    <div style={{ fontSize: '10pt', marginBottom: '2mm', color: '#555', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontStyle: 'italic' }}>{job.company}</span>
                                        {job.location && <span style={{ fontSize: '9pt' }}>{job.location}</span>}
                                    </div>
                                    
                                    {job.description && <p className="cv-text" style={{ marginBottom: '2mm' }}>{job.description}</p>}
                                    
                                    {Array.isArray(job.summary) && job.summary.filter(k=>k && k.trim()).length > 0 && (
                                        <ul className="cv-list" style={{ color: '#555' }}>
                                            {job.summary.filter(k=>k && k.trim()).map((pt, i) => (
                                                <li key={i}>{pt}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {isVisible('education') && (
                        <div style={{ marginBottom: '8mm' }}>
                             <h3 style={h3StyleRight}>{sectionLabel('education')}</h3>
                             {education.map((edu, index) => (
                                 <div key={index} style={{ marginBottom: '4mm', pageBreakInside: 'avoid' }}>
                                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                         <h4 style={{ fontWeight: '700', margin: 0, fontSize: '11pt', color: '#111' }}>{edu.degree}</h4>
                                         <span style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap' }}>{edu.period || edu.year}</span>
                                     </div>
                                     <div style={{ fontStyle: 'italic', color: '#555' }}>{edu.institution}, {edu.location}</div>
                                     {edu.details && <p style={{ fontSize: '9.5pt', marginTop: '1mm', color: '#555' }}>{edu.details}</p>}
                                 </div>
                             ))}
                        </div>
                    )}

                    {/* Include projects and continuous ed here for this template */}
                    {renderProjectsSection()}
                    {renderContinuousSection()}
                </div>
            </div>
        </div>
    );
  };

  // Selector Logic
  const renderContent = () => {
       switch(template) {
           case 'paris': return renderParis();
           case 'toronto': return renderToronto();
           case 'madrid': return renderMadrid();
           case 'chicago': return renderChicago();
           case 'santiago': return renderSantiago();
           case 'istanbul': return renderIstanbul();
           case 'london': return renderLondon();
           case 'karachi': return renderKarachi();
           case 'mumbai': return renderMumbai();
           case 'delhi': return renderDelhi();
           case 'editorial': return renderEditorial(); // New minimal two layout
           case 'new-york': default: return renderNewYork();
       }
  };

  // Helper: Educación genérica (para plantillas sin bloque de educación)
  const renderEducationSectionGeneric = () => {
      if (!isVisible('education')) return null;
      const list = Array.isArray(education) ? education : [];
      if (!list.length) return null;
      return (
         <div className="cv-section">
            <h3 className="cv-section-title" id="preview-education-title">{sectionLabel('education')}</h3>
            {list.map((edu, idx) => (
                <div key={idx} style={{ marginBottom: '4mm' }}>
                    <div className="cv-job-header">
                        <h4 className="cv-institution" id={`preview-education-institution-${edu._id || idx}`}>{edu.institution}</h4>
                        <span className="cv-meta" id={`preview-education-period-${edu._id || idx}`}>{edu.period || edu.year}</span>
                    </div>
                    <div className="cv-degree" id={`preview-education-degree-${edu._id || idx}`}>{edu.degree}</div>
                    {edu.location && (<div className="cv-meta" id={`preview-education-location-${edu._id || idx}`}>{edu.location}</div>)}
                    {edu.details && (<p className="cv-text" id={`preview-education-details-${edu._id || idx}`}>{edu.details}</p>)}
                    {edu.link && (
                       <div style={{ fontSize: '9pt', marginTop: '1mm' }}>
                          <span id={`preview-education-link-${edu._id || idx}`}>{edu.linkLabel || 'Ver Credencial'}</span>
                       </div>
                    )}
                </div>
            ))}
         </div>
      );
  };

  return (
    <div className="cv-document">
          
                    {renderContent()}

                      {/* Generic sections appended to asegurar paridad con la web (sin duplicar contacto) */}
                      {template !== 'editorial' && renderProjectsSection()}
                      {template !== 'editorial' && renderContinuousSection()}
                      {/* Añadir educación genérica sólo si la plantilla actual no muestra educación */}
                      {(['paris','toronto','chicago','santiago','london','mumbai','delhi'].includes(template)) && renderEducationSectionGeneric()}
          
      <style>{`
            /* Import Google Fonts if needed (could be optimized) */
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Roboto:wght@300;400;500;700&display=swap');

            .cv-document {
                width: 210mm;
                min-height: 0;   /* <-- CAMBIO CRUCIAL: height auto, sin min-height fijo de A4 */
                height: auto;
                padding: 12mm 20mm;
                background: white;
                color: black;
                font-family: ${fontFamily};
                font-size: 10.5pt;
                line-height: 1.4;
                box-sizing: border-box;
                overflow: visible;
                /* Shadows for preview realism */
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }

            .cv-document a { text-decoration: none; color: black; }
            
            /* Header */
            .cv-header { margin-bottom: 2mm; }
            .cv-name {
                font-size: 18pt;
                font-weight: 800; /* Extra bold */
                text-transform: uppercase;
                margin: 0;
                line-height: 1.1;
                letter-spacing: -0.5px;
                color: ${color};
            }
            .cv-role {
                font-size: 10pt;
                font-weight: 500;
                margin: 1mm 0;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #444;
            }
            .cv-contact-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 0 12px;
                font-size: 9pt;
                color: #555;
                margin-top: 2mm;
            }
            .cv-divider {
                border: 0;
                border-bottom: 2px solid ${color};
                margin: 4mm 0 6mm 0;
                opacity: 0.3;
            }

            /* Sections */
            .cv-section { margin-bottom: 4mm; break-inside: avoid; }
            .cv-section-title {
                font-size: 10pt;
                font-weight: 700;
                text-transform: uppercase;
                border-bottom: 1px solid #ccc;
                margin-bottom: 2mm;
                padding-bottom: 1mm;
                letter-spacing: 0.5px;
                color: ${color};
                break-after: avoid;
            }

            .cv-text { text-align: justify; }

            /* Jobs */
            .cv-job { margin-bottom: 4mm; break-inside: avoid; page-break-inside: avoid; }
            .cv-job-header {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                margin-bottom: 1mm;
            }
            .cv-company { font-weight: 700; font-size: 11pt; margin: 0; }
            .cv-meta { font-size: 9pt; color: #666; }
            
            .cv-job-subheader {
                display: flex;
                justify-content: space-between;
                margin-bottom: 1mm;
            }
            .cv-job-role { font-weight: 600; font-style: italic; }
            .cv-meta-loc { font-size: 9pt; color: #666; font-style: italic; }

            .cv-list { margin: 0; padding-left: 5mm; }
            .cv-list li { margin-bottom: 0.5mm; }

            /* Institution */
            .cv-institution { font-weight: 700; margin: 0; }
            .cv-degree { margin: 0; }
      `}</style>
    </div>
  );
};

const CVPreview = ({ customData }) => {
    const contextData = useData();
  
  // Merge context data with custom data (for live preview)
  const profile = customData?.profile || contextData.profile;
  const experience = customData?.experience || contextData.experience;
  const skills = customData?.skills || contextData.skills;
  const education = customData?.education || contextData.education;
  const continuousEducation = customData?.continuousEducation || contextData.continuousEducation;
    const theme = customData?.theme || contextData.theme;
    const labels = customData?.labels || contextData.labels;
    const sectionVisibility = customData?.sectionVisibility || contextData.sectionVisibility;

    const mergedData = { profile, experience, skills, education, continuousEducation, theme, labels, sectionVisibility };

  // Usamos createPortal para "teletransportar" este componente fuera del div #root
  return ReactDOM.createPortal(
    <div id="print-wrapper">
      <div id="printable-cv-container">
        <CVContent data={mergedData} />
      </div>
      
      {/* Styles for print only wrapper logic */}
      <style>{`
        /* Ocultar wrapper en pantalla normal por defecto */
        #print-wrapper {
            display: none;
        }

        @media print {
            @page { 
                margin: 0; 
                size: A4; 
            }
            
            #root {
                display: none !important;
            }

            body { 
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                overflow: visible !important;
            }

            #print-wrapper {
                display: block !important;
                position: relative;
                width: 100%;
                background: white;
            }
            
            #printable-cv-container {
                margin: 0 auto;
                width: 210mm; /* Force absolute A4 width */
            }
            
            /* Ensure shadow is gone associated with cv-document in print mode */
            .cv-document {
                box-shadow: none !important;
                /* FORCE natural height based on content only */
                min-height: 0 !important; 
                height: auto !important;
                margin: 0 !important;
                border: none !important;
                overflow: visible !important;
            }

            /* Prevent extra page caused by margins/padding on the last element */
            .cv-document > *:last-child {
                margin-bottom: 0 !important;
                padding-bottom: 0 !important;
            }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default CVPreview;
