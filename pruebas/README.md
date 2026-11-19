# Pruebas de la app del repartidor (PaqTracker)

| Archivo | Qué es |
|---|---|
| `Documento de pruebas Movil - PaqTracker.xlsx` | Documento de pruebas de esta app móvil. Se llenan las columnas Resultado, Comentarios y Calificación; los totales y la hoja Resumen se calculan solos. |
| `Ejemplo - Documento de pruebas web y API.xlsx` | Documento original del equipo del backend (web del administrador y API). Sirvió de plantilla para el formato. |
| `pruebas-api.mjs` | Script que prueba automáticamente la API que usa la app: login, sesión, paquetes, entregas, validaciones y notificaciones. |
| `resultados/` | CSV que genera el script en cada corrida (no se sube a Git). |

## Correr las pruebas automáticas

Requiere Node 22 y que la API esté encendida. Desde la raíz del proyecto, en PowerShell:

```powershell
$env:PAQ_EMAIL="correo_del_repartidor"; $env:PAQ_PASSWORD="su_contraseña"
npm run pruebas:api
```

- Toma la URL de la API de `EXPO_PUBLIC_API_URL` en el `.env` (o de `PAQ_API_URL`).
- Sin opciones, **no modifica la base**: solo lee y manda datos inválidos que el servidor debe rechazar.
- `npm run pruebas:api -- --escritura --folio=PKT-8492` registra **una entrega real** de ese folio (debe estar "En ruta") y marca las notificaciones como leídas.
- Con `PAQ_ADMIN_EMAIL` y `PAQ_ADMIN_PASSWORD` también revisa qué pasa con la cuenta Admin (F-04).

Cada corrida guarda `resultados/resultados-api_<fecha>_<hora>.csv`. Los IDs (F-xx y API-xx) son los mismos del documento de Excel, para copiar los resultados.
