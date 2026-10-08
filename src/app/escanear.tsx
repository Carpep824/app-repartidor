import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';

export default function EscanearCarga() {
  const router = useRouter();
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [codigos, setCodigos] = useState<string[]>([]);
  const [ultimo, setUltimo] = useState<string | null>(null);
  const bloqueo = useRef(false);

  const alEscanear = ({ data }: { data: string }) => {
    if (bloqueo.current) return;
    bloqueo.current = true;

    setUltimo(data);
    setCodigos((prev) => (prev.includes(data) ? prev : [data, ...prev]));
    Vibration.vibrate(80);

    // Pausa corta para no leer el mismo código varias veces seguidas
    setTimeout(() => {
      bloqueo.current = false;
    }, 1500);
  };

  const quitarCodigo = (codigo: string) => {
    setCodigos((prev) => prev.filter((c) => c !== codigo));
  };

  // Mientras se carga el estado del permiso
  if (!permiso) {
    return <View style={styles.mainContainer} />;
  }

  // Sin permiso: pantalla para solicitarlo
  if (!permiso.granted) {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.headerBackground}>
          <SafeAreaView>
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
                <Feather name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Escanear Carga</Text>
              <View style={{ width: 24 }} />
            </View>
          </SafeAreaView>
        </View>
        <View style={styles.permissionBox}>
          <Feather name="camera-off" size={48} color="#5B7290" />
          <Text style={styles.permissionText}>
            Necesitamos acceso a la cámara para escanear los paquetes.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={pedirPermiso}>
            <Text style={styles.primaryButtonText}>Permitir cámara</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Encabezado Azul Oscuro */}
      <View style={styles.headerBackground}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Escanear Carga</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </View>

      {/* Cámara */}
      <View style={styles.cameraWrapper}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'code128', 'code39', 'ean13', 'ean8', 'upc_a', 'pdf417'],
          }}
          onBarcodeScanned={alEscanear}
        />
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.scanFrame} />
          <Text style={styles.overlayText}>
            {ultimo ? `Último: ${ultimo}` : 'Apunta al código del paquete'}
          </Text>
        </View>
      </View>

      {/* Lista de paquetes escaneados */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>PAQUETES ESCANEADOS ({codigos.length})</Text>
        <FlatList
          data={codigos}
          keyExtractor={(item) => item}
          ListEmptyComponent={<Text style={styles.emptyText}>Aún no has escaneado ningún paquete.</Text>}
          renderItem={({ item }) => (
            <View style={styles.codeRow}>
              <Feather name="package" size={18} color="#18529D" />
              <Text style={styles.codeText} numberOfLines={1}>{item}</Text>
              <TouchableOpacity onPress={() => quitarCodigo(item)}>
                <Feather name="x" size={20} color="#7A8B9E" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      {/* Botón Listo */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, codigos.length === 0 && styles.buttonDisabled]}
          disabled={codigos.length === 0}
          onPress={() => router.back()}
        >
          <Feather name="check" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.primaryButtonText}>Listo ({codigos.length})</Text>
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
  cameraWrapper: {
    height: 320,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  overlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
},
  scanFrame: {
    width: 240,
    height: 160,
    borderWidth: 3,
    borderColor: '#10B981',
    borderRadius: 16,
  },
  overlayText: {
    position: 'absolute',
    bottom: 16,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  listContainer: {
    flex: 1,
    padding: 24,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5B7290',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  emptyText: {
    color: '#9AA6B8',
    fontSize: 13,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E6EDF5',
  },
  codeText: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#0B2B5B',
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F5F8FA',
    borderTopWidth: 1,
    borderTopColor: '#E6EDF5',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#1B9356',
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 20,
  },
  permissionText: {
    color: '#5B7290',
    fontSize: 15,
    textAlign: 'center',
  },
});