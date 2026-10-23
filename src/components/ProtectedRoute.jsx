import { Navigate, Outlet } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function ProtectedRoute() {
  const { profile, loading } = useUserProfile();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  // Si no hay perfil o el médico dijo que NO, bloqueamos el acceso
  if (profile?.autorizacion_medica === 'no') {
    return <Navigate to="/aprende" replace />;
  }

  return <Outlet />;
}