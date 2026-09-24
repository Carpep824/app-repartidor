# App Repartidor - Plataforma de Envíos

Aplicación móvil diseñada para optimizar la logística de última milla. Proporciona a los repartidores las herramientas necesarias para gestionar su ruta, navegar hacia los destinos, reportar incidencias y recabar evidencias de entrega de manera eficiente.

## Características Principales

La aplicación consta de 5 vistas principales integradas mediante un flujo de navegación fluido:

* **Dashboard (Inicio):** Panel de resumen de turno que muestra la cantidad de paquetes asignados, desgloses por zona/prioridad y accesos rápidos para sincronizar ruta o escanear carga manual.
* **Ruta Activa:** Lista secuencial de paradas con indicadores de progreso, etiquetas de prioridad (Frágil, Prioritario) e integración de menú lateral (Modal) para navegación global.
* **Mapa de Navegación:** Interfaz de seguimiento en tiempo real con indicaciones paso a paso, tarjeta de detalles de la próxima parada, cálculo de ETA y accesos directos para finalizar o reportar problemas.
* **Reportar Problema:** Vista modal superpuesta con opciones predefinidas para registrar incidencias (domicilio cerrado, intento fallido, dirección incorrecta o paquete dañado).
* **Completar Entrega:** Formulario de cierre que requiere captura de evidencia fotográfica, firma digital del receptor y nombre de la persona que recibe el paquete.

## Tecnologías Utilizadas

* **Framework:** [React Native](https://reactnative.dev/)
* **Entorno:** [Expo](https://expo.dev/)
* **Enrutamiento:** [Expo Router](https://docs.expo.dev/router/introduction/) (Navegación basada en la estructura del directorio `src/app`)
* **Iconografía:** `@expo/vector-icons` (Feather y MaterialCommunityIcons)

## Estructura del Proyecto

El código fuente está centralizado en el directorio `src/app/`:

```text
app-repartidor/
├── src/
│   └── app/
│       ├── _layout.tsx      # Configuración del Stack de navegación base
│       ├── index.tsx        # Dashboard principal de métricas
│       ├── ruta.tsx         # Listado de paradas y menú lateral
│       ├── mapa.tsx         # Simulación de mapa de navegación
│       ├── reportar.tsx     # Modal de selección de incidencias
│       └── finalizar.tsx    # Captura de firma y evidencia fotográfica
├── assets/                  # Imágenes y recursos estáticos
├── package.json             # Dependencias del proyecto
└── app.json                 # Configuración general de Expo
```

## **Requisitos e Instalación**

**1. Clonar el repositorio:**

```Bash
git clone [https://github.com/Carpep824/app-repartidor.git](https://github.com/Carpep824/app-repartidor.git)
```
**2. Instalar las dependencias requeridas:**

```Bash
cd app-repartidor
npm install
```

**3. Iniciar el servidor de desarrollo:**

```Bash
npx expo start
```

   **Visualización**
- Dispositivo físico: Descarga la aplicación Expo Go (disponible en iOS y Android) y escanea el código QR generado en la terminal.
- Navegador Web: Presiona la tecla w en la terminal durante la ejecución para previsualizar la interfaz.
