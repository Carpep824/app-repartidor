import { createContext, ReactNode, useContext, useState } from 'react';

type AuthContextType = {
  usuario: string | null;
  estaAutenticado: boolean;
  iniciarSesion: (usuario: string) => void;
  cerrarSesion: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<string | null>(null);

  const iniciarSesion = (nombre: string) => setUsuario(nombre);
  const cerrarSesion = () => setUsuario(null);

  return (
    <AuthContext.Provider
      value={{ usuario, estaAutenticado: usuario !== null, iniciarSesion, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return ctx;
}