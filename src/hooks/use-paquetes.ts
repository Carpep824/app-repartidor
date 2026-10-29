import { useEffect, useState } from 'react';

import { obtenerPaquetes, Paquete } from '@/services/packages';

export function usePaquetes() {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;

    obtenerPaquetes()
      .then((resultado) => {
        if (activo) setPaquetes(resultado);
      })
      .catch((e: unknown) => {
        if (activo) {
          setError(e instanceof Error ? e.message : 'No se pudieron cargar los paquetes.');
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [intento]);

  const reintentar = () => {
    setCargando(true);
    setError(null);
    setIntento((actual) => actual + 1);
  };

  return {
    paquetes,
    cargando,
    error,
    reintentar,
  };
}
