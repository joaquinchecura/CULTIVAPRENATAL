import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getArticulos } from '@/data';
import { Clock, User, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CATEGORIAS = [
  { id: 'todos', label: 'Todo', emoji: '📚' },
  { id: 'beneficios', label: 'Beneficios', emoji: '💪' },
  { id: 'seguridad', label: 'Seguridad', emoji: '🛡️' },
  { id: 'suelo_pelvico', label: 'Suelo pélvico', emoji: '🌸' },
  { id: 'respiracion', label: 'Respiración', emoji: '🌬️' },
  { id: 'nutricion', label: 'Nutrición', emoji: '🥗' },
  { id: 'descanso', label: 'Descanso', emoji: '😴' },
];

const CAT_COLORS = {
  beneficios: 'bg-green-50 text-green-700',
  seguridad: 'bg-red-50 text-red-700',
  suelo_pelvico: 'bg-pink-50 text-pink-700',
  respiracion: 'bg-blue-50 text-blue-700',
  nutricion: 'bg-amber-50 text-amber-700',
  descanso: 'bg-purple-50 text-purple-700',
};

export default function Aprende() {
  const [articulos, setArticulos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticulos();
  }, []);

  const loadArticulos = () => {
    try {
      const data = getArticulos();
      setArticulos(data.filter(a => a.activo !== false));
    } catch (e) {
      console.error('Error cargando artículos:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtrados = articulos.filter(a => filtro === 'todos' || a.categoria === filtro);

  if (selected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-card/90 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3 z-10">
          <button onClick={() => setSelected(null)} className="p-2 rounded-full hover:bg-muted transition-all">
            <ChevronRight size={20} className="text-foreground rotate-180" />
          </button>
          <span className="font-medium text-foreground line-clamp-1 flex-1">{selected.titulo}</span>
        </div>

        <div className="px-5 py-5">
          {selected.imagen_url && (
            <img src={selected.imagen_url} alt={selected.titulo} className="w-full h-52 object-cover rounded-2xl mb-5" />
          )}
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${CAT_COLORS[selected.categoria] || 'bg-muted text-muted-foreground'}`}>
            {CATEGORIAS.find(c => c.id === selected.categoria)?.emoji}
            <span className="ml-1 capitalize">{selected.categoria?.replace('_', ' ')}</span>
          </div>

          <h1 className="font-serif text-2xl font-semibold text-foreground mb-3">{selected.titulo}</h1>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-5">
            {selected.tiempo_lectura_minutos && (
              <span className="flex items-center gap-1"><Clock size={13} /> {selected.tiempo_lectura_minutos} min</span>
            )}
            {selected.medico_revisor && (
              <span className="flex items-center gap-1"><User size={13} /> {selected.medico_revisor}</span>
            )}
          </div>

          {selected.medico_revisor && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-5 flex items-center gap-2">
              <span className="text-sm font-medium text-primary">✓ Revisado por {selected.medico_revisor}</span>
              {selected.fecha_revision && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {format(new Date(selected.fecha_revision), "d MMM yyyy", { locale: es })}
                </span>
              )}
            </div>
          )}

          <div className="prose prose-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {selected.contenido}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-accent/20 to-background px-6 pt-14 pb-4">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Aprende</h1>
        <p className="text-muted-foreground text-sm mt-1">Contenido validado médicamente para tu embarazo</p>
      </div>

      {/* Filtros */}
      <div className="px-4 mt-2">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIAS.map(({ id, label, emoji }) => (
            <button key={id} onClick={() => setFiltro(id)}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-300 ${
                filtro === id ? 'bg-accent text-white border-accent' : 'bg-card border-border text-muted-foreground'
              }`}>
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 mt-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        )}

        {!loading && filtrados.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-muted-foreground">No hay artículos en esta categoría todavía</p>
          </div>
        )}

        {filtrados.map((art, i) => (
          <motion.div key={art.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => setSelected(art)}
            className="bg-card rounded-2xl overflow-hidden border border-border shadow-card cursor-pointer hover:shadow-elevated transition-all duration-500 active:scale-[0.98] flex gap-0">
            {art.imagen_url && (
              <img src={art.imagen_url} alt={art.titulo} className="w-28 h-28 object-cover shrink-0" />
            )}
            <div className="p-4 flex flex-col justify-between flex-1">
              <div>
                <div className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium mb-1 ${CAT_COLORS[art.categoria] || 'bg-muted text-muted-foreground'}`}>
                  {art.categoria?.replace('_', ' ')}
                </div>
                <h3 className="font-serif text-sm font-semibold text-foreground line-clamp-2">{art.titulo}</h3>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                {art.tiempo_lectura_minutos && <span className="flex items-center gap-0.5"><Clock size={11} /> {art.tiempo_lectura_minutos} min</span>}
                {art.medico_revisor && <span className="text-primary">✓ Validado</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}