import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRutinas } from '@/data';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Clock, Leaf, Stethoscope, AlertTriangle } from 'lucide-react';

const TRIMESTRES = [
  { id: 'todos', label: 'Todos', color: 'bg-muted text-muted-foreground border-border' },
  { id: '1', label: 'T1 · 1-12 sem', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: '2', label: 'T2 · 13-27 sem', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: '3', label: 'T3 · 28-40 sem', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'postparto', label: 'Post-parto', color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

const OBJETIVOS = [
  { id: 'todos', label: 'Todos', emoji: '✨' },
  { id: 'suelo_pelvico', label: 'Suelo pélvico', emoji: '🌸' },
  { id: 'alivio_dolor', label: 'Alivio de dolor', emoji: '💆' },
  { id: 'preparacion_parto', label: 'Prep. al parto', emoji: '🤱' },
  { id: 'energia', label: 'Energía', emoji: '⚡' },
  { id: 'movilidad', label: 'Movilidad', emoji: '🌿' },
  { id: 'respiracion', label: 'Respiración', emoji: '🌬️' },
];

export default function Rutinas() {
  const navigate = useNavigate();
  const { profile, semanaActual, trimestre } = useUserProfile();
  const [rutinas, setRutinas] = useState([]);
  const [filtroTrimestre, setFiltroTrimestre] = useState('todos');
  const [filtroObjetivo, setFiltroObjetivo] = useState('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRutinas();
    if (trimestre) setFiltroTrimestre(String(trimestre));
  }, [trimestre]);

  const loadRutinas = () => {
    try {
      const data = getRutinas();
      setRutinas(data.filter(r => r.activa !== false));
    } catch (e) {
      console.error('Error cargando rutinas:', e);
    } finally {
      setLoading(false);
    }
  };

  const rutinasFiltradas = rutinas.filter(r => {
    const matchT = filtroTrimestre === 'todos' || r.trimestre === filtroTrimestre;
    const matchO = filtroObjetivo === 'todos' || r.objetivo === filtroObjetivo;
    return matchT && matchO;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-background px-6 pt-14 pb-4">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Rutinas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {semanaActual ? `Semana ${semanaActual} · Adaptadas para ti` : 'Ejercicios seguros y validados'}
        </p>
      </div>

      {/* Filtro Trimestre */}
      <div className="px-4 mt-2">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {TRIMESTRES.map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => setFiltroTrimestre(id)}
              className={`shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-300 ${
                filtroTrimestre === id ? color + ' scale-105' : 'bg-card border-border text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filtro Objetivo */}
        <div className="flex gap-2 overflow-x-auto pb-2 mt-2 no-scrollbar">
          {OBJETIVOS.map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => setFiltroObjetivo(id)}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-300 ${
                filtroObjetivo === id
                  ? 'bg-primary text-white border-primary scale-105'
                  : 'bg-card border-border text-muted-foreground'
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="px-4 pb-4 mt-3 space-y-4">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!loading && rutinasFiltradas.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-muted-foreground font-medium">No hay rutinas con estos filtros</p>
            <button onClick={() => { setFiltroTrimestre('todos'); setFiltroObjetivo('todos'); }}
              className="mt-3 text-primary font-semibold text-sm">
              Ver todas las rutinas
            </button>
          </div>
        )}

        {rutinasFiltradas.map((rutina, i) => (
          <motion.div
            key={rutina.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl overflow-hidden shadow-card border border-border cursor-pointer hover:shadow-elevated transition-all duration-500 active:scale-[0.98]"
            onClick={() => navigate(`/rutina/${rutina.id}`)}
          >
            {/* Imagen - aspect-video (16:9) para fotos 1408x768 */}
            <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20">
              {rutina.imagen_url ? (
                <img 
                  src={rutina.imagen_url} 
                  alt={rutina.nombre} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl opacity-50">
                    {{ suelo_pelvico: '🌸', alivio_dolor: '💆', preparacion_parto: '🤱', energia: '✨', movilidad: '🌿', respiracion: '🌬️' }[rutina.objetivo] || '🤰'}
                  </span>
                </div>
              )}
              {rutina.validacion_medica && (
                <div className="absolute top-3 right-3 bg-moss text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                  <Stethoscope size={10} />
                  Validado
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">{rutina.nombre}</h3>
              {rutina.descripcion && (
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{rutina.descripcion}</p>
              )}

              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Clock size={12} />
                  <span>{rutina.duracion_minutos} min</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Leaf size={12} />
                  <span className="capitalize">{rutina.nivel_intensidad}</span>
                </div>
                {rutina.medico_validador && (
                  <span className="text-xs text-moss">Dr/a. {rutina.medico_validador}</span>
                )}
              </div>

              {rutina.contraindicaciones?.length > 0 && (
                <div className="mt-3 p-2.5 bg-warm-alert/10 border border-warm-alert/20 rounded-lg flex items-start gap-2">
                  <AlertTriangle size={13} className="text-warm-alert shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground">{rutina.contraindicaciones[0]}</p>
                </div>
              )}

              <button className="mt-3 w-full bg-primary/10 text-primary rounded-xl py-2.5 font-semibold text-sm transition-all duration-300 hover:bg-primary/20">
                Ver rutina →
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}