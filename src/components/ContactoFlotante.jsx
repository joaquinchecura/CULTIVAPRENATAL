import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Instagram, Youtube } from 'lucide-react';

const CONTACTOS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    color: 'bg-green-500 hover:bg-green-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.127 1.532 5.862L.054 23.5l5.75-1.505A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.875 9.875 0 01-5.031-1.374l-.361-.214-3.413.894.91-3.317-.235-.38A9.845 9.845 0 012.118 12C2.118 6.52 6.52 2.118 12 2.118S21.882 6.52 21.882 12 17.48 21.882 12 21.882z"/>
      </svg>
    ),
    href: 'https://wa.me/cultivafitness',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:opacity-90',
    icon: <Instagram className="w-5 h-5" />,
    href: 'https://instagram.com/cultivafitness',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    color: 'bg-red-500 hover:bg-red-600',
    icon: <Youtube className="w-5 h-5" />,
    href: 'https://youtube.com/@cultivafitness',
  },
];

export default function ContactoFlotante() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-card rounded-2xl shadow-elevated border border-border p-4 mb-1 w-52"
          >
            <p className="text-xs text-muted-foreground font-semibold mb-3 uppercase tracking-wide">
              Contacta con nosotros
            </p>
            <div className="flex flex-col gap-2">
              {CONTACTOS.map(({ id, label, color, icon, href }) => (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 text-white text-sm font-medium px-3 py-2.5 rounded-xl transition-all duration-200 active:scale-95 ${color}`}
                >
                  {icon}
                  {label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full bg-primary shadow-elevated flex items-center justify-center text-white transition-all duration-300 hover:bg-primary/90"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={24} />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle size={24} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}