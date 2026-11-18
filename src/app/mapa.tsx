import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePaquetes } from '../hooks/use-paquetes';
import { Coordenadas, obtenerCoordenadas } from '../services/coordenadas';

// Interfaz para la instrucción visual de la interfaz
interface ManiobraUI {
  instruccion: string;
  icono: any;
  latManeuver: number;
  lngManeuver: number;
}

// Fórmula de Haversine para distancia en metros
const calcularDistanciaMetros = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; 
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Traductor avanzado de maniobras OSRM
const traducirManiobra = (step: any): ManiobraUI => {
  const type = step.maneuver.type;
  const modifier = step.maneuver.modifier;
  const streetName = step.name || '';

  let icono = 'arrow-up-bold';
  let texto = 'Continúa';

  if (type === 'turn') {
    if (modifier === 'right') { icono = 'arrow-right-bold'; texto = 'Gira a la derecha'; }
    else if (modifier === 'left') { icono = 'arrow-left-bold'; texto = 'Gira a la izquierda'; }
    else if (modifier === 'slight right') { icono = 'arrow-top-right-bold'; texto = 'Gira levemente a la derecha'; }
    else if (modifier === 'slight left') { icono = 'arrow-top-left-bold'; texto = 'Gira levemente a la izquierda'; }
    else if (modifier === 'sharp right') { icono = 'arrow-u-right-top-bold'; texto = 'Giro cerrado a la derecha'; }
    else if (modifier === 'sharp left') { icono = 'arrow-u-left-top-bold'; texto = 'Giro cerrado a la izquierda'; }
    else if (modifier === 'uturn') { icono = 'arrow-u-down-left-bold'; texto = 'Da vuelta en U'; }
  } else if (type === 'roundabout') {
    icono = 'sync';
    texto = 'En la rotonda, toma la salida';
  } else if (type === 'arrive') {
    icono = 'map-marker-check';
    texto = 'Llegada al destino';
  } else if (type === 'merge') {
    icono = 'call-merge';
    texto = 'Incorpórate';
  } else if (type === 'off ramp') {
    icono = 'exit-to-app';
    texto = 'Toma la salida';
  } else if (type === 'fork') {
    icono = 'call-split';
    texto = modifier === 'right' ? 'Mantente a la derecha' : 'Mantente a la izquierda';
  } else if (type === 'end of road') {
    icono = modifier === 'right' ? 'arrow-right-bold' : 'arrow-left-bold';
    texto = modifier === 'right' ? 'Gira a la derecha al final' : 'Gira a la izquierda al final';
  }

  // Concatenar el nombre de la calle si existe y no es el destino final
  if (streetName && type !== 'arrive') {
    texto += ` hacia ${streetName}`;
  } else if (!streetName && (type === 'depart' || texto === 'Continúa')) {
    texto += ' por la vía';
  }

  return {
    instruccion: texto,
    icono: icono,
    latManeuver: step.maneuver.location[1],
    lngManeuver: step.maneuver.location[0]
  };
};

export default function MapaNavegacion() {
  const router = useRouter();
  const { folio } = useLocalSearchParams<{ folio?: string }>();
  const mapRef = useRef<MapView>(null);

  const { getPaqueteByFolio, cargando } = usePaquetes();
  const paqueteActual = folio ? getPaqueteByFolio(folio) : null;

  // Coordenadas del destino: vienen del backend o se calculan a partir de la dirección
  const [ubicacionDestino, setUbicacionDestino] = useState<{ folio: string; coords: Coordenadas | null } | null>(null);
  const destino = paqueteActual && ubicacionDestino?.folio === paqueteActual.folio ? ubicacionDestino.coords : null;
  const buscandoDestino = paqueteActual !== null && ubicacionDestino?.folio !== paqueteActual.folio;

  // Referencias mutables para usarlas de forma segura dentro del listener del GPS sin causar re-renders
  const destinoRef = useRef<Coordenadas | null>(null);
  const rutaCoordenadasRef = useRef<{ latitude: number; longitude: number }[]>([]);
  const enRecalculoRef = useRef<boolean>(false);
  const esFallbackRef = useRef<boolean>(false);

  // Estados visuales
  const [ubicacionActual, setUbicacionActual] = useState<{ latitude: number; longitude: number } | null>(null);
  const [rutaCoordenadas, setRutaCoordenadas] = useState<{ latitude: number; longitude: number }[]>([]);
  const [distanciaTotalTexto, setDistanciaTotalTexto] = useState<string>('-- km');
  const [duracionTotalTexto, setDuracionTotalTexto] = useState<string>('-- min');
  
  const [instrucciones, setInstrucciones] = useState<ManiobraUI[]>([]);
  const [pasoActualIndex, setPasoActualIndex] = useState<number>(0);
  const [distanciaAlGiro, setDistanciaAlGiro] = useState<number>(0);
  const [permisoGPS, setPermisoGPS] = useState<boolean | null>(null);
  const [estadoNavegacion, setEstadoNavegacion] = useState<string>('Calculando...');
  const [alturaBanner, setAlturaBanner] = useState<number>(0);

  // Mantener actualizado el destino en la referencia
  useEffect(() => { destinoRef.current = destino; }, [destino]);

  // Obtener las coordenadas del paquete cuando ya se cargó
  useEffect(() => {
    if (!paqueteActual) return;
    let activo = true;
    obtenerCoordenadas(paqueteActual).then((coords) => {
      if (activo) setUbicacionDestino({ folio: paqueteActual.folio, coords });
    });
    return () => { activo = false; };
  }, [paqueteActual]);

  // Función núcleo para trazar la ruta (Llamada al inicio y cuando hay desvío)
  const calcularYSetearRuta = async (latOrigen: number, lngOrigen: number, esRecalculo = false) => {
    if (!destinoRef.current) return;

    enRecalculoRef.current = true;
    if (esRecalculo) setEstadoNavegacion('Recalculando ruta...');

    const { latitude: latDestino, longitude: lngDestino } = destinoRef.current;

    try {
      const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${lngOrigen},${latOrigen};${lngDestino},${latDestino}?overview=full&geometries=geojson&steps=true`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); 
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Error en servidor");
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const puntosRuta = route.geometry.coordinates.map((c: [number, number]) => ({ latitude: c[1], longitude: c[0] }));
        
        // Actualizar estados y referencias
        setRutaCoordenadas(puntosRuta);
        rutaCoordenadasRef.current = puntosRuta;
        esFallbackRef.current = false;
        
        setDistanciaTotalTexto(`${(route.distance / 1000).toFixed(1)} km`);
        setDuracionTotalTexto(`${Math.ceil(route.duration / 60)} min`);

        if (route.legs && route.legs[0].steps) {
          const rawSteps = route.legs[0].steps;
          // Ignoramos el paso 0 ("Depart") para mostrar al conductor la *próxima* maniobra real
          const stepsMapeados = rawSteps.length > 1 ? rawSteps.slice(1).map(traducirManiobra) : rawSteps.map(traducirManiobra);
          
          setInstrucciones(stepsMapeados);
          setPasoActualIndex(0);
          
          const primerGiro = stepsMapeados[0];
          const distInicial = Math.round(calcularDistanciaMetros(latOrigen, lngOrigen, primerGiro.latManeuver, primerGiro.lngManeuver));
          setDistanciaAlGiro(distInicial);
          setEstadoNavegacion(distInicial > 1000 ? `${(distInicial / 1000).toFixed(1)} km` : `${distInicial} m`);
        }
      }
    } catch (error) {
      console.warn("Fallo en cálculo, usando línea directa:", error);
      const rutaDirecta = [
        { latitude: latOrigen, longitude: lngOrigen },
        { latitude: latDestino, longitude: lngDestino }
      ];
      setRutaCoordenadas(rutaDirecta);
      rutaCoordenadasRef.current = rutaDirecta;
      esFallbackRef.current = true;
      
      const distDirecta = Math.round(calcularDistanciaMetros(latOrigen, lngOrigen, latDestino, lngDestino));
      setInstrucciones([{ instruccion: 'Dirígete al destino', icono: 'navigation-variant', latManeuver: latDestino, lngManeuver: lngDestino }]);
      setPasoActualIndex(0);
      setDistanciaAlGiro(distDirecta);
      setEstadoNavegacion(distDirecta > 1000 ? `${(distDirecta / 1000).toFixed(1)} km` : `${distDirecta} m`);
    } finally {
      enRecalculoRef.current = false;
    }
  };

  // Escuchador principal de GPS
  useEffect(() => {
    if (!destino) return; // Sin destino no hay ruta que trazar

    let subscription: Location.LocationSubscription | null = null;
    let cancelado = false;
    let inicializado = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelado) return;
      if (status !== 'granted') {
        setPermisoGPS(false);
        return;
      }
      setPermisoGPS(true);

      const nuevaSuscripcion = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 5, // Se actualiza cada 5 metros recorridos
        },
        (newLoc) => {
          const lat = newLoc.coords.latitude;
          const lng = newLoc.coords.longitude;
          setUbicacionActual({ latitude: lat, longitude: lng });

          // Trazar ruta por primera vez
          if (!inicializado) {
            inicializado = true;
            calcularYSetearRuta(lat, lng, false);
            return;
          }

          // 1. Detección Inteligente de Desvío (Rerouting)
          if (rutaCoordenadasRef.current.length > 0 && !enRecalculoRef.current && !esFallbackRef.current) {
            let distanciaMinimaALaRuta = Infinity;
            
            // Revisamos cada 3 puntos de la línea trazada para optimizar rendimiento
            for (let i = 0; i < rutaCoordenadasRef.current.length; i += 3) {
              const p = rutaCoordenadasRef.current[i];
              const d = calcularDistanciaMetros(lat, lng, p.latitude, p.longitude);
              if (d < distanciaMinimaALaRuta) distanciaMinimaALaRuta = d;
            }

            // Si el coche está a más de 50 metros de cualquier punto de la ruta prevista, se desvió
            if (distanciaMinimaALaRuta > 50) {
              calcularYSetearRuta(lat, lng, true);
              return; // Detenemos la ejecución para no cruzar estados
            }
          }

          // 2. Avance Dinámico de Instrucciones
          setInstrucciones(prevInstrucciones => {
            if (prevInstrucciones.length > 0 && !enRecalculoRef.current) {
              setPasoActualIndex(prevIndex => {
                const pasoActivo = prevInstrucciones[prevIndex];
                if (pasoActivo) {
                  const metrosFaltantes = calcularDistanciaMetros(lat, lng, pasoActivo.latManeuver, pasoActivo.lngManeuver);
                  setDistanciaAlGiro(Math.round(metrosFaltantes));
                  setEstadoNavegacion(metrosFaltantes > 1000 ? `${(metrosFaltantes / 1000).toFixed(1)} km` : `${Math.round(metrosFaltantes)} m`);
                  
                  // Si estamos a menos de 25 metros de la maniobra, mostramos la siguiente
                  if (metrosFaltantes < 25 && prevIndex < prevInstrucciones.length - 1) {
                    return prevIndex + 1;
                  }
                }
                return prevIndex;
              });
            }
            return prevInstrucciones;
          });
        }
      );

      // Si la pantalla se cerró mientras se pedía el GPS, no dejamos la suscripción viva
      if (cancelado) {
        nuevaSuscripcion.remove();
      } else {
        subscription = nuevaSuscripcion;
      }
    })();

    return () => {
      cancelado = true;
      if (subscription) subscription.remove();
    };
  }, [destino]); // Se reinicia solo si cambia el destino

  const centrarEnUbicacion = () => {
    if (ubicacionActual && mapRef.current) {
      mapRef.current.animateCamera({
        center: { latitude: ubicacionActual.latitude, longitude: ubicacionActual.longitude },
        zoom: 17.5,
        pitch: 55,
        heading: 0,
      }, { duration: 1200 });
    }
  };

  if (cargando || buscandoDestino) {
    return (
      <View style={[styles.container, styles.centrado]}>
        <ActivityIndicator size="large" color="#0F9D58" />
        <Text style={styles.textoEstadoPantalla}>Preparando ruta...</Text>
      </View>
    );
  }

  if (!paqueteActual) {
    return (
      <View style={[styles.container, styles.centrado]}>
        <MaterialCommunityIcons name="package-variant-remove" size={56} color="#5B7290" />
        <Text style={styles.textoEstadoPantalla}>No se encontró el paquete {folio ?? ''}.</Text>
        <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
          <Text style={styles.botonVolverTexto}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pasoActivo = instrucciones.length > 0 ? instrucciones[pasoActualIndex] : null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.mapBackground}
        showsUserLocation={permisoGPS ?? false}
        showsMyLocationButton={false}
        pitchEnabled={true}
        initialRegion={{
          latitude: destino ? destino.latitude : 29.08919,
          longitude: destino ? destino.longitude : -110.96133,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {destino && <Marker coordinate={destino} />}
        {rutaCoordenadas.length > 0 && (
          <Polyline coordinates={rutaCoordenadas} strokeWidth={6} strokeColor="#2563EB" />
        )}
      </MapView>

      {/* BANNER DE NAVEGACIÓN INTELIGENTE */}
      <View
        style={styles.navBanner}
        onLayout={(e) => setAlturaBanner(e.nativeEvent.layout.height)}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.navBannerContent}>
            <MaterialCommunityIcons 
              name={pasoActivo ? pasoActivo.icono : 'map-search-outline'} 
              size={54} 
              color="#FFFFFF" 
            />
            <View style={styles.navBannerTextContainer}>
              <Text style={styles.navDistanceText}>{destino ? estadoNavegacion : 'Sin ubicación'}</Text>
              <Text style={styles.navInstructionText} numberOfLines={2}>
                {pasoActivo ? pasoActivo.instruccion : `Hacia: ${paqueteActual?.direccionDestino || 'Destino'}`}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <TouchableOpacity
        style={[styles.backButton, { top: alturaBanner + 12 }]}
        onPress={() => router.back()}
      >
        <Feather name="x" size={26} color="#1F2937" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.recenterButton} onPress={centrarEnUbicacion}>
        <MaterialCommunityIcons name="crosshairs-gps" size={30} color="#0F9D58" />
      </TouchableOpacity>

      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />
        <View style={styles.stopHeader}>
          <Text style={styles.labelSiguiente}>TIEMPO ESTIMADO (#{paqueteActual?.folio})</Text>
        </View>
        <Text style={styles.addressText} numberOfLines={1}>{paqueteActual?.direccionDestino}</Text>
        <Text style={styles.etaText}>{duracionTotalTexto} · {distanciaTotalTexto}</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.arriveButton}
            onPress={() => router.push({ pathname: '/finalizar', params: { folio: paqueteActual?.folio } })}
          >
            <Text style={styles.arriveButtonText}>Finalizar Entrega</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E2E8F0' },
  centrado: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  textoEstadoPantalla: { marginTop: 12, color: '#5B7290', fontWeight: 'bold', textAlign: 'center' },
  botonVolver: { marginTop: 20, backgroundColor: '#0F172A', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  botonVolverTexto: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  mapBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  
  navBanner: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: '#0F9D58',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 12,
    zIndex: 20,
  },
  navBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingTop: Platform.OS === 'android' ? 15 : 20,
  },
  navBannerTextContainer: {
    marginLeft: 16,
    flex: 1,
    justifyContent: 'center',
  },
  navDistanceText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 2,
  },
  navInstructionText: {
    color: '#E8F5E9',
    fontSize: 19,
    fontWeight: '600',
    lineHeight: 23,
  },

  backButton: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 10,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 230,
    right: 16,
    backgroundColor: '#FFFFFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 15,
  },
  dragHandle: { width: 42, height: 5, backgroundColor: '#CBD5E1', borderRadius: 2.5, alignSelf: 'center', marginBottom: 16 },
  stopHeader: { marginBottom: 4 },
  labelSiguiente: { fontSize: 12, fontWeight: '800', color: '#10B981', letterSpacing: 0.5 },
  addressText: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 4 },
  etaText: { fontSize: 18, fontWeight: '600', color: '#64748B', marginBottom: 20 },
  actionButtons: { flexDirection: 'row' },
  arriveButton: { flex: 1, backgroundColor: '#0F172A', height: 58, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  arriveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
});