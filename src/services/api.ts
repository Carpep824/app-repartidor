export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.10.230.191:5272/api';

const TIEMPO_LIMITE_MS = 10000;

// El servidor respondió con un código de error (4xx o 5xx)
export class ApiError extends Error {
  readonly status: number;
  readonly cuerpo: string;

  constructor(status: number, cuerpo: string) {
    super(`Error ${status}`);
    // Mantiene "instanceof ApiError" aunque el código se transpile a ES5
    Object.setPrototypeOf(this, ApiError.prototype);
    this.name = 'ApiError';
    this.status = status;
    this.cuerpo = cuerpo;
  }
}

// No hubo respuesta: sin red, servidor apagado o tiempo de espera agotado
export class ErrorDeConexion extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    Object.setPrototypeOf(this, ErrorDeConexion.prototype);
    this.name = 'ErrorDeConexion';
  }
}

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
      throw new ErrorDeConexion(`El servidor no respondió en ${tiempoLimiteMs / 1000} s.`);
    }
    throw new ErrorDeConexion(e instanceof Error ? e.message : String(e));
  } finally {
    clearTimeout(timeoutId);
  }

  const texto = await response.text();

  if (!response.ok) {
    throw new ApiError(response.status, texto);
  }

  return texto ? JSON.parse(texto) : null;
}

// Saca un mensaje legible del cuerpo de la respuesta: texto corto o JSON con message/detail/errors.
// Las páginas de error en HTML, los textos largos (trazas del servidor) y los títulos genéricos
// de ASP.NET ("Bad Request", "One or more validation errors occurred.") se ignoran.
function detalleDelServidor(cuerpo: string): string {
  const texto = cuerpo.trim();
  if (!texto || texto.startsWith('<')) return '';
  try {
    const json = JSON.parse(texto);
    if (typeof json === 'string') return json;
    const valor = json?.message ?? json?.mensaje ?? json?.detail ?? json?.error;
    if (typeof valor === 'string' && valor) return valor;
    // Errores de validación: { errors: { campo: ["mensaje"] } }
    if (json?.errors && typeof json.errors === 'object') {
      const primero = Object.values(json.errors).flat()[0];
      if (typeof primero === 'string') return primero;
    }
    return '';
  } catch {
    return texto.length <= 200 ? texto : '';
  }
}

type OpcionesMensaje = {
  // Mensaje fijo para un código concreto (por ejemplo, 401 en el login = credenciales incorrectas)
  porEstado?: Partial<Record<number, string>>;
};

// Convierte cualquier error en un mensaje para la persona que usa la app
export function mensajeDeError(e: unknown, porDefecto: string, { porEstado = {} }: OpcionesMensaje = {}): string {
  if (e instanceof ErrorDeConexion) {
    return 'No se pudo conectar al servidor. Revisa tu conexión e inténtalo de nuevo.';
  }

  if (e instanceof ApiError) {
    const detalle = detalleDelServidor(e.cuerpo);
    const fijo = porEstado[e.status];

    // En estos casos el mensaje del servidor suele explicar el problema (dato inválido, no encontrado, ya existe)
    if (e.status === 400 || e.status === 404 || e.status === 409) {
      return detalle || fijo || (e.status === 400 ? 'Los datos enviados no son válidos.' : porDefecto);
    }
    if (fijo) return fijo;
    if (e.status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    if (e.status === 403) return 'Tu cuenta no tiene permiso para hacer esto.';
    if (e.status >= 500) return 'Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.';
    return detalle || porDefecto;
  }

  // Errores que lanza la propia app (por ejemplo, "No se encontró la foto en el teléfono")
  if (e instanceof Error && e.message) return e.message;
  return porDefecto;
}
