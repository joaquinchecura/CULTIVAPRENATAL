import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, saveProfile } from '@/data';
import { differenceInWeeks, parseISO, isValid } from 'date-fns';

export function useUserProfile() {
  const queryClient = useQueryClient();

  // 1. Query para obtener el perfil
  const { data: profile, isLoading: loading, refetch } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => getProfile(),
    staleTime: Infinity, // No recargar automáticamente a menos que cambie
  });

  // 2. Mutación para guardar el perfil
  const { mutateAsync: updateProfile, isPending: isSaving } = useMutation({
    mutationFn: (newProfile) => saveProfile(newProfile),
    onSuccess: (data) => {
      // Actualizamos la caché para que toda la app reaccione
      queryClient.setQueryData(['userProfile'], data);
    },
  });

  // 3. Cálculos derivados (Semana y Trimestre)
  let semanaActual = null;
  let trimestre = null;

  if (profile?.fecha_ultima_menstruacion) {
    const fum = parseISO(profile.fecha_ultima_menstruacion);
    if (isValid(fum)) {
      const semanas = differenceInWeeks(new Date(), fum);
      semanaActual = semanas > 0 ? semanas : 0;
      
      if (semanaActual <= 12) trimestre = 1;
      else if (semanaActual <= 27) trimestre = 2;
      else if (semanaActual <= 40) trimestre = 3;
    }
  }

  return {
    profile,
    loading,
    isSaving,
    refetch,
    updateProfile,
    semanaActual,
    trimestre,
  };
}