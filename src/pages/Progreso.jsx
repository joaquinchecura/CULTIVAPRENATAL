import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSessions, getDiario, addDiarioEntry } from '@/data';
import { useUserProfile } from '@/hooks/useUserProfile';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trophy, Clock, CheckCircle2, BookOpen } from 'lucide-react';

const LOGROS = [
  { id: 'primer_trimestre', nombre: 'Primer trimestre activo', emoji: '🌱', desc: 'Completa 10 rutinas en el primer trimestre', meta: 10 },
  { id: 'suelo_pelvico', nombre: 'Experta en suelo pélvico', emoji: '🌸', desc: 'Completa 20 rutinas de suelo pélvico', meta: 20 },
  { id: 'preparada', nombre: 'Preparada para el parto', emoji: '🤱', desc: 'Completa el plan de preparación al parto', meta: 5 },
  { id: 'postparto', nombre: 'Recuperación post-parto', emoji: '💪', desc: 'Completa tu primera rutina post-parto', meta: 1 },
];

export default function Progreso() {
  const { profile, semanaActual } = useUserProfile();
  const [sesiones, setSesiones] = useState([]);
  const [diarios, setDiarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tab, setTab] = useState('calendario');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const s = getSessions();
      const d = getDiario();
      setSesiones(s.filter(x => x.completada));
      setDiarios(d);
    } catch (e) {
      console.error('Error cargando datos:', e);
    } finally {
      setLoading(false);
    }
  };

  const diasDelMes = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const tieneSesion = (dia) => sesiones.some(s => s.fecha_inicio && isSameDay(parseISO(s.fecha_inicio), dia));

  const stats = {
    total: sesiones.length,
    minutos: sesiones.reduce((sum, s) => sum + (s.duracion_real_minutos || 0), 0),
    bien: sesiones.filter(s => s.sensacion_post === 'bien').length,
  };

  const getBienestaCurve = () => {
    return sesiones.slice(-7).map(s => ({
      d: s.fecha_inicio ? format(parseISO(s.fecha_inicio), 'EEE', { locale: es }) : '',
      v: s.sensacion_post === 'bien' ? 3 : s.sensacion_post === 'regular' ? 2 : 1,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-green-50 to-background px-6 pt-14 pb-4">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Mi Progreso</h1>
        <p className="text-muted-foreground text-sm mt-1">Tu viaje de bienestar</p>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-2">
        <div className="flex bg-muted rounded-xl p-1">
          {[{ id: 'calendario', label: 'Calendario' }, { id: 'logros', label: 'Logros' }, { id: 'diario', label: 'Diario' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${tab === t.id ? 'bg-card shadow-card text-foreground' : 'text-muted-foreground'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 mt-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { icon: CheckCircle2, label: 'Rutinas', value: stats.total, color: 'text-primary' },
            { icon: Clock, label: 'Minutos', value: stats.minutos, color: 'text-accent' },
            { icon: BookOpen, label: 'Días activa', value: new Set(sesiones.map(s => s.fecha_inicio?.split('T')[0])).size, color: 'text-secondary' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-card rounded-2xl p-3 text-center shadow-card border border-border">
              <Icon size={18} className={`${color} mx-auto mb-1`} />
              <div className="font-serif text-2xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* Calendario */}
        {tab === 'calendario' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl p-4 border border-border shadow-card">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))}
                className="p-2 rounded-full hover:bg-muted transition-all">←</button>
              <h3 className="font-serif font-semibold text-foreground capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </h3>
              <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))}
                className="p-2 rounded-full hover:bg-muted transition-all">→</button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                <div key={d} className="text-xs text-muted-foreground font-medium py-1">{d}</div>
              ))}
              {/* Empty cells for first week */}
              {Array.from({ length: (diasDelMes[0].getDay() + 6) % 7 }).map((_, i) => <div key={`e${i}`} />)}
              {diasDelMes.map(dia => {
                const activo = tieneSesion(dia);
                const esHoy = isSameDay(dia, new Date());
                return (
                  <div key={dia.toString()}
                    className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
                      activo ? 'bg-primary text-white' : esHoy ? 'ring-2 ring-primary text-primary' : 'text-foreground'
                    }`}>
                    {format(dia, 'd')}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-3 justify-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-primary rounded-full inline-block" /> Día activo</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-primary rounded-full inline-block" /> Hoy</span>
            </div>
          </motion.div>
        )}

        {/* Logros */}
        {tab === 'logros' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {LOGROS.map((logro, i) => {
              const progreso = Math.min(stats.total, logro.meta);
              const desbloqueado = progreso >= logro.meta;
              return (
                <motion.div key={logro.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`bg-card rounded-2xl p-4 border shadow-card transition-all duration-300 ${desbloqueado ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`text-3xl ${desbloqueado ? '' : 'grayscale opacity-50'}`}>{logro.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{logro.nombre}</h4>
                        {desbloqueado && <Trophy size={14} className="text-amber-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{logro.desc}</p>
                      <div className="mt-2">
                        <div className="h-1.5 bg-border rounded-full">
                          <div className="h-full bg-primary rounded-full transition-all duration-1000"
                            style={{ width: `${(progreso / logro.meta) * 100}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{progreso} / {logro.meta}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Diario */}
        {tab === 'diario' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <DiarioEntry onSave={loadData} semanaActual={semanaActual} />
            {diarios.map((entry, i) => (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-4 border border-border shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {entry.fecha && format(parseISO(entry.fecha), "d 'de' MMMM", { locale: es })}
                  </span>
                  <span className="text-xl">{entry.estado_animo === 'bien' ? '😊' : entry.estado_animo === 'regular' ? '😐' : '😣'}</span>
                </div>
                {entry.entrada_texto && <p className="text-sm text-foreground leading-relaxed">{entry.entrada_texto}</p>}
                {entry.sintomas?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.sintomas.map(s => <span key={s} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{s}</span>)}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DiarioEntry({ onSave, semanaActual }) {
  const [texto, setTexto] = useState('');
  const [mood, setMood] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!texto.trim() && !mood) return;
    setSaving(true);
    try {
      addDiarioEntry({
        fecha: format(new Date(), 'yyyy-MM-dd'),
        entrada_texto: texto,
        estado_animo: mood,
        semana_gestacion: semanaActual,
      });
      setTexto('');
      setMood('');
      onSave();
    } catch (e) {
      console.error('Error guardando diario:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
      <h4 className="font-serif font-semibold text-foreground mb-3">Añadir entrada de hoy</h4>
      <div className="flex gap-2 mb-3">
        {[{ v: 'bien', e: '😊' }, { v: 'regular', e: '😐' }, { v: 'con_molestias', e: '😣' }].map(({ v, e }) => (
          <button key={v} onClick={() => setMood(v)}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xl transition-all ${mood === v ? 'border-primary scale-110' : 'border-border'}`}>
            {e}
          </button>
        ))}
      </div>
      <textarea
        value={texto}
        onChange={e => setTexto(e.target.value)}
        placeholder="¿Cómo te has sentido hoy? ¿Algo que recordar?"
        className="w-full h-20 p-3 bg-muted/50 rounded-xl border border-border text-sm resize-none focus:outline-none focus:border-primary transition-all"
      />
      <button onClick={handleSave} disabled={saving || (!texto.trim() && !mood)}
        className="mt-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all">
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  );
}
