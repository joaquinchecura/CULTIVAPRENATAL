import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-card text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-primary">{payload[0].value} min</p>
        <p className="text-muted-foreground">{payload[1]?.value || 0} sesiones</p>
      </div>
    );
  }
  return null;
};

export default function WeeklyActivityChart({ sesiones }) {
  const hoy = new Date();

  const semanas = Array.from({ length: 4 }, (_, i) => {
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - (3 - i) * 7 - hoy.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    const sesSemana = sesiones.filter(s => {
      if (!s.fecha_inicio) return false;
      const d = new Date(s.fecha_inicio);
      return d >= inicioSemana && d <= finSemana;
    });

    const completadas = sesSemana.filter(s => s.completada);
    const minutos = completadas.reduce((acc, s) => acc + (s.duracion_real_minutos || 0), 0);

    const label = i === 3 ? 'Esta sem.' : `Sem. -${3 - i}`;

    return { semana: label, minutos, sesiones: completadas.length };
  });

  const maxMin = Math.max(...semanas.map(s => s.minutos), 10);

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
      <h3 className="font-serif text-base font-semibold text-foreground mb-1">Actividad semanal</h3>
      <p className="text-xs text-muted-foreground mb-4">Últimas 4 semanas · minutos de ejercicio completado</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={semanas} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="semana" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, maxMin + 5]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', radius: 8 }} />
          <Bar dataKey="minutos" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-around mt-3">
        {semanas.map(s => (
          <div key={s.semana} className="text-center">
            <p className="text-xs font-semibold text-foreground">{s.sesiones}</p>
            <p className="text-[10px] text-muted-foreground">sesiones</p>
          </div>
        ))}
      </div>
    </div>
  );
}