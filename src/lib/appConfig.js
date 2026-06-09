// Configuración simple de la app — reemplaza todo el choclo de Base44

const STORAGE_KEY = 'prenatal_move_config';

// Leer/guardar config en localStorage
const getConfig = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
};

const setConfig = (config) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

// Exportar valores de config (sin magia de URL params de Base44)
export const appConfig = {
  // Si necesitás algún flag de feature, acá va
  get: (key, defaultValue = null) => {
    const cfg = getConfig();
    return cfg[key] ?? defaultValue;
  },
  set: (key, value) => {
    const cfg = getConfig();
    cfg[key] = value;
    setConfig(cfg);
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};

// Helper simple para leer un query param (si realmente lo necesitás para algo)
export const getQueryParam = (paramName, defaultValue = null) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName) || defaultValue;
};