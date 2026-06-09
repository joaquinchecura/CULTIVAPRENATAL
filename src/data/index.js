// Datos cargados desde public/data/ vía fetch
let rutinasData = [];
let articulosData = [];
let ejerciciosData = [];
let dataLoaded = false;

// Cargar datos desde public/data/
export const loadData = async () => {
  if (dataLoaded) return;

  try {
    const [rutinasRes, articulosRes, ejerciciosRes] = await Promise.all([
      fetch('/data/rutinas.json').then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} rutinas.json`);
        return r.json();
      }),
      fetch('/data/articulos.json').then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} articulos.json`);
        return r.json();
      }),
      fetch('/data/ejercicios.json').then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} ejercicios.json`);
        return r.json();
      }),
    ]);

    rutinasData = Array.isArray(rutinasRes) ? rutinasRes : [];
    articulosData = Array.isArray(articulosRes) ? articulosRes : [];
    ejerciciosData = Array.isArray(ejerciciosRes) ? ejerciciosRes : [];
    dataLoaded = true;

    console.log('✅ Datos cargados:', {
      rutinas: rutinasData.length,
      articulos: articulosData.length,
      ejercicios: ejerciciosData.length
    });
  } catch (e) {
    console.error('❌ Error cargando datos:', e);
    // Dejar arrays vacíos para que la app no rompa
    rutinasData = [];
    articulosData = [];
    ejerciciosData = [];
    dataLoaded = true;
  }
};

// Inicializar localStorage con datos por defecto
export const initializeData = () => {
  const STORAGE_KEY = 'prenatal_move_data';

  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    const parsed = JSON.parse(existing);
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

// ===== CRUD LOCALSTORAGE =====

const getStorageData = () => {
  const raw = localStorage.getItem('prenatal_move_data');
  return raw ? JSON.parse(raw) : initializeData();
};

const saveStorageData = (data) => {
  localStorage.setItem('prenatal_move_data', JSON.stringify(data));
};

// Perfil
export const getProfile = () => getStorageData().profile;
export const saveProfile = (profile) => {
  const data = getStorageData();
  data.profile = { ...data.profile, ...profile, updatedAt: new Date().toISOString() };
  saveStorageData(data);
  return data.profile;
};

// Sesiones
export const getSessions = () => getStorageData().sessions || [];
export const addSession = (session) => {
  const data = getStorageData();
  const newSession = {
    ...session,
    id: `ses-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  data.sessions = [newSession, ...(data.sessions || [])];
  saveStorageData(data);
  return newSession;
};
export const updateSession = (id, updates) => {
  const data = getStorageData();
  data.sessions = (data.sessions || []).map(s => s.id === id ? { ...s, ...updates } : s);
  saveStorageData(data);
};

// Diario
export const getDiario = () => getStorageData().diario || [];
export const addDiarioEntry = (entry) => {
  const data = getStorageData();
  const newEntry = {
    ...entry,
    id: `dia-${Date.now()}`,
    fecha: new Date().toISOString(),
  };
  data.diario = [newEntry, ...(data.diario || [])];
  saveStorageData(data);
  return newEntry;
};

// Favoritos
export const getFavorites = () => getStorageData().favorites || [];
export const toggleFavorite = (rutinaId) => {
  const data = getStorageData();
  const favs = new Set(data.favorites || []);
  if (favs.has(rutinaId)) {
    favs.delete(rutinaId);
  } else {
    favs.add(rutinaId);
  }
  data.favorites = Array.from(favs);
  saveStorageData(data);
  return data.favorites;
};

// ===== HELPERS DE BÚSQUEDA (leen desde localStorage para que funcionen inmediatamente) =====

export const getRutinas = () => getStorageData().rutinas || [];
export const getRutinaById = (id) => (getStorageData().rutinas || []).find(r => r.id === id);
export const getEjerciciosByRutina = (rutinaId) => (getStorageData().ejercicios || []).filter(e => e.rutina_id === rutinaId);
export const getArticulos = () => getStorageData().articulos || [];
export const getArticulosByCategoria = (categoria) => (getStorageData().articulos || []).filter(a => a.categoria === categoria && a.activo);
export const getRutinasByTrimestre = (trimestre) => {
  const rutinas = getStorageData().rutinas || [];
  if (trimestre === 'postparto') return rutinas.filter(r => r.trimestre === 'postparto');
  return rutinas.filter(r => r.trimestre === String(trimestre) || r.trimestre === 'todos');
};

// Exportar datos crudos (después de loadData)
export { rutinasData, articulosData, ejerciciosData };

// ===== ALIAS PARA COMPATIBILIDAD CON src/lib/localStorage.js =====
export const RUTINAS = rutinasData;
export const ARTICULOS = articulosData;
export const EJERCICIOS = ejerciciosData;
// ===== HELPERS ADICIONALES =====

export const getRutinas = () => rutinasData;
export const getArticulos = () => articulosData;

// Versión síncrona de initializeData para localStorage.js
export const initializeData = () => {
    const STORAGE_KEY = 'prenatal_move_data';
  
    const existing = localStorage.getItem(STORAGE_KEY);
    const parsed = existing ? JSON.parse(existing) : null;
  
    const data = {
      profile: parsed?.profile || null,
      sessions: parsed?.sessions || [],
      diario: parsed?.diario || [],
      favorites: parsed?.favorites || [],
      rutinas: rutinasData.length > 0 ? rutinasData : (parsed?.rutinas || []),
      articulos: articulosData.length > 0 ? articulosData : (parsed?.articulos || []),
      ejercicios: ejerciciosData.length > 0 ? ejerciciosData : (parsed?.ejercicios || []),
    };
  
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  };