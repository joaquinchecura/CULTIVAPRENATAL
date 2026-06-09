import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

// Normalize special characters to ASCII-safe equivalents for jsPDF Helvetica
function n(text) {
  if (!text) return '';
  return String(text)
    .replace(/á/g, 'a').replace(/Á/g, 'A')
    .replace(/é/g, 'e').replace(/É/g, 'E')
    .replace(/í/g, 'i').replace(/Í/g, 'I')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ú/g, 'u').replace(/Ú/g, 'U')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
    .replace(/¿/g, '').replace(/¡/g, '')
    .replace(/·/g, '-');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [profiles, sesiones] = await Promise.all([
      base44.entities.UserProfile.filter({ created_by: user.email }),
      base44.entities.Sesion.filter({ created_by: user.email }),
    ]);

    const profile = profiles[0] || {};

    const hoy = new Date();
    const hace7dias = new Date(hoy);
    hace7dias.setDate(hoy.getDate() - 6);
    hace7dias.setHours(0, 0, 0, 0);

    const sesionesSemana = sesiones.filter(s => {
      if (!s.fecha_inicio) return false;
      return new Date(s.fecha_inicio) >= hace7dias;
    });

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210;
    let y = 20;

    const addLine = (text, opts = {}) => {
      const { size = 11, bold = false, color = [60, 60, 60], indent = 20 } = opts;
      doc.setFontSize(size);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(...color);
      doc.text(n(text), indent, y);
      y += size * 0.5 + 3;
    };

    const addSeparator = () => {
      doc.setDrawColor(200, 200, 200);
      doc.line(20, y, W - 20, y);
      y += 6;
    };

    // Header
    doc.setFillColor(127, 176, 105);
    doc.rect(0, 0, W, 28, 'F');
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('PreNatal Move', 20, 13);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Informe Semanal de Actividad', 20, 22);
    const fechaStr = hoy.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(n(`Generado: ${fechaStr}`), W - 20, 22, { align: 'right' });
    y = 40;

    // Profile section
    addLine('DATOS DEL PERFIL', { size: 13, bold: true, color: [97, 140, 70] });
    addSeparator();
    addLine(`Nombre: ${profile.nombre || user.full_name || '-'}`);
    addLine(`Email: ${user.email || '-'}`);
    if (profile.fecha_ultima_menstruacion) addLine(`Fecha ultima menstruacion: ${profile.fecha_ultima_menstruacion}`);
    if (profile.fecha_probable_parto) addLine(`Fecha probable de parto: ${profile.fecha_probable_parto}`);

    if (profile.fecha_ultima_menstruacion) {
      const fum = new Date(profile.fecha_ultima_menstruacion);
      const semanas = Math.floor((hoy - fum) / (1000 * 60 * 60 * 24 * 7));
      if (semanas > 0 && semanas <= 45) {
        const trim = semanas <= 12 ? 'Primer' : semanas <= 27 ? 'Segundo' : 'Tercer';
        addLine(`Semana de gestacion: ${semanas} (${trim} trimestre)`);
      }
    }
    if (profile.tipo_embarazo) addLine(`Tipo de embarazo: ${profile.tipo_embarazo === 'unico' ? 'Unico' : 'Multiple'}`);
    if (profile.autorizacion_medica) {
      const auth = { si: 'Autorizada', no: 'No autorizada', pendiente: 'Pendiente' };
      addLine(`Autorizacion medica: ${auth[profile.autorizacion_medica] || '-'}`);
    }
    if (profile.complicaciones?.length) addLine(`Complicaciones: ${profile.complicaciones.join(', ')}`);
    y += 4;

    if (profile.contacto_matrona_nombre || profile.contacto_matrona_telefono) {
      addLine('CONTACTO MEDICO', { size: 13, bold: true, color: [97, 140, 70] });
      addSeparator();
      if (profile.contacto_matrona_nombre) addLine(`Matrona/Medico: ${profile.contacto_matrona_nombre}`);
      if (profile.contacto_matrona_telefono) addLine(`Telefono: ${profile.contacto_matrona_telefono}`);
      y += 4;
    }

    addLine('RESUMEN SEMANAL DE ACTIVIDAD', { size: 13, bold: true, color: [97, 140, 70] });
    addSeparator();

    const rangeLabel = `${hace7dias.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    addLine(`Periodo: ${rangeLabel}`);

    const completadas = sesionesSemana.filter(s => s.completada);
    const totalMin = completadas.reduce((acc, s) => acc + (s.duracion_real_minutos || 0), 0);
    addLine(`Sesiones completadas: ${completadas.length}`);
    addLine(`Sesiones iniciadas: ${sesionesSemana.length}`);
    addLine(`Tiempo total de ejercicio: ${totalMin} minutos`);
    y += 4;

    if (sesionesSemana.length === 0) {
      addLine('No se registraron sesiones esta semana.', { color: [150, 150, 150] });
    } else {
      addLine('DETALLE DE SESIONES', { size: 12, bold: true, color: [97, 140, 70] });
      y += 2;

      const byDay = {};
      sesionesSemana.forEach(s => {
        const d = s.fecha_inicio
          ? new Date(s.fecha_inicio).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
          : 'Sin fecha';
        if (!byDay[d]) byDay[d] = [];
        byDay[d].push(s);
      });

      for (const [dia, sesns] of Object.entries(byDay)) {
        if (y > 260) { doc.addPage(); y = 20; }
        addLine(dia, { size: 11, bold: true, color: [80, 80, 80] });
        sesns.forEach(s => {
          const estado = s.completada ? 'OK' : '-';
          const dur = s.duracion_real_minutos ? `${s.duracion_real_minutos} min` : '';
          const sensacion = s.sensacion_post ? ` - ${s.sensacion_post}` : '';
          addLine(`  [${estado}] ${s.rutina_nombre || 'Rutina'}${dur ? ' - ' + dur : ''}${sensacion}`, { size: 10, color: [100, 100, 100] });
          if (s.molestias_reportadas?.length) {
            addLine(`    Molestias: ${s.molestias_reportadas.join(', ')}`, { size: 9, color: [180, 80, 80] });
          }
        });
        y += 2;
      }
    }

    y = 280;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 160, 160);
    doc.text('PreNatal Move - Este informe complementa pero no reemplaza el cuidado medico profesional.', W / 2, y, { align: 'center' });

    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=informe-prenatal-${hoy.toISOString().slice(0, 10)}.pdf`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});