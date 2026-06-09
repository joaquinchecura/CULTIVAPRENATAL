import { createContext, useState, useContext, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { getToken: clerkGetToken } = useClerkAuth();
  const { signOut, openSignIn } = useClerk();

  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Simular carga de settings públicos (antes venían de Base44)
    const timer = setTimeout(() => {
      setIsLoadingPublicSettings(false);
      setAuthChecked(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const logout = (shouldRedirect = true) => {
    if (shouldRedirect) {
      signOut({ redirectUrl: window.location.href });
    } else {
      signOut();
    }
  };

  const navigateToLogin = () => {
    openSignIn();
  };

  const getToken = async () => {
    try {
      return await clerkGetToken();
    } catch {
      return null;
    }
  };

  const user = clerkUser || null;
  const isAuthenticated = !!isSignedIn;
  const isLoadingAuth = !isLoaded;

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      authChecked,
      logout,
      navigateToLogin,
      getToken,
      // Mantener compatibilidad con componentes que usen checkUserAuth/checkAppState
      checkUserAuth: () => Promise.resolve(),
      checkAppState: () => Promise.resolve(),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};