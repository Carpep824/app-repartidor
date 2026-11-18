import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { obtenerPaquetes, Paquete } from '@/services/packages';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

// Datos de prueba: solo se usan con EXPO_PUBLIC_USE_MOCK=true
const MOCK_PAQUETES: Paquete[] = [
  {
    idPaquete: 101,
    folio: 'PKT-8492',
    direccionDestino: 'Aurora 79, Palmar del Sol, 83250 Hermosillo',
    coordenadasDestino: '29.0784056,-110.9808664',
    esPrioritario: true,
    esFragil: false,
    estadoActual: 'En ruta',
  },
  {
    idPaquete: 102,
    folio: 'PKT-8501',
    direccionDestino: 'Calle Reforma 8, Hermosillo',
    coordenadasDestino: '29.0915, -110.9650',
    esPrioritario: false,
    esFragil: true,
    estadoActual: 'En ruta',
  },
];

async function cargarPaquetes(): Promise<Paquete[]> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return MOCK_PAQUETES;
  }
  return obtenerPaquetes();
}

function mensajeDeError(e: unknown): string {
  const mensaje = e instanceof Error ? e.message : '';
  if (mensaje.includes('Network')) return 'No se pudo conectar al servidor.';
  return mensaje || 'No se pudieron cargar los paquetes.';
}

export function usePaquetes() {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;

    cargarPaquetes()
      .then((resultado) => {
        if (activo) {
          setPaquetes(resultado);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (activo) setError(mensajeDeError(e));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [intento]);

  // Al volver a la pantalla (por ejemplo, después de finalizar una entrega) se recarga la lista
  // sin mostrar el indicador de carga. La primera vez no, porque el efecto de arriba ya cargó.
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

  const reintentar = () => {
    setCargando(true);
    setError(null);
    setIntento((actual) => actual + 1);
  };

  const getPaqueteByFolio = (folio: string) =>
    paquetes.find((paquete) => paquete.folio === folio) ?? null;

  return { paquetes, cargando, error, reintentar, getPaqueteByFolio };
}
