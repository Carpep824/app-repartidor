import { AuthProvider, useAuth } from '@/context/auth';
import { Stack } from 'expo-router';

function Rutas() {
  const { usuario, cargando } = useAuth();
  if (cargando) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!usuario}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={!!usuario}>
        <Stack.Screen name="index" />
        <Stack.Screen name="ruta" />
        <Stack.Screen name="mapa" />
        <Stack.Screen name="finalizar" />
        <Stack.Screen name="escanear" />
        <Stack.Screen
          name="reportar"
          options={{ presentation: 'transparentModal', animation: 'fade' }}
        />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Rutas />
    </AuthProvider>
  );
}