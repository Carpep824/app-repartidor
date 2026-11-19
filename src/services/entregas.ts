import { File } from 'expo-file-system';

import { apiFetch, mensajeDeError } from './api';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export type FotoEvidencia = {
  uri: string;
  nombreArchivo?: string | null;
  tipo?: string | null;
};

export type DatosEntrega = {
  folio: string;
  nombreReceptor: string;
  firmaSvg: string;
  foto: FotoEvidencia;
};

// Arma un SVG completo a partir de los trazos dibujados en la pantalla
export function construirSvgFirma(trazos: string[], ancho: number, alto: number): string {
  const w = Math.max(1, Math.round(ancho));
  const h = Math.max(1, Math.round(alto));
  const paths = trazos
    .map(
      (d) =>
        `<path d="${d}" fill="none" stroke="#0B2B5B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#FFFFFF"/>${paths}</svg>`;
}

// POST /entregas (multipart/form-data): el backend guarda la foto y la firma como archivos,
// llena COMPROBANTES_ENTREGA y marca el paquete como entregado.
export async function registrarEntrega(datos: DatosEntrega): Promise<void> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return;
  }

  // La fetch de Expo no acepta el formato { uri, name, type } de React Native:
  // la foto se adjunta como File de expo-file-system, que trae su nombre y su tipo (image/jpeg).
  const archivoFoto = new File(datos.foto.uri);
  if (!archivoFoto.exists) {
    throw new Error('No se encontró la foto en el teléfono. Vuelve a tomarla.');
  }

  const form = new FormData();
  form.append('folio', datos.folio);
  form.append('nombreReceptor', datos.nombreReceptor.trim());
  form.append('firmaSvg', datos.firmaSvg);
  form.append('foto', archivoFoto);

  await apiFetch('/entregas', { method: 'POST', body: form }, { tiempoLimiteMs: 60000 });
}

export function mensajeErrorEntrega(e: unknown): string {
  return mensajeDeError(e, 'No se pudo registrar la entrega.', {
    porEstado: {
      403: 'Tu cuenta no tiene permiso para registrar entregas.',
      404: 'No se encontró el paquete.',
      405: 'El servidor todavía no tiene el servicio para registrar entregas.',
      409: 'Este paquete ya fue entregado.',
    },
  });
}
