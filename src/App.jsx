import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Onboarding from './pages/Onboarding';
import VerifyEmail from './pages/VerifyEmail';
import Messages from './pages/Messages';
import { useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Loader from './components/Loader';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" />;
  if (!user.emailVerified) return <Navigate to="/verify-email" />;
  
  return children;
};

// Componente para resolver Slugs o IDs
const PublicProfileResolver = () => {
    const { slug } = useParams();
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const resolveUser = async () => {
            if (!slug) {
                setLoading(false);
                return;
            }

            try {
                // 1. Intentar buscar en 'usernames' para ver si es un alias
                const usernameDoc = await getDoc(doc(db, 'usernames', slug.toLowerCase()));
                if (usernameDoc.exists()) {
                    setUserId(usernameDoc.data().uid);
                } else {
                    // 2. Si no es alias, asumir que es un UID directo (Legacy support)
                    setUserId(slug);
                }
            } catch (error) {
                console.error("Error resolving user:", error);
                setUserId(slug); // Fallback al slug original
            } finally {
                setLoading(false);
            }
        };

        resolveUser();
    }, [slug]);

    if (loading) return <Loader />;

    return (
        <DataProvider key={userId} userId={userId}>
            <Home />
        </DataProvider>
    );
};

function App() {
  return (
    <Router>
      <div className="w-full overflow-x-hidden relative">
        <Routes>
          {/* Landing Page Principal */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Demo y Ejemplo (CV de Juan Diego por defecto - DATOS ESTÁTICOS) */}
          <Route path="/demo" element={
            <DataProvider demoMode={true}>
                <Home />
            </DataProvider>
          } />

          <Route path="/login" element={<Login />} />
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <DataProvider>
                  <Onboarding />
                </DataProvider>
              </ProtectedRoute>
            } 
          />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <DataProvider>
                    <Admin />
                </DataProvider>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/messages" 
            element={
              <ProtectedRoute>
                  <Messages />
              </ProtectedRoute>
            } 
          />
          <Route path="/p/:slug" element={<PublicProfileResolver />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
