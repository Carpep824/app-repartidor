import * as Auth from '@/services/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  usuario: Auth.Usuario | null;
  estaAutenticado: boolean;
  cargando: boolean;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Auth.Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Auth.obtenerUsuario()
      .then(setUsuario)
      .finally(() => setCargando(false));
  }, []);

  const iniciarSesion = async (email: string, password: string) => {
    setUsuario(await Auth.login(email, password));
  };

  const cerrarSesion = async () => {
    await Auth.cerrarSesion();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{ usuario, estaAutenticado: usuario !== null, cargando, iniciarSesion, cerrarSesion }}
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