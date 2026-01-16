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
