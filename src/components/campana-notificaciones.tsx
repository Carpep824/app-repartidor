import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useNotificaciones } from '@/hooks/use-notificaciones';
import { fechaRelativa, Notificacion } from '@/services/notificaciones';

const ICONOS: Record<string, keyof typeof Feather.glyphMap> = {
  ruta_asignada: 'map',
  paquete_agregado: 'package',
  paquete_quitado: 'minus-circle',
  paquete_actualizado: 'edit-3',
  aviso: 'info',
};

// Campana del encabezado: muestra cuántas notificaciones no leídas hay y abre el panel
export function CampanaNotificaciones() {
  const [visible, setVisible] = useState(false);
  const { notificaciones, noLeidas, cargando, error, recargar, reintentar, marcarLeida, marcarTodas } =
    useNotificaciones();

  const abrir = () => {
    setVisible(true);
    recargar();
  };

  return (
    <>
      <TouchableOpacity
        style={styles.boton}
        onPress={abrir}
        accessibilityLabel={noLeidas > 0 ? `Notificaciones, ${noLeidas} sin leer` : 'Notificaciones'}
      >
        <Feather name="bell" size={22} color="#FFFFFF" />
        {noLeidas > 0 ? (
          <View style={styles.contador}>
            <Text style={styles.contadorTexto}>{noLeidas > 9 ? '9+' : noLeidas}</Text>
          </View>
        ) : null}
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.panel} onPress={() => {}}>
            <View style={styles.encabezado}>
              <Text style={styles.titulo}>Notificaciones</Text>
              {noLeidas > 0 ? (
                <TouchableOpacity onPress={marcarTodas}>
                  <Text style={styles.marcarTodas}>Marcar todas como leídas</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {cargando && notificaciones.length === 0 ? (
              <ActivityIndicator color="#18529D" style={styles.estado} />
            ) : error && notificaciones.length === 0 ? (
              <View style={styles.estado}>
                <Text style={styles.textoError}>{error}</Text>
                <TouchableOpacity onPress={reintentar}>
                  <Text style={styles.reintentar}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : notificaciones.length === 0 ? (
              <Text style={[styles.estado, styles.textoVacio]}>No tienes notificaciones.</Text>
            ) : (
              <ScrollView style={styles.lista}>
                {notificaciones.map((n) => (
                  <ElementoNotificacion key={n.idNotificacion} notificacion={n} onPress={() => marcarLeida(n.idNotificacion)} />
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function ElementoNotificacion({ notificacion, onPress }: { notificacion: Notificacion; onPress: () => void }) {
  const { titulo, mensaje, tipo, fechaHora, leida } = notificacion;

  return (
    <Pressable
      style={[styles.elemento, !leida && styles.elementoNoLeido]}
      onPress={leida ? undefined : onPress}
    >
      <View style={[styles.icono, !leida && styles.iconoNoLeido]}>
        <Feather name={ICONOS[tipo] ?? 'bell'} size={16} color={leida ? '#7A8B9E' : '#18529D'} />
      </View>
      <View style={styles.contenido}>
        <View style={styles.filaTitulo}>
          <Text style={[styles.tituloElemento, !leida && styles.tituloNoLeido]} numberOfLines={1}>
            {titulo}
          </Text>
          {!leida ? <View style={styles.punto} /> : null}
        </View>
        <Text style={styles.mensaje}>{mensaje}</Text>
        <Text style={styles.fecha}>{fechaRelativa(fechaHora)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    padding: 4,
  },
  contador: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contadorTexto: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'flex-end',
    paddingTop: (StatusBar.currentHeight ?? 44) + 60,
    paddingHorizontal: 16,
  },
  panel: {
    width: '92%',
    maxHeight: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EDF5',
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0B2B5B',
  },
  marcarTodas: {
    fontSize: 12,
    fontWeight: '600',
    color: '#18529D',
  },
  estado: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  textoVacio: {
    color: '#5B7290',
    fontSize: 14,
    textAlign: 'center',
  },
  textoError: {
    color: '#B91C1C',
    fontSize: 13,
    textAlign: 'center',
  },
  reintentar: {
    color: '#18529D',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  lista: {
    flexGrow: 0,
  },
  elemento: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  elementoNoLeido: {
    backgroundColor: '#F3F7FC',
  },
  icono: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconoNoLeido: {
    backgroundColor: '#E6F0FA',
  },
  contenido: {
    flex: 1,
  },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tituloElemento: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#5B7290',
  },
  tituloNoLeido: {
    color: '#0B2B5B',
    fontWeight: 'bold',
  },
  punto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#18529D',
    marginLeft: 6,
  },
  mensaje: {
    fontSize: 13,
    color: '#5B7290',
    marginTop: 2,
  },
  fecha: {
    fontSize: 11,
    color: '#9AA6B8',
    marginTop: 4,
  },
});
