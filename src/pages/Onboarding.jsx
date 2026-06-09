import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { saveProfile } from '@/lib/localStorage';
import { ChevronRight, Baby, Heart, Stethoscope, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const objetivos = [
  { id: 'suelo_pelvico', label: 'Suelo pélvico', emoji: '🌸' },
  { id: 'alivio_dolor', label: 'Alivio de dolores', emoji: '💆' },
  { id: 'preparacion_parto', label: 'Preparación al parto', emoji: '🤱' },
  { id: 'energia', label: 'Energía y ánimo', emoji: '✨' },
  { id: 'movilidad', label: 'Movilidad suave', emoji: '🌿' },
  { id: 'respiracion', label: 'Respiración', emoji: '🌬️' },
];

const steps = [
  { icon: Baby, title: '¿Cómo te llamas?' },
  { icon: Heart, title: 'Tu embarazo' },
  { icon: Stethoscope, title: 'Autorización médica' },
  { icon: Bell, title: '¿Qué te gustaría trabajar?' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    nombre: '',
    fecha_ultima_menstruacion: '',
    autorizacion_medica: '',
    objetivos: [],
    recordatorio_hora: '09:00',
    onboarding_completado: true,
    notificaciones_activas: true,
  });

  const toggleObjetivo = (id) => {
    setData(prev => ({
      ...prev,
      objetivos: prev.objetivos.includes(id)
        ? prev.objetivos.filter(o => o !== id)
        : [...prev.objetivos, id]
    }));
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    setSaving(true);
    try {
      saveProfile(data);
      navigate('/');
    } catch (e) {
      console.error('Error guardando perfil:', e);
    } finally {
      setSaving(false);
    }
  };

  const canNext = () => {
    if (step === 0) return data.nombre.trim().length > 0;
    if (step === 1) return data.fecha_ultima_menstruacion;
    if (step === 2) return data.autorizacion_medica;
    return true;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <span className="font-serif text-lg font-semibold text-foreground">PreNatal Move</span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-primary' : 'bg-border'
              } ${i === step ? 'flex-[2]' : 'flex-1'}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-sm text-muted-foreground mb-1">Paso {step + 1} de {steps.length}</p>
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-8">
              {steps[step].title}
            </h1>

            {/* Step 0: Nombre */}
            {step === 0 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">Bienvenida a Cultiva PreNatal. Estamos aquí para acompañarte en este camino especial. 🌸</p>
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Tu nombre</Label>
                  <Input
                    value={data.nombre}
                    onChange={e => setData(p => ({ ...p, nombre: e.target.value }))}
                    placeholder="Ej: María"
                    className="h-14 text-lg border-border rounded-xl bg-card focus:border-primary"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Step 1: Embarazo */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Fecha de última menstruación (FUM)</Label>
                  <Input
                    type="date"
                    value={data.fecha_ultima_menstruacion}
                    onChange={e => setData(p => ({ ...p, fecha_ultima_menstruacion: e.target.value }))}
                    className="h-14 border-border rounded-xl bg-card focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground">Usaremos esto para calcular tu semana de gestación</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Tipo de embarazo</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ v: 'unico', l: '👶 Único' }, { v: 'multiple', l: '👶👶 Múltiple' }].map(({ v, l }) => (
                      <button
                        key={v}
                        onClick={() => setData(p => ({ ...p, tipo_embarazo: v }))}
                        className={`h-14 rounded-xl border-2 font-medium transition-all duration-300 ${
                          data.tipo_embarazo === v
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card text-muted-foreground'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Autorización médica */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">Para tu seguridad y la del bebé, es importante saber si tu médico te ha autorizado a hacer ejercicio.</p>
                <div className="space-y-3">
                  {[
                    { v: 'si', l: '✅ Sí, mi médico me autorizó', desc: 'Tendrás acceso completo a todas las rutinas' },
                    { v: 'pendiente', l: '🕐 Aún no he consultado', desc: 'Te recordaremos consultarlo pronto' },
                    { v: 'no', l: '❌ Mi médico me indicó no hacer ejercicio', desc: 'Solo tendrás acceso a contenido educativo' },
                  ].map(({ v, l, desc }) => (
                    <button
                      key={v}
                      onClick={() => setData(p => ({ ...p, autorizacion_medica: v }))}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                        data.autorizacion_medica === v
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="font-medium text-foreground">{l}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Objetivos */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">Selecciona todo lo que te gustaría trabajar (puedes elegir varios):</p>
                <div className="grid grid-cols-2 gap-3">
                  {objetivos.map(({ id, label, emoji }) => (
                    <button
                      key={id}
                      onClick={() => toggleObjetivo(id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                        data.objetivos.includes(id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="text-2xl mb-1">{emoji}</div>
                      <div className="text-sm font-medium text-foreground">{label}</div>
                    </button>
                  ))}
                </div>
                <div className="space-y-2 mt-4">
                  <Label className="text-foreground font-medium">Hora preferida para rutinas</Label>
                  <Input
                    type="time"
                    value={data.recordatorio_hora}
                    onChange={e => setData(p => ({ ...p, recordatorio_hora: e.target.value }))}
                    className="h-12 border-border rounded-xl bg-card"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-auto px-6 pb-12">
        <Button
          onClick={handleNext}
          disabled={!canNext() || saving}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold text-base transition-all duration-500"
        >
          {saving ? 'Guardando...' : step === steps.length - 1 ? '¡Comenzar mi viaje! 🌸' : 'Continuar'}
          {!saving && <ChevronRight size={20} className="ml-2" />}
        </Button>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="w-full mt-3 text-muted-foreground text-sm text-center py-2">
            ← Volver
          </button>
        )}
      </div>
    </div>
  );
}
