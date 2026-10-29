import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Modal, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/context/auth';

type Props = {
  visible: boolean;
  onClose: () => void;
  actual: 'dashboard' | 'ruta';
};

export function MenuLateral({ visible, onClose, actual }: Props) {
  const router = useRouter();
  const { cerrarSesion, usuario } = useAuth();

  const ir = (destino: '/' | '/ruta' | '/escanear') => {
    onClose();
    router.replace(destino);
  };

  const colorItem = (activo: boolean) => (activo ? '#18529D' : '#0B2B5B');

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sideMenu}>

          <View style={styles.menuProfileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{usuario?.nombre.trim().charAt(0).toUpperCase() || 'R'}</Text>
            </View>
            <Text style={styles.profileName}>{usuario?.nombre ?? 'Repartidor'}</Text>
          </View>

          <View style={styles.menuLinks}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => (actual === 'dashboard' ? onClose() : ir('/'))}
            >
              <Feather name="grid" size={22} color={colorItem(actual === 'dashboard')} />
              <Text style={[styles.menuItemText, actual === 'dashboard' && styles.menuItemActive]}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => (actual === 'ruta' ? onClose() : ir('/ruta'))}
            >
              <Feather name="map" size={22} color={colorItem(actual === 'ruta')} />
              <Text style={[styles.menuItemText, actual === 'ruta' && styles.menuItemActive]}>Ruta Activa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                router.push('/escanear');
              }}
            >
              <Feather name="maximize" size={22} color="#0B2B5B" />
              <Text style={styles.menuItemText}>Escanear carga</Text>
            </TouchableOpacity>

          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              onClose();
              cerrarSesion();
            }}
          >
            <Feather name="log-out" size={22} color="#E53935" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>

        </View>

        <TouchableOpacity style={styles.closeOverlayArea} onPress={onClose} activeOpacity={1} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#1B9356',
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
  menuItemActive: {
    color: '#18529D',
    fontWeight: 'bold',
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