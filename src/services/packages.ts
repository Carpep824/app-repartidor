import { apiFetch } from './api';

export type Paquete = {
  idPaquete: number;
  folio: string;
  direccionDestino: string;
  esPrioritario: boolean;
  esFragil: boolean;
  estadoActual: string;
};

function isPaquete(value: unknown): value is Paquete {
  if (typeof value !== 'object' || value === null) return false;

  const paquete = value as Record<string, unknown>;
  return (
    typeof paquete.idPaquete === 'number' &&
    typeof paquete.folio === 'string' &&
    typeof paquete.direccionDestino === 'string' &&
    typeof paquete.esPrioritario === 'boolean' &&
    typeof paquete.esFragil === 'boolean' &&
    typeof paquete.estadoActual === 'string'
  );
}

export async function obtenerPaquetes(): Promise<Paquete[]> {
  const response: unknown = await apiFetch('/packages');

  if (!Array.isArray(response) || !response.every(isPaquete)) {
    throw new Error('La respuesta de paquetes tiene un formato inesperado.');
  }

  return response;
}
