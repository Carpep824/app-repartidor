import { useEffect, useState } from 'react';

// Mock de datos alineado al Diagrama de Clases (usando camelCase)
const MOCK_PAQUETES = [
  {
    idPaquete: 101,
    folio: 'PKT-8492',
    direccionDestino: 'Aurora 79, Palmar del Sol, 83250 Hermosillo', 
    coordenadasDestino: '29.0784056,-110.9808664', 
    esPrioritario: true,
    esFragil: false,
    estadoActual: 'En ruta'
  },
  {
    idPaquete: 102,
    folio: 'PKT-8501',
    direccionDestino: 'Calle Reforma 8, Hermosillo',
    coordenadasDestino: '29.0915, -110.9650',
    esPrioritario: false,
    esFragil: true,
    estadoActual: 'En ruta'
  }
];

export function usePaquetes() {
  const [paquetes, setPaquetes] = useState<typeof MOCK_PAQUETES>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = () => {
    setCargando(true);
    setError(null);
    
    // Simulamos la latencia de red de la API
    setTimeout(() => {
      setPaquetes(MOCK_PAQUETES);
      setCargando(false);
    }, 1000);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función específica para la vista del mapa
  const getPaqueteByFolio = (folio: string) => {
    return paquetes.find(p => p.folio === folio) || null;
  };

  return { 
    paquetes, 
    cargando, 
    error, 
    reintentar: cargarDatos, 
    getPaqueteByFolio 
  };
}

/*
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

  // Función añadida exclusivamente para alimentar la vista del mapa con los datos reales
  const getPaqueteByFolio = (folio: string) => {
    return paquetes.find((p) => p.folio === folio) || null;
  };

  return {
    paquetes,
    cargando,
    error,
    reintentar,
    getPaqueteByFolio,
  };
}
  */
