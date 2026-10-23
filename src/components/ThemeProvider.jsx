import { useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function ThemeProvider({ children }) {
  const { profile } = useUserProfile();

  useEffect(() => {
    if (profile?.modo_oscuro) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile?.modo_oscuro]);

  return <>{children}</>;
}