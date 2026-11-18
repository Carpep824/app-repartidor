import * as Location from 'expo-location';

import type { Paquete } from './packages';

export type Coordenadas = { latitude: number; longitude: number };

// Convierte "29.0784,-110.9808" (con o sin espacios) en coordenadas válidas.
export function parsearCoordenadas(texto?: string | null): Coordenadas | null {
  if (!texto) return null;

  const partes = texto.split(',').map((parte) => Number(parte.trim()));
  if (partes.length !== 2) return null;

  const [latitude, longitude] = partes;
  const valido =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180;

  return valido ? { latitude, longitude } : null;
}

// Guarda lo que ya se geocodificó para no repetir la consulta en cada pantalla.
const cache = new Map<string, Coordenadas | null>();

// Usa coordenadasDestino si el backend las manda; si no, las calcula a partir de la dirección.
export async function obtenerCoordenadas(paquete: Paquete): Promise<Coordenadas | null> {
  const directas = parsearCoordenadas(paquete.coordenadasDestino);
  if (directas) return directas;

  const direccion = paquete.direccionDestino.trim();
  if (!direccion) return null;
  if (cache.has(direccion)) return cache.get(direccion) ?? null;

  try {
    const [resultado] = await Location.geocodeAsync(direccion);
    const coords = resultado
      ? { latitude: resultado.latitude, longitude: resultado.longitude }
      : null;
    cache.set(direccion, coords);
    return coords;
  } catch {
    return null;
  }
}
