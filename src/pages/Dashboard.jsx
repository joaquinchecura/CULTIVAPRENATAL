import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRutinas, getSessions } from '@/data';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Flame, Phone, Stethoscope, ChevronRight, Clock, Leaf } from 'lucide-react';
import ConsejoDelDia from '@/components/ConsejoDelDia';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TRIMESTRE_COLORS = {
  1: 'bg-green-100 text-green-700 border-green-200',
  2: 'bg-blue-100 text-blue-700 border-blue-200',
  3: 'bg-orange-100 text-orange-700 border-orange-200',
};

const MOODS = [
  { id: 'bien', emoji: '😊', label: 'Bien', color: 'bg-green-50 border-green-200' },
  { id: 'regular', emoji: '😐', label: 'Regular', color: 'bg-amber-50 border-amber-200' },
  { id: 'con_molestias', emoji: '😣', label: 'Con molestias', color: 'bg-red-50 border-red-200' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, loading, semanaActual, trimestre } = useUserProfile();
  const [rutinas, setRutinas] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [moodSeleccionado, setMoodSeleccionado] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!loading && !profile) navigate('/onboarding');
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (profile) loadData();
  }, [profile]);

  const loadData = () => {
    try {
      const r = getRutinas();
      const s = getSessions();
      setRutinas(r);
      setSesiones(s);
      calcularStreak(s);
    } catch (e) {
      console.error('Error cargando datos:', e);
    }
  };

  const calcularStreak = (sesiones) => {
    const completadas = sesiones.filter(s => s.completada);
    if (completadas.length === 0) return;
    const hoy = new Date();
    let streak = 0;
    let fecha = new Date(hoy);
    for (let i = 0; i < 30; i++) {
      const fechaStr = format(fecha, 'yyyy-MM-dd');
      const tieneSesion = completadas.some(s => s.fecha_inicio?.startsWith(fechaStr));
      if (tieneSesion) streak++;
      else if (i > 0) break;
      fecha.setDate(fecha.getDate() - 1);
    }
    setStreak(streak);
  };

  const getRutinaRecomendada = () => {
    if (!rutinas.length) return null;
    if (moodSeleccionado === 'con_molestias') return null;

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    if (moodSeleccionado === 'regular') {
      const resp = rutinas.filter(r => r.objetivo === 'respiracion');
      return pickRandom(resp.length ? resp : rutinas);
    }

    // Filtrar por semana y trimestre
    let filtradas = rutinas.filter(r => {
      const triOk = !trimestre || r.trimestre === String(trimestre) || r.trimestre === 'todos';
      const semMinOk = !r.semana_minima || !semanaActual || semanaActual >= r.semana_minima;
      const semMaxOk = !r.semana_maxima || !semanaActual || semanaActual <= r.semana_maxima;
      return triOk && semMinOk && semMaxOk;
    });

    if (!filtradas.length) filtradas = rutinas;
    return pickRandom(filtradas);
  };

  const rutinaRecomendada = getRutinaRecomendada();

  const handleMood = (mood) => {
    setMoodSeleccionado(mood);
  };

  const getTrimestreLabel = () => {
    if (!trimestre) return '';
    const labels = { 1: 'Primer trimestre', 2: 'Segundo trimestre', 3: 'Tercer trimestre' };
    return labels[trimestre] || '';
  };

  const getProgresoPorcentaje = () => {
    if (!semanaActual) return 0;
    return Math.min((semanaActual / 40) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 via-background to-accent/10 px-6 pt-14 pb-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-sm text-muted-foreground mb-1">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </p>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Hola {profile?.nombre || 'mamá'} 🌸
          </h1>
          {semanaActual && (
            <p className="text-muted-foreground mt-0.5">Semana <span className="font-semibold text-primary">{semanaActual}</span> de tu embarazo</p>
          )}
        </motion.div>

        {/* Progress Bar */}
        {semanaActual && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Semana 1</span>
              <span className={`font-semibold px-2 py-0.5 rounded-full border ${TRIMESTRE_COLORS[trimestre] || 'bg-muted'}`}>
                {getTrimestreLabel()}
              </span>
              <span>Semana 40</span>
            </div>
            <div className="h-3 bg-border rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgresoPorcentaje()}%` }}
                transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
            <div className="flex mt-1 justify-between">
              {[{ t: 'T1', w: 1 }, { t: 'T2', w: 13 }, { t: 'T3', w: 28 }].map(({ t, w }) => (
                <div key={t} className={`text-xs ${semanaActual >= w ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{t}</div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Streak */}
        {streak > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className="mt-4 inline-flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full">
            <Flame size={16} className="text-orange-500" />
            <span className="text-sm font-semibold text-orange-600">{streak} días seguidos cuidándote</span>
          </motion.div>
        )}
      </div>

      <div className="px-4 space-y-4 pb-4">
        {/* Mood Check */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-4">¿Cómo te sientes hoy?</h2>
          <div className="grid grid-cols-3 gap-3">
            {MOODS.map(({ id, emoji, label, color }) => (
              <button
                key={id}
                onClick={() => handleMood(id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${
                  moodSeleccionado === id ? color + ' border-opacity-100 scale-95' : 'border-border bg-muted/30'
                }`}
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>

          {moodSeleccionado === 'con_molestias' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3 bg-warm-alert/10 border border-warm-alert/30 rounded-xl">
              <p className="text-sm text-foreground font-medium mb-2">❤️ Te escuchamos. Descansa y consulta con tu médico.</p>
              {profile?.contacto_matrona_telefono && (
                <a href={`tel:${profile.contacto_matrona_telefono}`}
                  className="flex items-center gap-2 text-sm text-warm-alert font-semibold">
                  <Phone size={14} />
                  Llamar a {profile.contacto_matrona_nombre || 'tu matrona'}
                </a>
              )}
            </motion.div>
          )}

          {moodSeleccionado === 'regular' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3 bg-accent/10 border border-accent/20 rounded-xl">
              <p className="text-sm text-foreground">💙 Un ejercicio de respiración puede ayudarte a sentirte mejor.</p>
            </motion.div>
          )}
        </motion.div>

        {/* Rutina Recomendada */}
        {profile?.autorizacion_medica !== 'no' && rutinaRecomendada && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="font-serif text-lg font-semibold text-foreground mb-3 px-1">Rutina recomendada hoy</h2>
            <div
              onClick={() => navigate(`/rutina/${rutinaRecomendada.id}`)}
              className="bg-card rounded-2xl overflow-hidden shadow-card border border-border cursor-pointer hover:shadow-elevated transition-all duration-500 active:scale-[0.98]"
            >
              {/* Imagen - aspect-video para fotos 1408x768 */}
              <div className="relative aspect-video bg-gradient-to-br from-primary/30 to-accent/30">
                {rutinaRecomendada.imagen_url ? (
                  <img 
                    src={rutinaRecomendada.imagen_url} 
                    alt={rutinaRecomendada.nombre} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-60">🤰</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-moss text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Stethoscope size={11} />
                  Validado
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-serif text-xl font-semibold text-foreground">{rutinaRecomendada.nombre}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Clock size={14} />
                    <span>{rutinaRecomendada.duracion_minutos} minutos</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Leaf size={14} />
                    <span className="capitalize">{rutinaRecomendada.nivel_intensidad}</span>
                  </div>
                </div>
                <button className="mt-3 w-full bg-primary text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:bg-primary/90">
                  Comenzar rutina
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* No autorizada */}
        {profile?.autorizacion_medica === 'no' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl p-5 shadow-card border border-warm-alert/30">
            <p className="font-serif text-lg font-semibold text-foreground mb-2">📚 Modo educativo activo</p>
            <p className="text-muted-foreground text-sm">Tu médico indicó no hacer ejercicio por ahora. Puedes explorar nuestro contenido educativo.</p>
            <button onClick={() => navigate('/aprende')} className="mt-3 text-primary font-semibold text-sm">
              Ir a Aprende →
            </button>
          </motion.div>
        )}

        {/* Pendiente de autorización */}
        {profile?.autorizacion_medica === 'pendiente' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-accent/10 border border-accent/30 rounded-2xl p-4">
            <p className="text-sm text-foreground font-medium">💙 Recuerda consultar con tu médico sobre hacer ejercicio</p>
          </motion.div>
        )}

        {/* Consejo del día */}
        <ConsejoDelDia trimestre={trimestre} semanaActual={semanaActual} />

        {/* Recordatorio */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🌸</span>
          <div>
            <p className="text-sm font-medium text-foreground">Tu rutina de suelo pélvico te espera</p>
            <button onClick={() => navigate('/rutinas')} className="text-xs text-primary font-semibold mt-0.5">Ver rutinas →</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}