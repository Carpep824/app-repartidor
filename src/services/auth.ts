import { apiFetch } from './api';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export type Usuario = { nombre: string; email: string };

// Tolera varios nombres de campo hasta que veas la respuesta real
const normalizar = (raw: any): Usuario => ({
  nombre: raw?.nombre ?? raw?.name ?? raw?.fullName ?? raw?.email ?? 'Repartidor',
  email: raw?.email ?? '',
});

let sesionMock: Usuario | null = null;

export async function login(email: string, password: string): Promise<Usuario> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    if (!email || !password) throw new Error('Credenciales inválidas');
    sesionMock = { nombre: 'Ricardo', email };
    return sesionMock;
  }
  const raw = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return normalizar(raw?.user ?? raw);
}

export async function obtenerUsuario(): Promise<Usuario | null> {
  if (USE_MOCK) return sesionMock;
  try {
    return normalizar(await apiFetch('/auth/me'));
  } catch {
    return null; // 401 = sin sesión
  }
}

export async function cerrarSesion() {
  if (USE_MOCK) {
    sesionMock = null;
    return;
  }
  await apiFetch('/auth/logout', { method: 'POST' });
}