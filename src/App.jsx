import { useEffect } from 'react'
import { SignIn } from '@clerk/clerk-react'
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'

import { AuthProvider, useAuth } from '@/lib/AuthContext'
import { loadData, initializeData } from '@/data'
import PageNotFound from './lib/PageNotFound'
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
  const { isLoadingAuth, isLoadingPublicSettings, isAuthenticated } = useAuth();

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

  // Si no está autenticada, mostrar SignIn de Clerk
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">🌸</span>
            </div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">Cultiva PreNatal</h1>
            <p className="text-muted-foreground text-sm mt-1">Tu compañera de ejercicio seguro</p>
          </div>
          <SignIn 
            routing="hash"
            signUpUrl="/sign-up"
            afterSignInUrl="/"
            appearance={{
              elements: {
                card: "shadow-card border border-border rounded-2xl bg-card",
                headerTitle: "font-serif text-xl font-semibold",
                formButtonPrimary: "bg-primary hover:bg-primary/90 rounded-xl",
                footerActionLink: "text-primary",
              }
            }}
          />
        </div>
      </div>
    );
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