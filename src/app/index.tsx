import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DashboardRepartidor() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header / Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIconBg}>
            <Feather name="package" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.logoTextWrapper}>
            <Text style={styles.logoTextMain}>Rumbo<Text style={styles.logoTextLight}>Envíos</Text></Text>
            <Text style={styles.logoTextSub}>REPARTIDOR</Text>
          </View>
        </View>

        {/* Saludo */}
        <View style={styles.greetingContainer}>
          <Text style={styles.locationText}>CENTRO DE DISTRIBUCIÓN · HERMOSILLO</Text>
          <Text style={styles.greetingText}>Buen turno, Ricardo</Text>
        </View>

        {/* Tarjeta de Resumen */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Paquetes asignados hoy</Text>
            <View style={styles.iconCircle}>
              <Feather name="box" size={18} color="#18529D" />
            </View>
          </View>
          
          <Text style={styles.bigNumber}>45</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>18</Text>
              <Text style={styles.statLabel}>Prioritarios</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Zonas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>~6h</Text>
              <Text style={styles.statLabel}>Estimado</Text>
            </View>
          </View>
        </View>

        {/* Espaciador flexible para empujar los botones al fondo */}
        <View style={{ flex: 1 }} />

        {/* Botones de Acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/ruta')}
          >
            <MaterialCommunityIcons name="sync" size={22} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Sincronizar e Iniciar Ruta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/escanear')}>
              <MaterialCommunityIcons name="barcode-scan" size={22} color="#0B2B5B" style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>Escanear carga manual</Text>
          </TouchableOpacity>
        </View>

      </View>
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
    flex: 1,
    padding: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  logoIconBg: {
    backgroundColor: '#18529D',
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoTextWrapper: {
    justifyContent: 'center',
  },
  logoTextMain: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B2B5B',
    lineHeight: 22,
  },
  logoTextLight: {
    fontWeight: '400',
  },
  logoTextSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7A8B9E',
    letterSpacing: 2,
  },
  greetingContainer: {
    marginBottom: 24,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5B7290',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0B2B5B',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    color: '#5B7290',
    fontWeight: '500',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F0FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#18529D',
    marginBottom: 16,
    lineHeight: 60,
  },
  divider: {
    height: 1,
    backgroundColor: '#E6EDF5',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B2B5B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7A8B9E',
  },
  actionButtons: {
    paddingBottom: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#1B9356',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0B2B5B',
  },
  buttonIcon: {
    marginRight: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#0B2B5B',
    fontSize: 16,
    fontWeight: '600',
  },
});