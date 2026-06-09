import { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react'
import { getProfile } from './localStorage'

const AuthContext = createContext({
  user: null,
  isLoadingAuth: true,
  isLoadingPublicSettings: false,
  isAuthenticated: false,
  authError: null,
  navigateToLogin: () => {},
  logout: () => {},
  getToken: async () => null,
})

export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken: clerkGetToken } = useClerkAuth()
  const { signOut, openSignIn } = useClerk()
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingPublicSettings(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const navigateToLogin = () => openSignIn()

  const logout = () => signOut()

  const getToken = async () => {
    try {
      return await clerkGetToken()
    } catch {
      return null
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoadingAuth: !isLoaded,
        isLoadingPublicSettings,
        isAuthenticated: !!isSignedIn,
        authError: null,
        navigateToLogin,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)