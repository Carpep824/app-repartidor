import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MenuLateral } from '@/components/menu-lateral';
import { usePaquetes } from '@/hooks/use-paquetes';

export default function RutaActiva() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const { paquetes, cargando, error, reintentar } = usePaquetes();
  const paquetesEnRuta = paquetes.filter((paquete) => paquete.estadoActual.trim().toLowerCase() === 'en ruta');

  const [notifVisible, setNotifVisible] = useState(false);

  return (
    <View style={styles.mainContainer}>

      {/* Encabezado Azul Oscuro */}
      <View style={styles.headerBackground}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => setMenuVisible(true)}
            >
              <Feather name="menu" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Ruta Activa</Text>

            <TouchableOpacity style={styles.headerIcon} onPress={() => setNotifVisible(true)}>
              <Feather name="bell" size={22} color="#FFFFFF" />
            </TouchableOpacity>

          </View>
        </SafeAreaView>
      </View>

      {/* Resumen de paquetes */}
      <View style={styles.progressSection}>
        <View style={styles.progressTextRow}>
          <Text style={styles.progressTextMain}>Paquetes en ruta</Text>
          {cargando ? (
            <ActivityIndicator color="#18529D" />
          ) : (
            <Text style={styles.progressTextHighlight}>{error ? '—' : paquetesEnRuta.length}</Text>
          )}
        </View>
      </View>

      {/* Lista de Paradas */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {!cargando && !error && paquetesEnRuta.length === 0 ? (
          <Text style={styles.emptyText}>No hay paquetes en ruta.</Text>
        ) : null}

        {error ? (
          <View style={styles.loadError}>
            <Text style={styles.loadErrorText}>{error}</Text>
            <TouchableOpacity onPress={reintentar}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {cargando ? <ActivityIndicator color="#18529D" style={styles.loadingIndicator} /> : null}

        {paquetesEnRuta.map((parada, index) => (
          <View key={parada.idPaquete} style={styles.stopCard}>

            {/* Círculo de Número */}
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>

            {/* Información de la Parada */}
            <View style={styles.stopInfo}>
              <View style={styles.folioRow}>
                <Text style={styles.folioText} numberOfLines={1}>Folio {parada.folio}</Text>

                {parada.esPrioritario ? (
                  <View style={[styles.badge, styles.badgePrioritario]}>
                    <Text style={[styles.badgeText, styles.badgeTextPrioritario]}>Prioritario</Text>
                  </View>
                ) : null}
                {parada.esFragil ? (
                  <View style={[styles.badge, styles.badgeFragil]}>
                    <Text style={[styles.badgeText, styles.badgeTextFragil]}>Frágil</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.addressRow}>
                <Feather name="map-pin" size={12} color="#7A8B9E" style={styles.addressIcon} />
                <Text style={styles.addressText} numberOfLines={1}>{parada.direccionDestino}</Text>
              </View>
              <Text style={styles.statusText}>{parada.estadoActual}</Text>
            </View>

            {/* Botón Navegar */}
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() =>
                router.push({
                  pathname: '/mapa',
                  params: { folio: parada.folio, direccion: parada.direccionDestino },
                })
              }
            >
              <Feather name="navigation" size={16} color="#18529D" style={styles.navigateIcon} />
              <Text style={styles.navigateText}>Navegar</Text>
            </TouchableOpacity>

          </View>
        ))}

      </ScrollView>

      {/* Panel de Notificaciones (Modal) */}
      <Modal
        visible={notifVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNotifVisible(false)}
      >
        <Pressable style={styles.notifOverlay} onPress={() => setNotifVisible(false)}>
          <Pressable style={styles.notifPanel} onPress={() => { }}>
            <View style={styles.notifHeader}>
              <Text style={styles.notifTitle}>Notificaciones</Text>
            </View>

            <Text style={styles.emptyNotifications}>
              La API todavía no proporciona notificaciones.
            </Text>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Menú Lateral (Modal) */}
      <MenuLateral visible={menuVisible} onClose={() => setMenuVisible(false)} actual="ruta" />
       

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
  },
  progressTextMain: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0B2B5B',
  },
  progressTextHighlight: {
    color: '#1B9356',
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
  statusText: {
    color: '#5B7290',
    fontSize: 11,
    marginTop: 4,
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
  emptyText: {
    textAlign: 'center',
    color: '#7A8B9E',
    fontSize: 14,
    marginTop: 24,
  },
  loadingIndicator: {
    marginTop: 24,
  },
  loadError: {
    alignItems: 'center',
    marginTop: 24,
  },
  loadErrorText: {
    color: '#B91C1C',
    fontSize: 13,
    textAlign: 'center',
  },
  retryText: {
    color: '#18529D',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
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
  notifOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'flex-end',
    paddingTop: (StatusBar.currentHeight ?? 44) + 60,
    paddingHorizontal: 16,
  },
  notifPanel: {
    width: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EDF5',
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0B2B5B',
  },
  emptyNotifications: {
    color: '#5B7290',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 20,
    textAlign: 'center',
  },
});