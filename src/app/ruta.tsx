import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RutaActiva() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false); 

  const paradas = [
    { id: '1', numero: '1', folio: 'Folio #PKT-8492', direccion: 'Blvd. Luis Encinas J', badge: 'PRIORITARIO', badgeType: 'prioritario' },
    { id: '2', numero: '2', folio: 'Folio #PKT-8501', direccion: 'Calle Reforma 8', badge: null },
    { id: '3', numero: '3', folio: 'Folio #PKT-8502', direccion: 'Av. Solidaridad 2', badge: null },
    { id: '4', numero: '4', folio: 'Folio #PKT-8510', direccion: 'Calle Yáñez 77, Local', badge: 'FRÁGIL', badgeType: 'fragil' },
    { id: '5', numero: '5', folio: 'Folio #PKT-8515', direccion: 'Blvd. Morelos 11', badge: null },
  ];

  return (
    <View style={styles.mainContainer}>
      
      {/* Encabezado Azul Oscuro */}
      <View style={styles.headerBackground}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.headerIcon} 
              onPress={() => setMenuVisible(true)} // <-- Agregar este evento
            >
              <Feather name="menu" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Ruta Activa</Text>
            
            <TouchableOpacity style={styles.headerIcon}>
              <View style={styles.notificationDot} />
              <Feather name="bell" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Sección de Progreso */}
      <View style={styles.progressSection}>
        <View style={styles.progressTextRow}>
          <Text style={styles.progressTextMain}>
            <Text style={styles.progressTextHighlight}>12</Text> / 45 Entregados
          </Text>
          <Text style={styles.progressPercent}>27%</Text>
        </View>
        
        <View style={styles.progressBarTrack}>
          <View style={styles.progressBarFill} />
        </View>
      </View>

      {/* Lista de Paradas */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {paradas.map((parada) => (
          <View key={parada.id} style={styles.stopCard}>
            
            {/* Círculo de Número */}
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{parada.numero}</Text>
            </View>

            {/* Información de la Parada */}
            <View style={styles.stopInfo}>
              <View style={styles.folioRow}>
                <Text style={styles.folioText} numberOfLines={1}>Folio {parada.folio.replace('Folio ', '')}</Text>
                
                {parada.badge && (
                  <View style={[
                    styles.badge, 
                    parada.badgeType === 'prioritario' ? styles.badgePrioritario : styles.badgeFragil
                  ]}>
                    <Text style={[
                      styles.badgeText,
                      parada.badgeType === 'prioritario' ? styles.badgeTextPrioritario : styles.badgeTextFragil
                    ]}>
                      {parada.badge}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.addressRow}>
                <Feather name="map-pin" size={12} color="#7A8B9E" style={styles.addressIcon} />
                <Text style={styles.addressText} numberOfLines={1}>{parada.direccion}</Text>
              </View>
            </View>

            {/* Botón Navegar */}
            <TouchableOpacity 
              style={styles.navigateButton}
              onPress={() => router.push('/mapa')}
            >
              <Feather name="navigation" size={16} color="#18529D" style={styles.navigateIcon} />
              <Text style={styles.navigateText}>Navegar</Text>
            </TouchableOpacity>

            {/* Menú Lateral (Modal) */}
            <Modal
                visible={menuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <View style={styles.modalOverlay}>
                <View style={styles.sideMenu}>
                    
                    <View style={styles.menuProfileSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>R</Text>
                    </View>
                    <Text style={styles.profileName}>Ricardo</Text>
                    <Text style={styles.profileType}>Repartidor Nivel 2</Text>
                    </View>

                    <View style={styles.menuLinks}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => {
                        setMenuVisible(false);
                        router.push('/');
                    }}>
                        <Feather name="grid" size={22} color="#0B2B5B" />
                        <Text style={styles.menuItemText}>Dashboard</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                        <Feather name="map" size={22} color="#18529D" />
                        <Text style={[styles.menuItemText, { color: '#18529D', fontWeight: 'bold' }]}>Ruta Activa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                        <Feather name="settings" size={22} color="#0B2B5B" />
                        <Text style={styles.menuItemText}>Configuración</Text>
                    </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.logoutButton} onPress={() => setMenuVisible(false)}>
                    <Feather name="log-out" size={22} color="#E53935" />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                    
                </View>
                
                <TouchableOpacity style={styles.closeOverlayArea} onPress={() => setMenuVisible(false)} activeOpacity={1} />
                </View>
            </Modal>

          </View>
        ))}

        <Text style={styles.footerText}>33 PARADAS RESTANTES</Text>
        
      </ScrollView>

      
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
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  notificationDot: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
    zIndex: 1,
    borderWidth: 1,
    borderColor: '#132854',
  },
  progressSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EDF5',
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTextMain: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0B2B5B',
  },
  progressTextHighlight: {
    color: '#1B9356',
  },
  progressPercent: {
    fontSize: 14,
    color: '#5B7290',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E6EDF5',
    borderRadius: 4,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    width: '27%',
    backgroundColor: '#1B9356',
    borderRadius: 4,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  stopCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  numberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F0FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0B2B5B',
  },
  stopInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  folioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  folioText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0B2B5B',
    marginRight: 8,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgePrioritario: {
    backgroundColor: '#E6F0FA',
  },
  badgeFragil: {
    backgroundColor: '#FFF0E6',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  badgeTextPrioritario: {
    color: '#18529D',
  },
  badgeTextFragil: {
    color: '#D97706',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressIcon: {
    marginRight: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#7A8B9E',
    flexShrink: 1,
  },
  navigateButton: {
    flexDirection: 'row',
    backgroundColor: '#E6F0FA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  navigateIcon: {
    marginRight: 4,
  },
  navigateText: {
    color: '#18529D',
    fontSize: 13,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#9AA6B8',
    letterSpacing: 1,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sideMenu: {
    width: '75%',
    backgroundColor: '#FFFFFF',
    height: '100%',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 20 : 60,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  closeOverlayArea: {
    width: '25%',
    height: '100%',
  },
  menuProfileSection: {
    marginBottom: 40,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1B9356', // Color verde para diferenciarlo del cliente
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B2B5B',
    marginBottom: 4,
  },
  profileType: {
    fontSize: 14,
    color: '#7A8B9E',
  },
  menuLinks: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  menuItemText: {
    fontSize: 16,
    color: '#0B2B5B',
    marginLeft: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#E53935',
    marginLeft: 16,
    fontWeight: '600',
  },
});