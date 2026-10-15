import { Stack } from 'expo-router';

import { AuthProvider, useAuth } from '@/context/auth';

function RootNavigator() {
  const { estaAutenticado } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={estaAutenticado}>
        <Stack.Screen name="index" />
        <Stack.Screen name="ruta" />
        <Stack.Screen name="mapa" />
        <Stack.Screen name="finalizar" />
        <Stack.Screen name="escanear" />
        <Stack.Screen
          name="reportar"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!estaAutenticado}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}