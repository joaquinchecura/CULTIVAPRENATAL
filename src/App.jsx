import { useEffect } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'

import { AuthProvider, useAuth } from '@/lib/AuthContext'
import { loadData, initializeData } from '@/data'
import PageNotFound from './lib/PageNotFound'
import UserNotRegisteredError from '@/components/UserNotRegisteredError'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Rutinas from './pages/Rutinas'
import RutinaActiva from './pages/RutinaActiva'
import Aprende from './pages/Aprende'
import Progreso from './pages/Progreso'
import Perfil from './pages/Perfil'
import Onboarding from './pages/Onboarding'

const queryClientInstance = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY")
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-serif text-primary text-lg">Cultiva PreNatal</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rutinas" element={<Rutinas />} />
        <Route path="/rutina/:id" element={<RutinaActiva />} />
        <Route path="/aprende" element={<Aprende />} />
        <Route path="/progreso" element={<Progreso />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  useEffect(() => {
    loadData().then(() => {
      initializeData();
    });
  }, []);

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ClerkProvider>
  )
}

export default App