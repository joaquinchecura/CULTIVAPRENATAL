import { useState, useEffect } from 'react';
import { getProfile, saveProfile } from '@/data';

export function useUserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = () => {
    const p = getProfile();
    setProfile(p);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const calcularSemana = (profile) => {
    if (!profile) return null;
    let semana = null;
    if (profile.fecha_ultima_menstruacion) {
      const fum = new Date(profile.fecha_ultima_menstruacion);
      const hoy = new Date();
      const dias = Math.floor((hoy - fum) / (1000 * 60 * 60 * 24));
      semana = Math.floor(dias / 7);
    } else if (profile.fecha_probable_parto) {
      const fpp = new Date(profile.fecha_probable_parto);
      const hoy = new Date();
      const diasRestantes = Math.floor((fpp - hoy) / (1000 * 60 * 60 * 24));
      semana = 40 - Math.floor(diasRestantes / 7);
    }
    return semana && semana > 0 && semana <= 42 ? semana : null;
  };

  const getTrimestre = (semana) => {
    if (!semana) return null;
    if (semana <= 12) return 1;
    if (semana <= 27) return 2;
    if (semana <= 40) return 3;
    return null;
  };

  const semanaActual = calcularSemana(profile);
  const trimestre = getTrimestre(semanaActual);

  const updateProfile = (newProfile) => {
    saveProfile(newProfile);
    setProfile(newProfile);
  };

  return { 
    profile, 
    loading, 
    semanaActual, 
    trimestre, 
    refetch: fetchProfile,
    updateProfile 
  };
}