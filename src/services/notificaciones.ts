import { apiFetch, mensajeDeError } from './api';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export type TipoNotificacion =
  | 'ruta_asignada'
  | 'paquete_agregado'
  | 'paquete_quitado'
  | 'paquete_actualizado'
  | 'aviso';

export type Notificacion = {
  idNotificacion: number;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion | string;
  folio: string | null;
  fechaHora: string; // ISO 8601 en UTC
  leida: boolean;
};

function normalizar(valor: unknown): Notificacion | null {
  if (typeof valor !== 'object' || valor === null) return null;
  const n = valor as Record<string, unknown>;
  if (
    typeof n.idNotificacion !== 'number' ||
    typeof n.titulo !== 'string' ||
    typeof n.mensaje !== 'string' ||
    typeof n.fechaHora !== 'string' ||
    typeof n.leida !== 'boolean'
  ) {
    return null;
  }
  return {
    idNotificacion: n.idNotificacion,
    titulo: n.titulo,
    mensaje: n.mensaje,
    tipo: typeof n.tipo === 'string' ? n.tipo : 'aviso',
    folio: typeof n.folio === 'string' && n.folio ? n.folio : null,
    fechaHora: n.fechaHora,
    leida: n.leida,
  };
}

// --- Datos de prueba (solo con EXPO_PUBLIC_USE_MOCK=true) ---
const hace = (minutos: number) => new Date(Date.now() - minutos * 60000).toISOString();
let mockNotificaciones: Notificacion[] = [
  {
    idNotificacion: 3,
    titulo: 'Ruta asignada para hoy',
    mensaje: 'Tienes 2 paquetes asignados en tu ruta de hoy.',
    tipo: 'ruta_asignada',
    folio: null,
    fechaHora: hace(5),
    leida: false,
  },
  {
    idNotificacion: 2,
    titulo: 'Paquete agregado a tu ruta',
    mensaje: 'Se agregó el paquete PKT-8501 (Calle Reforma 8, Hermosillo).',
    tipo: 'paquete_agregado',
    folio: 'PKT-8501',
    fechaHora: hace(40),
    leida: false,
  },
  {
    idNotificacion: 1,
    titulo: 'Dirección actualizada',
    mensaje: 'Cambió la dirección de entrega del paquete PKT-8492.',
    tipo: 'paquete_actualizado',
    folio: 'PKT-8492',
    fechaHora: hace(60 * 26),
    leida: true,
  },
];

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// GET /notificaciones → notificaciones del usuario de la sesión, las más recientes primero
export async function obtenerNotificaciones(): Promise<Notificacion[]> {
  if (USE_MOCK) {
    await esperar(500);
    return mockNotificaciones.map((n) => ({ ...n }));
  }

  const respuesta: unknown = await apiFetch('/notificaciones');
  if (!Array.isArray(respuesta)) {
    throw new Error('La respuesta de notificaciones tiene un formato inesperado.');
  }
  const lista = respuesta.map(normalizar);
  if (lista.some((n) => n === null)) {
    throw new Error('La respuesta de notificaciones tiene un formato inesperado.');
  }
  return lista as Notificacion[];
}

// POST /notificaciones/{id}/leida
export async function marcarNotificacionLeida(idNotificacion: number): Promise<void> {
  if (USE_MOCK) {
    mockNotificaciones = mockNotificaciones.map((n) =>
      n.idNotificacion === idNotificacion ? { ...n, leida: true } : n
    );
    return;
  }
  await apiFetch(`/notificaciones/${idNotificacion}/leida`, { method: 'POST' });
}

// POST /notificaciones/leidas → marca todas las del usuario como leídas
export async function marcarTodasLeidas(): Promise<void> {
  if (USE_MOCK) {
    mockNotificaciones = mockNotificaciones.map((n) => ({ ...n, leida: true }));
    return;
  }
  await apiFetch('/notificaciones/leidas', { method: 'POST' });
}

export function mensajeErrorNotificaciones(e: unknown): string {
  // El servidor responde 404 o 405 mientras no exista el endpoint
  const sinServicio = 'El servidor todavía no tiene el servicio de notificaciones.';
  return mensajeDeError(e, 'No se pudieron cargar las notificaciones.', {
    porEstado: {
      403: 'Tu cuenta no tiene permiso para ver notificaciones.',
      404: sinServicio,
      405: sinServicio,
    },
  });
}

// "Ahora", "Hace 5 min", "Hace 3 h", "Hace 2 días" o la fecha
export function fechaRelativa(iso: string): string {
  // Si la API manda la fecha sin zona horaria, se toma como UTC
  const conZona = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
  const fecha = new Date(conZona);
  if (Number.isNaN(fecha.getTime())) return '';

  const minutos = Math.floor((Date.now() - fecha.getTime()) / 60000);
  if (minutos < 1) return 'Ahora';
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return dias === 1 ? 'Hace 1 día' : `Hace ${dias} días`;
  return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}
