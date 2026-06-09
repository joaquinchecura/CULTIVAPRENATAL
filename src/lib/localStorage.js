import { initializeDataSync, RUTINAS, ARTICULOS, EJERCICIOS } from '@/data';

const STORAGE_KEY = 'prenatal_move_data';

// Inicializar al importar
initializeDataSync();

// Leer datos
const getData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initializeDataSync();
  } catch {
    return initializeDataSync();
  }
};

// Guardar datos
const setData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Perfil
export const getProfile = () => getData().profile;
export const saveProfile = (profile) => {
  const data = getData();
  data.profile = profile;
  setData(data);
};

// Sesiones
export const getSessions = () => getData().sessions || [];
export const addSession = (session) => {
  const data = getData();
  const newSession = { 
    ...session, 
    id: Date.now().toString(), 
    fecha_inicio: session.fecha_inicio || new Date().toISOString(),
    created_by: session.created_by || 'local_user'
  };
  data.sessions = [...(data.sessions || []), newSession];
  setData(data);
  return newSession;
};
export const updateSession = (id, updates) => {
  const data = getData();
  data.sessions = data.sessions.map(s => s.id === id ? { ...s, ...updates } : s);
  setData(data);
};

// Diario
export const getDiario = () => getData().diario || [];
export const addDiarioEntry = (entry) => {
  const data = getData();
  const newEntry = { ...entry, id: Date.now().toString(), fecha: entry.fecha || new Date().toISOString() };
  data.diario = [...(data.diario || []), newEntry];
  setData(data);
  return newEntry;
};

// Rutinas (ahora desde JSON, no editable por usuario)
export const getRutinas = () => RUTINAS;
export const getRutinaById = (id) => RUTINAS.find(r => r.id === id);

// Ejercicios (desde JSON)
export const getEjerciciosByRutina = (rutinaId) => EJERCICIOS.filter(e => e.rutina_id === rutinaId);

// Artículos (desde JSON)
export const getArticulos = () => ARTICULOS;
export const getArticulosByCategoria = (categoria) => ARTICULOS.filter(a => a.categoria === categoria && a.activo);

// Favoritos (sí son del usuario)
export const getFavorites = () => getData().favorites || [];
export const toggleFavorite = (routineId) => {
  const data = getData();
  const favs = new Set(data.favorites || []);
  if (favs.has(routineId)) favs.delete(routineId);
  else favs.add(routineId);
  data.favorites = [...favs];
  setData(data);
  return data.favorites;
};

// Reset todo
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
  initializeDataSync(); // Recrear con datos por defecto
};