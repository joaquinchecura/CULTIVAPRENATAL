import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSounds } from '@/hooks/useSounds';
import { Pause, Play, SkipForward, Info, X, ChevronLeft, AlertTriangle, Stethoscope, Check, Volume2, VolumeX } from 'lucide-react';
import { format } from 'date-fns';

const MOLESTIAS = ['Mareo', 'Dolor abdominal', 'Contracciones', 'Sangrado', 'Falta de aire', 'Ninguna'];

export default function RutinaActiva() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, semanaActual } = useUserProfile();

  const [rutina, setRutina] = useState(null);
  const [ejercicios, setEjercicios] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [showAlert, setShowAlert] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [sensacion, setSensacion] = useState('');
  const [molestias, setMolestias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(new Date());

  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const timerRef = useRef(null);
  const elapsedRef = useRef(null);
  const { playBeep, playBell } = useSounds();

  useEffect(() => {
    loadRutina();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(elapsedRef.current);
    };
  }, [id]);

  useEffect(() => {
    if (ejercicios.length > 0 && currentIdx < ejercicios.length) {
      const ej = ejercicios[currentIdx];
      setTimeLeft(ej.duracion_segundos || 60);
      setIsPlaying(false);
      checkAlerts(ej);
    }
  }, [currentIdx, ejercicios]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            handleNextExercise();
            return 0;
          }
          if (t <= 4 && soundsEnabled) playBeep();
          return t - 1;
        });
      }, 1000);
      elapsedRef.current = setInterval(() => setTotalElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      clearInterval(elapsedRef.current);
    }
    return () => {
      clearInterval(timerRef.current);
      clearInterval(elapsedRef.current);
    };
  }, [isPlaying]);

  const loadRutina = async () => {
    try {
      const [r, ejs] = await Promise.all([
        base44.entities.Rutina.filter({ id }),
        base44.entities.Ejercicio.filter({ rutina_id: id }),
      ]);
      const rutinaData = r[0] || null;
      setRutina(rutinaData);

      let ejerciciosFiltrados = (ejs || []).sort((a, b) => (a.orden || 0) - (b.orden || 0));
      // Filter exercises not suitable for current week
      if (semanaActual && semanaActual > 16) {
        ejerciciosFiltrados = ejerciciosFiltrados.filter(e => !e.semana_maxima || e.semana_maxima >= semanaActual);
      }
      setEjercicios(ejerciciosFiltrados);
      if (ejerciciosFiltrados[0]) setTimeLeft(ejerciciosFiltrados[0].duracion_segundos || 60);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  const checkAlerts = (ejercicio) => {
    if (!ejercicio?.alertas_especificas?.length) return;
    setShowAlert(ejercicio.alertas_especificas[0]);
    setTimeout(() => setShowAlert(null), 5000);
  };

  const handleNextExercise = () => {
    if (currentIdx < ejercicios.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setIsPlaying(false);
      setCompleted(true);
      if (soundsEnabled) playBell();
    }
  };

  const toggleMolestia = (m) => {
    setMolestias(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const handleFinish = async () => {
    try {
      await base44.entities.Sesion.create({
        rutina_id: id,
        rutina_nombre: rutina?.nombre,
        fecha_inicio: format(startTime, "yyyy-MM-dd'T'HH:mm:ss"),
        fecha_fin: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        duracion_real_minutos: Math.round(totalElapsed / 60),
        completada: true,
        sensacion_post: sensacion,
        molestias_reportadas: molestias,
        semana_gestacion: semanaActual,
      });
    } catch (e) {}
    navigate('/');
  };

  const currentEjercicio = ejercicios[currentIdx];
  const progress = currentEjercicio ? ((currentEjercicio.duracion_segundos - timeLeft) / currentEjercicio.duracion_segundos) * 100 : 0;
  const hasMolestias = molestias.some(m => ['Mareo', 'Dolor abdominal', 'Contracciones', 'Sangrado'].includes(m));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-background px-6 pt-14 pb-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">¡Rutina completada!</h1>
          <p className="text-muted-foreground mt-1">¡Bien hecho, mamá! 🌸 Cada movimiento cuenta.</p>
        </motion.div>

        <div className="space-y-4">
          <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
            <h3 className="font-semibold text-foreground mb-3">¿Cómo te sentiste?</h3>
            <div className="grid grid-cols-3 gap-3">
              {[{ v: 'bien', e: '😊', l: 'Bien' }, { v: 'regular', e: '😐', l: 'Regular' }, { v: 'con_molestias', e: '😣', l: 'Molestias' }].map(({ v, e, l }) => (
                <button key={v} onClick={() => setSensacion(v)}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all duration-300 ${sensacion === v ? 'border-primary bg-primary/10' : 'border-border'}`}>
                  <span className="text-2xl">{e}</span>
                  <span className="text-xs font-medium">{l}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
            <h3 className="font-semibold text-foreground mb-3">¿Tuviste alguna molestia?</h3>
            <div className="flex flex-wrap gap-2">
              {MOLESTIAS.map(m => (
                <button key={m} onClick={() => toggleMolestia(m)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition-all duration-300 ${molestias.includes(m) ? 'border-warm-alert bg-warm-alert/10 text-warm-alert' : 'border-border text-muted-foreground'}`}>
                  {m}
                </button>
              ))}
            </div>

            {hasMolestias && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-3 p-3 bg-warm-alert/10 border border-warm-alert/30 rounded-xl">
                <p className="text-sm text-foreground font-medium">❤️ Te recomendamos consultar con tu médico antes de continuar con ejercicio.</p>
              </motion.div>
            )}
          </div>

          <button onClick={handleFinish}
            className="w-full bg-primary text-white rounded-2xl py-4 font-semibold text-lg transition-all duration-300 hover:bg-primary/90">
            Guardar y terminar 🌿
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/50 transition-all">
          <ChevronLeft size={22} className="text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-serif text-base font-semibold text-foreground line-clamp-1">{rutina?.nombre}</h1>
          {semanaActual && <p className="text-xs text-muted-foreground">Semana {semanaActual}</p>}
        </div>
        <div className="text-xs text-muted-foreground">
          {currentIdx + 1} / {ejercicios.length}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="h-1 bg-border">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${((currentIdx) / ejercicios.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Alert Banner */}
      <AnimatePresence>
        {showAlert && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="mx-4 mt-3 p-3 bg-warm-alert/15 border border-warm-alert/30 rounded-xl flex items-start gap-2">
            <AlertTriangle size={15} className="text-warm-alert shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{showAlert}</p>
            <button onClick={() => setShowAlert(null)} className="ml-auto"><X size={14} className="text-muted-foreground" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ejercicio Visual */}
      <div className="flex-1 flex flex-col px-4 py-4">
        <AnimatePresence mode="wait">
          {currentEjercicio && (
            <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }} className="flex flex-col items-center">

              {/* Imagen ejercicio */}
              <div className="w-full h-52 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl overflow-hidden flex items-center justify-center mb-5">
                {currentEjercicio.imagen_url ? (
                  <img src={currentEjercicio.imagen_url} alt={currentEjercicio.nombre} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-7xl opacity-60">🤰</span>
                )}
              </div>

              {/* Nombre */}
              <h2 className="font-serif text-2xl font-semibold text-foreground text-center mb-2">{currentEjercicio.nombre}</h2>

              {/* Timer */}
              <div className="w-32 h-32 relative flex items-center justify-center mb-4">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                  <motion.circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                    strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                    transition={{ duration: 1 }} />
                </svg>
                <div className="text-center">
                  <div className="font-serif text-3xl font-bold text-foreground">{timeLeft}</div>
                  <div className="text-xs text-muted-foreground">seg</div>
                </div>
              </div>

              {/* Instrucciones */}
              <div className="bg-card rounded-2xl p-4 w-full border border-border shadow-card mb-4">
                <p className="text-foreground text-sm leading-relaxed text-center">{currentEjercicio.instrucciones}</p>
              </div>

              {/* Breathing reminder */}
              <p className="text-muted-foreground text-xs text-center mb-2">
                💨 Inhala al preparar · exhala al ejecutar · no aguantes la respiración
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="px-4 pb-8 pt-2 space-y-3">
        {/* Main controls */}
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => { setShowInfo(true); setIsPlaying(false); }}
            className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center shadow-card transition-all active:scale-95">
            <Info size={20} className="text-muted-foreground" />
          </button>

          <button onClick={() => setIsPlaying(p => !p)}
            className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-elevated transition-all active:scale-95 hover:bg-primary/90">
            {isPlaying
              ? <Pause size={32} className="text-white" />
              : <Play size={32} className="text-white ml-1" />}
          </button>

          <button onClick={handleNextExercise}
            className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center shadow-card transition-all active:scale-95">
            <SkipForward size={20} className="text-muted-foreground" />
          </button>

          <button onClick={() => setSoundsEnabled(s => !s)}
            className={`w-12 h-12 rounded-full border flex items-center justify-center shadow-card transition-all active:scale-95 ${soundsEnabled ? 'bg-card border-border' : 'bg-muted border-muted-foreground/30'}`}>
            {soundsEnabled
              ? <Volume2 size={20} className="text-primary" />
              : <VolumeX size={20} className="text-muted-foreground" />}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {isPlaying ? '⏸ Toca para pausar' : '▶️ Toca para comenzar'}
        </p>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setShowInfo(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md mx-auto bg-card rounded-t-3xl p-6 pb-10">
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope size={18} className="text-primary" />
                <h3 className="font-serif text-lg font-semibold">¿Por qué este ejercicio?</h3>
              </div>
              <p className="text-foreground leading-relaxed">
                {currentEjercicio?.beneficio_medico || 'Este ejercicio ha sido diseñado especialmente para tu etapa del embarazo, validado por profesionales médicos para garantizar tu seguridad y la del bebé.'}
              </p>
              <button onClick={() => setShowInfo(false)}
                className="mt-5 w-full bg-primary text-white rounded-xl py-3 font-semibold">
                Entendido, continuar 🌿
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}