import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getArticulosByCategoria } from '@/lib/localStorage';
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

  // ... resto del componente igual que antes