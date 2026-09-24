import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MapaNavegacion() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      
      {/* Fondo de Mapa Simulado */}
      <View style={styles.mapBackground}>
        {[20, 40, 60, 80].map((pos) => (
          <View key={`h-${pos}`} style={[styles.gridLineHorizontal, { top: `${pos}%` }]} />
        ))}
        {[25, 50, 75].map((pos) => (
          <View key={`v-${pos}`} style={[styles.gridLineVertical, { left: `${pos}%` }]} />
        ))}
        
        <View style={styles.parkArea} />

        <View style={styles.routeSegment1} />
        <View style={styles.routeSegment2} />
        <View style={styles.routeSegment3} />
        
        <View style={styles.destinationDot}>
          <View style={styles.destinationInner} />
        </View>
      </View>

      {/* Botón Flotante de Regreso */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={24} color="#132854" />
      </TouchableOpacity>

      {/* Burbuja de Instrucción Superior */}
      <View style={styles.topNavBubble}>
        <MaterialCommunityIcons name="arrow-u-right-top" size={28} color="#FFFFFF" style={styles.turnIcon} />
        <View style={styles.navTextContainer}>
          <Text style={styles.navMainText}>En 200 m, gira a la derecha</Text>
          <Text style={styles.navSubText}>hacia Blvd. Luis Encinas</Text>
        </View>
      </View>

      {/* Botón para recentrar mapa */}
      <TouchableOpacity style={styles.recenterButton}>
        <Feather name="navigation" size={24} color="#132854" />
      </TouchableOpacity>

      {/* Tarjeta Inferior (Bottom Sheet) */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />
        
        <View style={styles.stopHeader}>
          <Text style={styles.labelSiguiente}>SIGUIENTE PARADA</Text>
          <View style={styles.folioBadge}>
            <Text style={styles.folioBadgeText}>#PKT-8492</Text>
          </View>
        </View>

        <Text style={styles.addressText}>Blvd. Luis Encinas J.</Text>
        <Text style={styles.etaText}>5 min · 1.2 km</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.arriveButton}
            onPress={() => router.push('/finalizar')}
          >
            <Feather name="home" size={20} color="#FFFFFF" style={styles.btnIcon} />
            <Text style={styles.arriveButtonText}>Llegué al Domicilio</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.warningButton}
            onPress={() => router.push('/reportar')}
          >
            <Feather name="alert-triangle" size={24} color="#B45309" />
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  mapBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 12,
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
  },
  gridLineVertical: {
    position: 'absolute',
    height: '100%',
    width: 12,
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
  },
  parkArea: {
    position: 'absolute',
    bottom: '30%',
    right: '5%',
    width: 140,
    height: 90,
    backgroundColor: '#C6E0C4',
    borderRadius: 8,
  },
  routeSegment1: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 6,
    height: '25%',
    backgroundColor: '#132854',
  },
  routeSegment2: {
    position: 'absolute',
    bottom: '25%',
    left: '25%',
    width: '25%',
    height: 6,
    backgroundColor: '#132854',
  },
  routeSegment3: {
    position: 'absolute',
    bottom: '25%',
    left: '25%',
    width: 6,
    height: '50%',
    backgroundColor: '#132854',
  },
  destinationDot: {
    position: 'absolute',
    top: '25%',
    left: '22.5%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  destinationInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight! + 16 : 60,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  topNavBubble: {
    flexDirection: 'row',
    backgroundColor: '#132854',
    marginHorizontal: 16,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 80 : 124, // Ajustado hacia abajo
    padding: 20,
    borderRadius: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  turnIcon: {
    marginRight: 16,
  },
  navTextContainer: {
    flex: 1,
  },
  navMainText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  navSubText: {
    color: '#90B4E2',
    fontSize: 13,
    fontWeight: '600',
  },
  recenterButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight! + 180 : 224, // Ajustado hacia abajo
    right: 16,
    backgroundColor: '#FFFFFF',
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D9E6',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  stopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelSiguiente: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7A8B9E',
    letterSpacing: 0.5,
  },
  folioBadge: {
    backgroundColor: '#E6F0FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  folioBadgeText: {
    color: '#132854',
    fontSize: 12,
    fontWeight: '700',
  },
  addressText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0B2B5B',
    marginBottom: 8,
  },
  etaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  arriveButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#10B981',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  btnIcon: {
    marginRight: 8,
  },
  arriveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningButton: {
    width: 56,
    height: 56,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});