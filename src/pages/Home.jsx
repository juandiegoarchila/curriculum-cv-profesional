import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { MessageSquare } from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Experience from '../components/Experience';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Education from '../components/Education';
import Footer from '../components/Footer';
import CVPreview from '../components/CVPreview';
import Loader from '../components/Loader';

const Home = () => {
  const { profile, header, loading } = useData();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
        // Priorizar el Nombre Completo del perfil para la pestaña del navegador
        const pageTitle = profile?.name || header?.title;
        if (pageTitle) {
            document.title = `${pageTitle}`;
        }
    }
  }, [profile, header, loading]);

  if (loading) {
     return <Loader />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Experience />
        <Skills />
        <Projects />
        <Education />
      </main>
      <Footer />

      {/* Platform Attribution & Feedback */}
      <div className="bg-slate-950 py-6 text-center border-t border-slate-900 border-opacity-50">
          <p className="text-[10px] text-slate-500 mb-3 font-medium">
            Creado con <a href="/" className="text-slate-400 hover:text-blue-400 transition-colors font-bold tracking-wide">CV Profesional</a>
          </p>
          <button 
              onClick={() => setIsFeedbackOpen(true)}
              className="inline-flex items-center gap-2 text-[10px] text-slate-500 hover:text-white transition-all bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-800"
          >
              <MessageSquare size={12} className="text-yellow-500" />
              <span>Reportar error o sugerencia</span>
          </button>
      </div>

      <CVPreview />

       {/* Feedback Modal */}
       <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        source="PublicProfile"
      />
    </div>
  );
}

export default Home;
