import { createContext, useState, useContext, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoadingAuth: true,
  isLoadingPublicSettings: true,
  authError: null,
  authChecked: false,
  logout: () => {},
  navigateToLogin: () => {},
  getToken: async () => null,
  checkUserAuth: () => Promise.resolve(),
  checkAppState: () => Promise.resolve(),
});

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { getToken: clerkGetToken } = useClerkAuth();
  const { signOut, openSignIn } = useClerk();

  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingPublicSettings(false);
      setAuthChecked(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const logout = (shouldRedirect = true) => {
    if (shouldRedirect) {
      // Redirigir a la raíz después del logout
      signOut({ redirectUrl: window.location.origin });
    } else {
      // Sin redirección — la app mostrará SignIn automáticamente
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
      authError: null,
      authChecked,
      logout,
      navigateToLogin,
      getToken,
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