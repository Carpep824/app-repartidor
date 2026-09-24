import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CompletarEntrega() {
  const router = useRouter();
  const [nombre, setNombre] = useState('María González');

  return (
    <View style={styles.mainContainer}>
      
      {/* Encabezado Azul Oscuro */}
      <View style={styles.headerBackground}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Completar Entrega</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.subHeaderText}>
            Entregando <Text style={styles.folioBold}>#PKT-8492</Text>
          </Text>

          {/* Sección 1: Evidencia Fotográfica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1 · EVIDENCIA FOTOGRÁFICA</Text>
            <TouchableOpacity style={styles.photoBox}>
              <View style={styles.photoIconCircle}>
                <Feather name="camera" size={28} color="#132854" />
              </View>
              <Text style={styles.photoText}>Tomar Foto del Domicilio/Paquete</Text>
            </TouchableOpacity>
          </View>

          {/* Sección 2: Firma del Receptor */}
          <View style={styles.section}>
            <View style={styles.signatureHeader}>
              <Text style={styles.sectionTitle}>2 · FIRMA DEL RECEPTOR</Text>
              <TouchableOpacity>
                <Text style={styles.clearText}>Limpiar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.signatureBox}>
              <MaterialCommunityIcons name="gesture" size={64} color="#5B7290" style={styles.signaturePlaceholder} />
              <Text style={styles.signatureText}>Firma del receptor</Text>
            </View>

            {/* Input con etiqueta flotante */}
            <View style={styles.inputContainer}>
              <View style={styles.floatingLabelContainer}>
                <Text style={styles.floatingLabel}>Nombre de quien recibe</Text>
              </View>
              <TextInput 
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholderTextColor="#9AA6B8"
              />
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Botón Finalizar */}
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={() => router.push('/')} // Retorna al dashboard al finalizar
        >
          <Feather name="check" size={20} color="#FFFFFF" style={styles.submitIcon} />
          <Text style={styles.submitButtonText}>Finalizar Entrega</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  headerBackground: {
    backgroundColor: '#132854',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#5B7290',
    marginBottom: 24,
  },
  folioBold: {
    fontWeight: 'bold',
    color: '#0B2B5B',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5B7290',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  photoBox: {
    backgroundColor: '#E6EDF5',
    borderWidth: 1.5,
    borderColor: '#D1D9E6',
    borderStyle: 'dashed',
    borderRadius: 16,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  photoText: {
    color: '#5B7290',
    fontSize: 14,
    fontWeight: '500',
  },
  signatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearText: {
    fontSize: 13,
    color: '#132854',
    fontWeight: '600',
  },
  signatureBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D9E6',
    borderStyle: 'dashed',
    borderRadius: 16,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signaturePlaceholder: {
    marginBottom: 8,
    opacity: 0.5,
  },
  signatureText: {
    color: '#9AA6B8',
    fontSize: 12,
  },
  inputContainer: {
    position: 'relative',
    marginTop: 8,
  },
  floatingLabelContainer: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: '#F5F8FA', // Mismo color de fondo principal para ocultar el borde
    paddingHorizontal: 4,
    zIndex: 1,
  },
  floatingLabel: {
    fontSize: 11,
    color: '#5B7290',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D9E6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: '#0B2B5B',
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F5F8FA',
    borderTopWidth: 1,
    borderTopColor: '#E6EDF5',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});