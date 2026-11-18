export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.10.230.191:5272/api';

const TIEMPO_LIMITE_MS = 10000;

type OpcionesApi = {
  // Las subidas de archivos tardan más que una consulta normal
  tiempoLimiteMs?: number;
};

export async function apiFetch(path: string, options: RequestInit = {}, { tiempoLimiteMs = TIEMPO_LIMITE_MS }: OpcionesApi = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), tiempoLimiteMs);

  // Con FormData no se pone Content-Type: el teléfono lo arma con el "boundary" de los archivos
  const esFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      credentials: 'include',
      headers: {
        ...(esFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers ?? {}),
      },
    });
  } catch (e) {
    if (controller.signal.aborted) {
      throw new Error(`Network timeout: el servidor ${API_URL} no respondió en ${tiempoLimiteMs / 1000} s.`);
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }

  const texto = await response.text();

  if (!response.ok) {
    throw new Error(texto || `Error ${response.status}`);
  }

  return texto ? JSON.parse(texto) : null;
}