export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://100.115.188.12:5272/api';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const texto = await response.text();

  if (!response.ok) {
    throw new Error(texto || `Error ${response.status}`);
  }

  return texto ? JSON.parse(texto) : null;
}