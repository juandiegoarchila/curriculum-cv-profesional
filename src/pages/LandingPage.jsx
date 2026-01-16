import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FeedbackModal from '../components/FeedbackModal';
import { 
  FileText, 
  Globe, 
  Download, 
  Edit3, 
  CheckCircle2, 
  ArrowRight, 
  Layout, 
  Share2,
  ShieldCheck,
  Rocket,
  Menu,
  X,
  MessageSquare // Import MessageSquare
} from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      
      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        source="LandingPage"
      />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                CV Profesional
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                  onClick={() => setIsFeedbackOpen(true)}
                  className="text-sm font-medium text-slate-600 hover:text-yellow-600 transition-colors flex items-center gap-1"
              >
                  <MessageSquare size={16} /> Feedback
              </button>
              <Link to="/demo" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                Ver Ejemplo
              </Link>
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                Inicia Sesión <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 -mr-2 text-slate-600 hover:text-blue-600 transition-colors"
                aria-label="Menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl animate-fade-in-down">
            <div className="px-4 py-6 flex flex-col gap-4">
               <button 
                 onClick={() => { setIsFeedbackOpen(true); setIsMenuOpen(false); }}
                 className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-50 text-slate-700 font-medium transition-colors"
               >
                 <MessageSquare className="w-5 h-5 text-yellow-500" />
                 Enviar Feedback
               </button>
               <Link 
                 to="/demo" 
                 className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                 onClick={() => setIsMenuOpen(false)}
               >
                 <Layout className="w-5 h-5 text-blue-500" />
                 Ver Ejemplo Real
               </Link>
               <div className="border-t border-slate-100 my-1"></div>
               <Link 
                 to="/login" 
                 className="flex items-center justify-center gap-2 w-full px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-md"
                 onClick={() => setIsMenuOpen(false)}
               >
                 Inicia Sesión
                 <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative pt-24 pb-16 lg:pt-32 lg:pb-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] sm:text-xs font-semibold mb-6 sm:mb-8 animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Fase Beta — 100% Gratuito
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-4 sm:mb-6 leading-tight max-w-4xl mx-auto">
              Tu Currículum <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Web + PDF</span>
              <span className="block sm:mt-2">listo en minutos.</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
              Crea un perfil profesional que destaque. Obtén tu propia página web (subdominio gratis) y un PDF optimizado para imprimir, todo desde un único lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 text-base sm:text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Rocket className="w-5 h-5" />
                Crear mi CV Gratis
              </Link>
              <Link 
                to="/demo" 
                className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 text-base sm:text-lg font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <Layout className="w-5 h-5" />
                Ver Ejemplo Real
              </Link>
            </div>

            {/* Hero Image / Mockup - Compound (Desktop + Mobile) */}
            <div className="mt-16 sm:mt-24 relative mx-auto max-w-6xl px-0 sm:px-4 flex flex-col items-center">
                
                {/* 1. Browser Mockup (Desktop View) - Shifted slightly left/top */}
                <div className="relative w-full max-w-5xl z-0 transform transition-transform hover:scale-[1.01] duration-500">
                    <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-xl sm:rounded-2xl blur opacity-20"></div>
                    <div className="relative bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden min-h-[350px] sm:min-h-[500px] flex flex-col">
                        {/* Browser Header */}
                        <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400"></div>
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="ml-2 sm:ml-4 bg-white rounded-md px-2 py-1 text-[10px] sm:text-xs text-slate-400 flex-1 text-center font-mono truncate shadow-sm">
                                cv-profesional.web.app/u/juan-diego
                            </div>
                        </div>
                        {/* Browser Content */}
                        <div className="flex-1 bg-slate-50 p-3 sm:p-10 overflow-hidden relative">
                             {/* Abstract CV Structure */}
                             <div className="max-w-3xl mx-auto bg-white shadow-sm border border-slate-200 rounded-lg p-4 sm:p-8 transform scale-100 sm:scale-105 origin-top opacity-80 blur-[0.5px] lg:opacity-100 lg:blur-0 transition-all">
                                 <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
                                     <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-slate-200 shrink-0 mx-auto sm:mx-0"></div>
                                     <div className="flex-1 space-y-2 sm:space-y-3 text-center sm:text-left">
                                         <div className="h-5 sm:h-6 bg-slate-800 w-3/4 mx-auto sm:mx-0 rounded"></div>
                                         <div className="h-3 sm:h-4 bg-blue-500 w-1/2 mx-auto sm:mx-0 rounded"></div>
                                         <div className="h-12 sm:h-16 bg-slate-100 w-full rounded mt-2 hidden sm:block"></div>
                                     </div>
                                 </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                                     <div className="col-span-1 space-y-3 sm:space-y-4 hidden sm:block">
                                         <div className="h-4 bg-slate-200 w-1/3 rounded"></div>
                                         <div className="h-2 bg-slate-100 w-full rounded"></div>
                                         <div className="h-2 bg-slate-100 w-2/3 rounded"></div>
                                         <div className="h-2 bg-slate-100 w-4/5 rounded"></div>
                                     </div>
                                     <div className="col-span-1 sm:col-span-2 space-y-4 sm:space-y-6">
                                         <div className="space-y-3">
                                             <div className="h-4 sm:h-5 bg-slate-200 w-1/3 sm:w-1/4 rounded mx-auto sm:mx-0"></div>
                                             <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-100">
                                                 <div className="h-3 sm:h-4 bg-slate-300 w-1/2 rounded mb-2"></div>
                                                 <div className="h-2 sm:h-3 bg-slate-200 w-1/4 rounded mb-2"></div>
                                                 <div className="h-2 bg-slate-100 w-full rounded"></div>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                    
                    {/* Badge for Desktop Browser - Positioned relative to Browser */}
                    <div className="flex absolute -bottom-4 left-4 sm:bottom-8 sm:left-8 bg-white p-3 rounded-xl shadow-xl border border-slate-200 items-center justify-center gap-3 animate-bounce-slow z-20 scale-90 sm:scale-100">
                         <div className="bg-green-100 p-1.5 rounded-full text-green-600 shrink-0">
                             <CheckCircle2 className="w-5 h-5" />
                         </div>
                         <div className="text-left">
                             <p className="text-sm font-bold text-slate-800 leading-tight">Perfil en línea</p>
                             <p className="text-xs text-slate-500">Optimizado para todos</p>
                         </div>
                     </div>
                </div>

                {/* 2. Phone Mockup (Mobile View) - Positioned Over/Next */}
                <div className="relative mt-8 lg:mt-0 lg:absolute lg:-right-8 lg:-bottom-12 z-20 w-64 sm:w-72 bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-800 rotate-0 lg:-rotate-6 hover:rotate-0 transition-transform duration-500">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-slate-900 rounded-b-xl z-20"></div>
                    <div className="bg-white w-full h-[450px] sm:h-[500px] rounded-[2rem] overflow-hidden relative border border-slate-300">
                        {/* Status Bar */}
                        <div className="h-8 bg-slate-50 w-full flex justify-between items-center px-6 pt-1">
                             <div className="text-[10px] font-bold text-slate-800">9:41</div>
                             <div className="flex gap-1">
                                 <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                                 <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                             </div>
                        </div>
                        {/* App Content */}
                        <div className="p-4 bg-slate-50 h-full relative">
                            {/* Mobile CV Layout */}
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-4 text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 mx-auto mb-3 shadow-md"></div>
                                <div className="h-4 bg-slate-800 w-3/4 mx-auto rounded mb-2"></div>
                                <div className="h-3 bg-blue-100 text-blue-600 w-1/2 mx-auto rounded text-[10px] flex items-center justify-center font-bold">Desarrollador Web</div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-20 bg-white rounded-xl shadow-sm border border-slate-100 p-3">
                                    <div className="h-3 bg-slate-200 w-1/3 rounded mb-2"></div>
                                    <div className="h-2 bg-slate-100 w-full rounded mb-1"></div>
                                </div>
                                <div className="h-20 bg-white rounded-xl shadow-sm border border-slate-100 p-3">
                                    <div className="h-3 bg-slate-200 w-1/3 rounded mb-2"></div>
                                    <div className="h-2 bg-slate-100 w-full rounded mb-1"></div>
                                </div>
                            </div>
                            
                            {/* Floating "Visible to Recruiters" Badge - INSIDE Phone as requested */}
                            <div className="absolute bottom-6 left-4 right-4 bg-slate-800/95 backdrop-blur-sm p-3 rounded-xl shadow-lg flex items-center justify-center gap-3 z-30 animate-fade-in-up border border-slate-700">
                                <div className="bg-green-500/20 p-1.5 rounded-full text-green-400 shrink-0">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-medium text-slate-200">Visible para reclutadores</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
      </div>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 px-2">Todo lo que necesitas para destacar</h2>
                <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base px-2">Deja de luchar con Word. Nuestra plataforma está diseñada para que te concentres en tu contenido, nosotros nos encargamos del diseño y la tecnología.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 px-2 sm:px-0">
                <FeatureCard 
                    icon={<Globe className="w-6 h-6 text-blue-600" />}
                    title="Web Personal"
                    description="Tu propio enlace (subdominio) para compartir en LinkedIn, WhatsApp o correo. Accesible 24/7."
                />
                <FeatureCard 
                    icon={<Download className="w-6 h-6 text-indigo-600" />}
                    title="PDF Optimizado"
                    description="Genera un PDF limpio y profesional listo para imprimir o enviar a reclutadores ATS-friendly."
                />
                <FeatureCard 
                    icon={<Edit3 className="w-6 h-6 text-cyan-600" />}
                    title="Edición Fácil"
                    description="Actualiza tu experiencia, proyectos o habilidades en segundos desde cualquier dispositivo."
                />
                <FeatureCard 
                    icon={<Share2 className="w-6 h-6 text-emerald-600" />}
                    title="Dominio Gratis"
                    description="Olvídate de pagar hosting o dominio. Nosotros alojamos tu perfil profesional gratis."
                />
            </div>
        </div>
      </section>

      {/* Social Proof / Why Us */}
      <section className="py-16 sm:py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
              <div className="absolute -top-24 -left-24 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-blue-500 blur-3xl"></div>
              <div className="absolute -bottom-24 -right-24 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-cyan-500 blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="w-full md:w-1/2 text-center md:text-left">
                  <h2 className="text-2xl sm:text-3xl sm:text-4xl font-bold mb-6">Diseñado para crecer contigo</h2>
                  <ul className="space-y-4 inline-block text-left">
                      <ListItem>Sin marcas de agua molestas.</ListItem>
                      <ListItem>Plantillas limpias y modernas.</ListItem>
                      <ListItem>Optimizado para móviles.</ListItem>
                      <ListItem>Soporte para fotos de perfil y redes sociales.</ListItem>
                  </ul>
              </div>
              <div className="w-full md:w-1/2 bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-700">
                  <h3 className="text-xl font-semibold mb-4 text-blue-400 flex items-center gap-2">
                    <Rocket className="w-5 h-5" /> 
                    ¿Por qué es gratis?
                  </h3>
                  <p className="text-slate-300 mb-4 text-sm sm:text-base leading-relaxed">
                      Estamos en fase de lanzamiento (Beta). Queremos que pruebes la herramienta y nos des tu opinión.
                  </p>
                  <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                    <p className="text-slate-400 text-xs text-justify">
                        * En el futuro, podríamos añadir funciones premium (como analíticas o dominios personalizados .com), pero tu CV básico siempre será accesible.
                    </p>
                  </div>
              </div>
          </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 sm:py-24 bg-blue-600 px-4">
          <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8">¿Listo para impulsar tu carrera?</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    to="/login" 
                    className="px-8 py-4 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:bg-slate-50 hover:scale-105 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Crear mi CV Ahora
                  </Link>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-8 sm:py-12 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
              <p className="mb-2">&copy; {new Date().getFullYear()} CV Profesional. Todos los derechos reservados.</p>
              <p className="text-xs mb-4">Desarrollado con ❤️ por <a href="https://cv-profesional.web.app/p/juandiegoarchila" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Juan Diego Archila León</a></p>
              
              <button 
                  onClick={() => setIsFeedbackOpen(true)}
                  className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-blue-600 transition-colors px-3 py-1 rounded-full hover:bg-slate-100"
              >
                  <MessageSquare className="w-3 h-3" />
                  Reportar error o enviar sugerencia
              </button>
          </div>
      </footer>

    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all group text-left sm:text-center flex flex-col sm:items-center">
        <div className="mb-4 bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform shrink-0">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
        </div>
    </div>
);

const ListItem = ({ children }) => (
    <li className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 shrink-0 mt-0.5" />
        <span className="text-slate-200 text-base sm:text-lg">{children}</span>
    </li>
);

export default LandingPage;
