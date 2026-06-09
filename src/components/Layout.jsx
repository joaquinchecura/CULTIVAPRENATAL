import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, BookOpen, BarChart2, User, ListChecks, Phone } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import ContactoFlotante from '@/components/ContactoFlotante';
// Icon is used as a dynamic component below via destructuring from navItems

const navItems = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/rutinas', icon: ListChecks, label: 'Rutinas' },
  { path: '/aprende', icon: BookOpen, label: 'Aprende' },
  { path: '/progreso', icon: BarChart2, label: 'Progreso' },
  { path: '/perfil', icon: User, label: 'Perfil' },
];

export default function Layout() {
  const location = useLocation();
  const { profile } = useUserProfile();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isRutinaActiva = location.pathname.startsWith('/rutina/');

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto md:max-w-2xl lg:max-w-4xl xl:max-w-5xl relative md:px-8 lg:px-16">
      {/* Emergency Button */}
      {profile?.contacto_matrona_telefono && !isRutinaActiva && (
        <div className="fixed top-0 right-0 z-50 p-2">
          <a
            href={`tel:${profile.contacto_matrona_telefono}`}
            className="flex items-center gap-1 bg-warm-alert text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-elevated transition-all duration-500 hover:scale-105"
          >
            <Phone size={12} />
            <span>¿Molestias?</span>
          </a>
        </div>
      )}

      {/* Page Content */}
      <main className={`flex-1 overflow-y-auto ${!isRutinaActiva ? 'pb-24' : ''}`}>
        <Outlet />
      </main>

      {/* Medical Disclaimer */}
      {!isRutinaActiva && (
        <div className="px-4 py-1 text-center">
          <p className="text-xs text-muted-foreground leading-tight">
            Cultiva PreNatal complementa pero no reemplaza el cuidado médico
          </p>
        </div>
      )}

      {/* Contacto Flotante */}
      {!isRutinaActiva && <ContactoFlotante />}

      {/* Bottom Nav */}
      {!isRutinaActiva && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto bg-card border-t border-border safe-bottom z-50 shadow-elevated">
          <div className="flex">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all duration-500 ${
                  isActive(path)
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-500 ${isActive(path) ? 'bg-primary/10' : ''}`}>
                  <Icon size={20} strokeWidth={isActive(path) ? 2.5 : 1.5} />
                </div>
                <span className={`text-[10px] font-semibold transition-all duration-500 ${isActive(path) ? 'text-primary' : ''}`}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}