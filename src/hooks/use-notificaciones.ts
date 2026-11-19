import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  marcarNotificacionLeida,
  marcarTodasLeidas,
  mensajeErrorNotificaciones,
  Notificacion,
  obtenerNotificaciones,
} from '@/services/notificaciones';

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;

    obtenerNotificaciones()
      .then((resultado) => {
        if (activo) {
          setNotificaciones(resultado);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (activo) setError(mensajeErrorNotificaciones(e));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [intento]);

  // Al volver a la pantalla se recargan sin mostrar el indicador de carga.
  // La primera vez no, porque el efecto de arriba ya cargó.
  const yaEnfocada = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!yaEnfocada.current) {
        yaEnfocada.current = true;
        return;
      }
      setIntento((actual) => actual + 1);
    }, [])
  );

  // Recarga silenciosa (por ejemplo, al abrir el panel)
  const recargar = () => setIntento((actual) => actual + 1);

  const reintentar = () => {
    setCargando(true);
    setError(null);
    setIntento((actual) => actual + 1);
  };

  const marcarLeida = async (idNotificacion: number) => {
    // Se marca en pantalla de inmediato; si la API falla, se vuelve a cargar la lista
    setNotificaciones((actuales) =>
      actuales.map((n) => (n.idNotificacion === idNotificacion ? { ...n, leida: true } : n))
    );
    try {
      await marcarNotificacionLeida(idNotificacion);
    } catch {
      recargar();
    }
  };

  const marcarTodas = async () => {
    setNotificaciones((actuales) => actuales.map((n) => ({ ...n, leida: true })));
    try {
      await marcarTodasLeidas();
    } catch {
      recargar();
    }
  };

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return { notificaciones, noLeidas, cargando, error, recargar, reintentar, marcarLeida, marcarTodas };
}
