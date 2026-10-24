import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSessions, saveProfile } from '@/data';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/lib/AuthContext';
import { Save, AlertCircle, Baby, Phone, Bell, Shield, FileDown, LogOut, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import WeeklyActivityChart from '@/components/WeeklyActivityChart';

const COMPLICACIONES = [
  'Diabetes gestacional', 'Preeclampsia', 'Placenta previa', 'Anemia',
  'Hipotiroidismo', 'Embarazo de alto riesgo', 'Cardiopatía',
];

// Helper para fechas
const formatToInputDate = (dateString) => {
  if (!dateString) return '';
  try { return dateString.split('T')[0]; } catch { return ''; }
};

export default function Perfil() {
  const { profile, loading, refetch, semanaActual, trimestre, updateProfile, isSaving } = useUserProfile();
  const { logout } = useAuth();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState('embarazo');
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [sesiones, setSesiones] = useState([]);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  useEffect(() => {
    try { setSesiones(getSessions() || []); } catch (e) {}
  }, []);

  const handleSave = async () => {
    if (!form) return;
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error al guardar', error);
    }
  };

  const toggleComplicacion = (c) => {
    setForm(f => ({
      ...f,
      complicaciones: f?.complicaciones?.includes(c)
        ? f.complicaciones.filter(x => x !== c)
        : [...(f?.complicaciones || []), c]
    }));
  };

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleDescargarPDF = async () => {
    setGenerandoPDF(true);
    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF();
      
      // --- CONFIGURACIÓN DE COLORES Y FUENTES ---
      const primaryColor = [97, 140, 86]; 
      const textColor = [60, 60, 60]; 
      
      // --- CABECERA ---
      doc.setFont('times', 'bold'); 
      doc.setFontSize(24);
      doc.setTextColor(...primaryColor);
      doc.text('Cultiva PreNatal', 14, 25);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Informe de Actividad Prenatal', 14, 32);
      
      const fechaHoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.text(`Generado el: ${fechaHoy}`, 196, 25, { align: 'right' });

      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(14, 38, 196, 38);

      // --- DATOS DE LA PACIENTE ---
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...textColor);
      doc.text('Datos de la paciente', 14, 50);
      
      autoTable(doc, {
        startY: 55,
        margin: { left: 14 },
        head: [['Campo', 'Detalle']],
        body: [
          ['Nombre completo', form.nombre || 'No registrado'],
          ['Semana de gestación', semanaActual ? `${semanaActual} semanas` : 'No calculada'],
          ['Trimestre actual', trimestre ? `${trimestre}º Trimestre` : 'No calculado'],
          ['Autorización médica', form.autorizacion_medica === 'si' ? 'Sí, autorizada' : 'No / Pendiente'],
        ],
        theme: 'plain',
        styles: { font: 'helvetica', fontSize: 10, textColor: textColor, cellPadding: 4 },
        headStyles: { font: 'helvetica', fontStyle: 'bold', fillColor: primaryColor, textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 243] },
      });

      // --- HISTORIAL DE ACTIVIDAD ---
      const currentY = doc.lastAutoTable.finalY + 15;
      
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...textColor);
      doc.text('Resumen de Actividad', 14, currentY);
      
      const completadas = sesiones.filter(s => s.completada);
      const totalMinutos = sesiones.reduce((sum, s) => sum + (s.duracion_real_minutos || 0), 0);
      
      if (completadas.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Aún no hay rutinas completadas registradas.', 14, currentY + 10);
      } else {
        autoTable(doc, {
          startY: currentY + 5,
          margin: { left: 14 },
          head: [['Fecha', 'Rutina', 'Duración', 'Sensación']],
          body: completadas.slice(0, 20).map(s => [
            s.fecha_inicio ? s.fecha_inicio.split('T')[0] : 'N/A',
            s.rutina_nombre || 'Rutina',
            `${s.duracion_real_minutos || 0} min`,
            s.sensacion_post || '-'
          ]),
          theme: 'striped',
          styles: { font: 'helvetica', fontSize: 9, textColor: textColor, cellPadding: 3 },
          headStyles: { font: 'helvetica', fontStyle: 'bold', fillColor: [120, 130, 120], textColor: 255 },
          alternateRowStyles: { fillColor: [250, 250, 250] },
        });
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.text(`Total de rutinas completadas: ${completadas.length}`, 14, finalY);
        doc.text(`Total de minutos de ejercicio: ${totalMinutos} min`, 14, finalY + 6);
      }

      // --- PIE DE PÁGINA (Disclaimer) ---
      const pageHeight = doc.internal.pageSize.height;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.text(
        'Este informe complementa pero no reemplaza el cuidado médico profesional. Consulte siempre con su matrona o ginecólogo.', 
        14, pageHeight - 15, 
        { maxWidth: 180 }
      );

      doc.save(`CultivaPreNatal_Informe_${form.nombre || 'Paciente'}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error('Error generando PDF:', e);
    } finally {
      setGenerandoPDF(false);
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      profile: localStorage.getItem('prenatal_profile'),
      sessions: localStorage.getItem('prenatal_sessions'),
      diario: localStorage.getItem('prenatal_diario'),
      rutinas: localStorage.getItem('prenatal_rutinas'),
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CultivaPreNatal_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData.profile) localStorage.setItem('prenatal_profile', importedData.profile);
        if (importedData.sessions) localStorage.setItem('prenatal_sessions', importedData.sessions);
        if (importedData.diario) localStorage.setItem('prenatal_diario', importedData.diario);
        if (importedData.rutinas) localStorage.setItem('prenatal_rutinas', importedData.rutinas);
        
        alert('Datos importados con éxito. La app se reiniciará.');
        window.location.reload();
      } catch (error) {
        alert('Archivo inválido. Asegúrate de que sea un backup de Cultiva PreNatal.');
      }
    };
    reader.readAsText(file);
  };

  const getTrimestreLabel = () => {
    if (!trimestre) return '';
    return { 1: 'Primer trimestre', 2: 'Segundo trimestre', 3: 'Tercer trimestre' }[trimestre] || '';
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const sections = [
    { id: 'embarazo', label: 'Embarazo', icon: Baby },
    { id: 'medico', label: 'Médico', icon: Shield },
    { id: 'contactos', label: 'Contactos', icon: Phone },
    { id: 'ajustes', label: 'Ajustes', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-rose-dust/20 to-background px-6 pt-14 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-3xl">🌸</span>
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">{form.nombre || 'Mi perfil'}</h1>
            {semanaActual && (
              <p className="text-muted-foreground text-sm">Semana {semanaActual} · {getTrimestreLabel()}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 mt-2">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {sections.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setSection(id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 ${
                section === id ? 'bg-primary text-white border-primary' : 'bg-card border-border text-muted-foreground'
              }`}>
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6 mt-4 space-y-4">

        {section === 'embarazo' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-card rounded-2xl p-5 border border-border shadow-card space-y-4">
              <h3 className="font-serif text-base font-semibold text-foreground">Información del embarazo</h3>

              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Tu nombre</Label>
                <Input value={form.nombre || ''} onChange={e => update('nombre', e.target.value)}
                  className="h-12 rounded-xl border-border" placeholder="Tu nombre" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Fecha de última menstruación (FUM)</Label>
                <Input type="date" value={formatToInputDate(form.fecha_ultima_menstruacion)}
                  onChange={e => update('fecha_ultima_menstruacion', e.target.value)}
                  className="h-12 rounded-xl border-border" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Fecha probable de parto (FPP)</Label>
                <Input type="date" value={formatToInputDate(form.fecha_probable_parto)}
                  onChange={e => update('fecha_probable_parto', e.target.value)}
                  className="h-12 rounded-xl border-border" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Tipo de embarazo</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: 'unico', l: '👶 Único' }, { v: 'multiple', l: '👶👶 Múltiple' }].map(({ v, l }) => (
                    <button key={v} onClick={() => update('tipo_embarazo', v)}
                      className={`h-12 rounded-xl border-2 text-sm font-medium transition-all duration-300 ${form.tipo_embarazo === v ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {semanaActual && (
                <div className="bg-primary/10 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-foreground font-medium">Semana actual calculada</span>
                  <span className="font-serif text-xl font-bold text-primary">{semanaActual}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {section === 'medico' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-card rounded-2xl p-5 border border-border shadow-card space-y-4">
              <h3 className="font-serif text-base font-semibold text-foreground">Validación médica</h3>
              <p className="text-sm text-muted-foreground">¿Tu médico te autorizó hacer ejercicio?</p>

              <div className="space-y-2">
                {[
                  { v: 'si', l: '✅ Sí, estoy autorizada' },
                  { v: 'pendiente', l: '🕐 Aún no he consultado' },
                  { v: 'no', l: '❌ Mi médico indicó no hacer ejercicio' },
                ].map(({ v, l }) => (
                  <button key={v} onClick={() => update('autorizacion_medica', v)}
                    className={`w-full p-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all duration-300 ${form.autorizacion_medica === v ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground'}`}>
                    {l}
                  </button>
                ))}
              </div>

              {form.autorizacion_medica === 'no' && (
                <div className="p-3 bg-warm-alert/10 border border-warm-alert/30 rounded-xl flex items-start gap-2">
                  <AlertCircle size={16} className="text-warm-alert shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground">Tendrás acceso solo al contenido educativo hasta obtener autorización médica.</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Fecha última consulta prenatal</Label>
                <Input type="date" value={formatToInputDate(form.fecha_ultima_consulta)}
                  onChange={e => update('fecha_ultima_consulta', e.target.value)}
                  className="h-12 rounded-xl border-border" />
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
              <h3 className="font-serif text-base font-semibold text-foreground mb-3">Complicaciones declaradas</h3>
              <p className="text-xs text-muted-foreground mb-3">Información privada para adaptar tus rutinas</p>
              <div className="flex flex-wrap gap-2">
                {COMPLICACIONES.map(c => (
                  <button key={c} onClick={() => toggleComplicacion(c)}
                    className={`px-3 py-1.5 rounded-full border text-xs transition-all duration-300 ${form.complicaciones?.includes(c) ? 'border-warm-alert bg-warm-alert/10 text-warm-alert' : 'border-border text-muted-foreground'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {section === 'contactos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-card rounded-2xl p-5 border border-border shadow-card space-y-4">
              <h3 className="font-serif text-base font-semibold text-foreground">Contacto médico</h3>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Nombre de tu matrona/médico</Label>
                <Input value={form.contacto_matrona_nombre || ''} onChange={e => update('contacto_matrona_nombre', e.target.value)}
                  className="h-12 rounded-xl border-border" placeholder="Dra. Ana García" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Teléfono de emergencia médica</Label>
                <Input type="tel" value={form.contacto_matrona_telefono || ''} onChange={e => update('contacto_matrona_telefono', e.target.value)}
                  className="h-12 rounded-xl border-border" placeholder="+34 600 000 000" />
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-card space-y-4">
              <h3 className="font-serif text-base font-semibold text-foreground">Contacto de confianza</h3>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Nombre</Label>
                <Input value={form.contacto_emergencia_nombre || ''} onChange={e => update('contacto_emergencia_nombre', e.target.value)}
                  className="h-12 rounded-xl border-border" placeholder="Mi pareja / familiar" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Teléfono</Label>
                <Input type="tel" value={form.contacto_emergencia_telefono || ''} onChange={e => update('contacto_emergencia_telefono', e.target.value)}
                  className="h-12 rounded-xl border-border" placeholder="+34 600 000 001" />
              </div>
            </div>
          </motion.div>
        )}

        {section === 'ajustes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-card rounded-2xl p-5 border border-border shadow-card space-y-4">
              <h3 className="font-serif text-base font-semibold text-foreground">Recordatorios</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Notificaciones activas</p>
                  <p className="text-xs text-muted-foreground">Recordatorios de rutinas</p>
                </div>
                <Switch checked={form.notificaciones_activas || false}
                  onCheckedChange={v => update('notificaciones_activas', v)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Hora preferida para recordatorios</Label>
                <Input type="time" value={form.recordatorio_hora || '09:00'} onChange={e => update('recordatorio_hora', e.target.value)}
                  className="h-12 rounded-xl border-border" />
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Modo oscuro</p>
                  <p className="text-xs text-muted-foreground">Cambiar apariencia</p>
                </div>
                <Switch checked={form.modo_oscuro || false} onCheckedChange={v => update('modo_oscuro', v)} />
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-card space-y-4 mt-4">
              <h3 className="font-serif text-base font-semibold text-foreground">Copia de seguridad</h3>
              <p className="text-xs text-muted-foreground">Guarda tu progreso en tu móvil o cámbialo de dispositivo.</p>
              
              <div className="flex gap-2">
                <button onClick={handleExportData} className="flex-1 bg-primary/10 text-primary rounded-xl py-2.5 font-semibold text-sm transition-all hover:bg-primary/20 flex items-center justify-center gap-2">
                  <FileDown size={16} /> Exportar
                </button>
                <label className="flex-1 bg-secondary/10 text-secondary-foreground rounded-xl py-2.5 font-semibold text-sm transition-all hover:bg-secondary/20 flex items-center justify-center gap-2 cursor-pointer">
                  <Upload size={16} /> Importar
                  <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                </label>
              </div>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <p className="text-xs text-muted-foreground text-center">🔒 Tus datos médicos son privados y nunca se comparten con terceros.</p>
            </div>
          </motion.div>
        )}

        <WeeklyActivityChart sesiones={sesiones} />

        <button onClick={handleDescargarPDF} disabled={generandoPDF}
          className="w-full h-14 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-500 bg-accent text-white hover:bg-accent/90 disabled:opacity-60">
          <FileDown size={18} />
          {generandoPDF ? 'Generando informe...' : 'Descargar informe PDF'}
        </button>

        <button onClick={handleSave} disabled={saving}
          className={`w-full h-14 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-500 ${
            saved ? 'bg-moss text-white' : 'bg-primary text-white hover:bg-primary/90'
          }`}>
          <Save size={18} />
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>

        {/* Botón de Cerrar Sesión movido al final de todo */}
        <button
          onClick={() => logout()}
          className="w-full h-14 mt-8 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-500 bg-destructive/10 text-destructive hover:bg-destructive/20"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}