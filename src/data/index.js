import rutinasData from './rutinas.json';
import articulosData from './articulos.json';
import ejerciciosData from './ejercicios.json';

// Función para inicializar localStorage con los datos por defecto
export const initializeData = () => {
  const STORAGE_KEY = 'prenatal_move_data';
  
  // Solo inicializar si no hay datos previos
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    const parsed = JSON.parse(existing);
    // Si ya tiene datos, no sobreescribir (respetar perfil, sesiones, etc.)
    // Pero actualizar rutinas/articulos/ejercicios si cambiaron
    if (!parsed.rutinas || parsed.rutinas.length === 0) {
      parsed.rutinas = rutinasData;
    }
    if (!parsed.articulos || parsed.articulos.length === 0) {
      parsed.articulos = articulosData;
    }
    if (!parsed.ejercicios || parsed.ejercicios.length === 0) {
      parsed.ejercicios = ejerciciosData;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return parsed;
  }
  
  // Primera vez: crear todo
  const initialData = {
    profile: null,
    sessions: [],
    diario: [],
    favorites: [],
    rutinas: rutinasData,
    articulos: articulosData,
    ejercicios: ejerciciosData
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
};

// Exportar datos crudos para uso directo
export const RUTINAS = rutinasData;
export const ARTICULOS = articulosData;
export const EJERCICIOS = ejerciciosData;

// Helpers de búsqueda
export const getRutinaById = (id) => rutinasData.find(r => r.id === id);
export const getEjerciciosByRutina = (rutinaId) => ejerciciosData.filter(e => e.rutina_id === rutinaId);
export const getArticulosByCategoria = (categoria) => articulosData.filter(a => a.categoria === categoria && a.activo);
export const getRutinasByTrimestre = (trimestre) => rutinasData.filter(r => {
  if (trimestre === 'postparto') return r.trimestre === 'postparto';
  return r.trimestre === String(trimestre) || r.trimestre === 'todos';
});