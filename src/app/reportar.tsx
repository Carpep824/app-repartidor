import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ReportarProblema() {
  const router = useRouter();
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<string | null>(null);

  const opciones = [
    { id: 'cerrado', titulo: 'Domicilio Cerrado', desc: 'Nadie disponible en la dirección' },
    { id: 'fallido', titulo: 'Intento fallido (Cliente no se encuentra)', desc: 'El destinatario no respondió' },
    { id: 'direccion', titulo: 'Dirección Incorrecta o Incompleta', desc: 'Los datos no coinciden' },
    { id: 'danado', titulo: 'Paquete dañado en tránsito', desc: 'Requiere reporte con foto' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.overlay}>
        
        {/* Espacio superior para forzar el bottom sheet hacia abajo */}
        <TouchableOpacity 
          style={styles.backdropTouch} 
          activeOpacity={1} 
          onPress={() => router.back()} 
        />

        {/* Tarjeta Inferior (Bottom Sheet) */}
        <View style={styles.bottomSheet}>
          <View style={styles.dragHandle} />

          {/* Encabezado del Reporte */}
          <View style={styles.header}>
            <View style={styles.alertIconContainer}>
              <Feather name="alert-triangle" size={24} color="#DC2626" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Reportar Problema con Entrega</Text>
              <Text style={styles.folioText}>Folio #PKT-8492</Text>
            </View>
          </View>

          {/* Lista de Opciones */}
          <View style={styles.optionsContainer}>
            {opciones.map((opcion) => {
              const isSelected = motivoSeleccionado === opcion.id;
              
              return (
                <TouchableOpacity 
                  key={opcion.id}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => setMotivoSeleccionado(opcion.id)}
                >
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioInnerDot} />}
                  </View>
                  
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{opcion.titulo}</Text>
                    <Text style={styles.optionDesc}>{opcion.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Botón Confirmar */}
          <TouchableOpacity 
            style={[styles.confirmButton, motivoSeleccionado ? styles.confirmButtonActive : null]}
            disabled={!motivoSeleccionado}
            onPress={() => {
              // Lógica futura para enviar el reporte
              router.back();
            }}
          >
            <Feather 
              name="check" 
              size={20} 
              color={motivoSeleccionado ? '#FFFFFF' : '#9AA6B8'} 
              style={styles.confirmIcon} 
            />
            <Text style={[styles.confirmButtonText, motivoSeleccionado ? styles.confirmButtonTextActive : null]}>
              Confirmar Incidencia
            </Text>
          </TouchableOpacity>

          {/* Botón Cancelar */}
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Simula el fondo oscurecido
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D9E6',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2', // Rojo claro
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B2B5B',
    marginBottom: 4,
    lineHeight: 22,
  },
  folioText: {
    fontSize: 13,
    color: '#7A8B9E',
    fontWeight: '600',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E6EDF5',
    borderRadius: 16,
    marginBottom: 12,
  },
  optionCardSelected: {
    borderColor: '#18529D',
    backgroundColor: '#F4F7FB',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  radioCircleSelected: {
    borderColor: '#18529D',
  },
  radioInnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#18529D',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0B2B5B',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 12,
    color: '#7A8B9E',
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#E6EDF5',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmButtonActive: {
    backgroundColor: '#18529D',
  },
  confirmIcon: {
    marginRight: 8,
  },
  confirmButtonText: {
    color: '#9AA6B8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButtonTextActive: {
    color: '#FFFFFF',
  },
  cancelButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#0B2B5B',
    fontSize: 16,
    fontWeight: 'bold',
  },
});