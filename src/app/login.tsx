import { Feather } from '@expo/vector-icons';

import { useAuth } from '@/context/auth';

import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
  const { iniciarSesion } = useAuth();
  const [usuario, setUsuario] = useState(''); // correo
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const entrar = async () => {
    if (!usuario.trim() || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }

    setError('');
    setCargando(true);
    try {
      await iniciarSesion(usuario.trim(), password); // el guard del _layout te lleva al dashboard
    } catch (e: any) {
      const msg = String(e?.message ?? '');
      setError(
        msg.includes('Network')
          ? 'No se pudo conectar al servidor.'
          : 'Correo o contraseña incorrectos.'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIconBg}>
              <Feather name="package" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.logoTextMain}>
              Rumbo<Text style={styles.logoTextLight}>Envíos</Text>
            </Text>
            <Text style={styles.logoTextSub}>REPARTIDOR</Text>
          </View>

          {/* Bienvenida */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Iniciar sesión</Text>
            <Text style={styles.welcomeSubtitle}>Ingresa tus credenciales para comenzar tu turno</Text>
          </View>

          {/* Correo */}
          <Text style={styles.label}>CORREO</Text>
          <View style={styles.inputRow}>
            <Feather name="mail" size={18} color="#7A8B9E" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={usuario}
              onChangeText={setUsuario}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#9AA6B8"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>

          {/* Contraseña */}
          <Text style={styles.label}>CONTRASEÑA</Text>
          <View style={styles.inputRow}>
            <Feather name="lock" size={18} color="#7A8B9E" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Tu contraseña"
              placeholderTextColor="#9AA6B8"
              secureTextEntry={!verPassword}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={entrar}
            />
            <TouchableOpacity onPress={() => setVerPassword((v) => !v)} style={styles.eyeButton}>
              <Feather name={verPassword ? 'eye-off' : 'eye'} size={18} color="#7A8B9E" />
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Botón */}
          <TouchableOpacity
            style={[styles.loginButton, cargando && styles.loginButtonDisabled]}
            onPress={entrar}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Feather name="log-in" size={20} color="#FFFFFF" style={styles.loginIcon} />
                <Text style={styles.loginButtonText}>Entrar</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.helpText}>¿Problemas para entrar? Contacta a tu administrador.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIconBg: {
    backgroundColor: '#18529D',
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoTextMain: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0B2B5B',
  },
  logoTextLight: {
    fontWeight: '400',
  },
  logoTextSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7A8B9E',
    letterSpacing: 3,
    marginTop: 2,
  },
  welcomeContainer: {
    marginBottom: 28,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0B2B5B',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#5B7290',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5B7290',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D9E6',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0B2B5B',
    height: '100%',
  },
  eyeButton: {
    padding: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#B91C1C',
    fontWeight: '500',
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#1B9356',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9AA6B8',
    marginTop: 24,
  },
});