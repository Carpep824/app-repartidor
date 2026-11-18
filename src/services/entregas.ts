import { apiFetch } from './api';

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

  const form = new FormData();
  form.append('folio', datos.folio);
  form.append('nombreReceptor', datos.nombreReceptor.trim());
  form.append('firmaSvg', datos.firmaSvg);
  // React Native acepta { uri, name, type } como archivo dentro de FormData
  form.append('foto', {
    uri: datos.foto.uri,
    name: datos.foto.nombreArchivo || `evidencia-${datos.folio}.jpg`,
    type: datos.foto.tipo || 'image/jpeg',
  } as unknown as Blob);

  await apiFetch('/entregas', { method: 'POST', body: form }, { tiempoLimiteMs: 60000 });
}

export function mensajeErrorEntrega(e: unknown): string {
  const mensaje = e instanceof Error ? e.message : '';
  if (mensaje.includes('Network')) return 'No se pudo conectar al servidor. Revisa tu conexión e inténtalo de nuevo.';
  if (mensaje.includes('404')) return 'El servidor todavía no tiene el servicio para registrar entregas (/entregas).';
  if (mensaje.includes('401')) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  return mensaje || 'No se pudo registrar la entrega.';
}
