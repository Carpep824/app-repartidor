import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="ruta" />
      <Stack.Screen name="mapa" />
      <Stack.Screen name="finalizar" />
      <Stack.Screen 
        name="reportar" 
        options={{ 
          presentation: 'transparentModal',
          animation: 'fade'
        }} 
      />
    </Stack>
  );
}