import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getArticulosByCategoria } from '@/data';
import { BookOpen, Stethoscope } from 'lucide-react';

const CATEGORIA_POR_TRIMESTRE = {
  1: ['beneficios', 'seguridad', 'respiracion'],
  2: ['suelo_pelvico', 'nutricion', 'beneficios'],
  3: ['preparacion_parto', 'suelo_pelvico', 'descanso'],
};

const CATEGORIA_LABELS = {
  beneficios: 'Beneficios',
  seguridad: 'Seguridad',
  suelo_pelvico: 'Suelo pélvico',
  respiracion: 'Respiración',
  nutricion: 'Nutrición',
  descanso: 'Descanso',
};

const CATEGORIA_COLORS = {
  beneficios: 'bg-primary/10 text-primary',
  seguridad: 'bg-warm-alert/10 text-warm-alert',
  suelo_pelvico: 'bg-accent/10 text-accent-foreground',
  respiracion: 'bg-sky-blue/10 text-sky-blue',
  nutricion: 'bg-secondary/10 text-secondary',
  descanso: 'bg-moss/10 text-moss',
};

export default function ConsejoDelDia({ trimestre, semanaActual }) {
  const [articulo, setArticulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    cargarConsejo();
  }, [trimestre]);

  const cargarConsejo = () => {
    setLoading(true);
    try {
      const categorias = CATEGORIA_POR_TRIMESTRE[trimestre] || ['beneficios', 'seguridad'];
      const categoria = categorias[Math.floor(Math.random() * categorias.length)];
      const articulos = getArticulosByCategoria(categoria);
      
      if (articulos.length > 0) {
        setArticulo(articulos[Math.floor(Math.random() * articulos.length)]);
      }
    } catch (e) {
      console.error('Error cargando consejo:', e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (!articulo) return null;

  const preview = articulo.contenido?.slice(0, 120);
  const tieneMas = articulo.contenido?.length > 120;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-card rounded-2xl p-5 shadow-card border border-border"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen size={15} className="text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Consejo del día</p>
            {semanaActual && <p className="text-[10px] text-muted-foreground">Semana {semanaActual}</p>}
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${CATEGORIA_COLORS[articulo.categoria] || 'bg-muted text-muted-foreground'}`}>
          {CATEGORIA_LABELS[articulo.categoria] || articulo.categoria}
        </span>
      </div>

      <h3 className="font-serif text-base font-semibold text-foreground mb-2">{articulo.titulo}</h3>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {expandido ? articulo.contenido : preview}{!expandido && tieneMas && '...'}
      </p>

      {tieneMas && (
        <button onClick={() => setExpandido(e => !e)} className="mt-2 text-xs font-semibold text-primary">
          {expandido ? 'Ver menos' : 'Leer más'}
        </button>
      )}

      {articulo.medico_revisor && (
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Stethoscope size={11} className="text-moss" />
          <span>Revisado por {articulo.medico_revisor}</span>
        </div>
      )}
    </motion.div>
  );
}