#!/usr/bin/env node
/**
 * Pruebas automáticas de la API que usa la app del repartidor (PaqTracker).
 *
 * Uso (PowerShell, desde la raíz del proyecto):
 *   $env:PAQ_EMAIL="repartidor@correo.com"; $env:PAQ_PASSWORD="su_contraseña"
 *   npm run pruebas:api
 *   (o: node pruebas/pruebas-api.mjs; para pasar opciones: npm run pruebas:api -- --escritura --folio=PKT-8492)
 *
 * Opcional:
 *   $env:PAQ_ADMIN_EMAIL / $env:PAQ_ADMIN_PASSWORD  → prueba F-04 (acceso con cuenta Admin)
 *   $env:PAQ_API_URL                                 → si no, se lee EXPO_PUBLIC_API_URL del .env
 *   --escritura --folio=PKT-8492                     → registra UNA entrega real de ese folio
 *                                                      (debe estar "En ruta") y marca las
 *                                                      notificaciones como leídas
 *
 * Sin --escritura el script no cambia nada en la base, salvo que el servidor tenga un defecto
 * y acepte datos que debería rechazar (eso se reporta como FALLÓ).
 *
 * Al final guarda un CSV con fecha y hora en pruebas/resultados/ (se abre en Excel).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- Configuración ----------
const args = process.argv.slice(2);
const ESCRITURA = args.includes('--escritura');
const FOLIO_ESCRITURA = args.find((a) => a.startsWith('--folio='))?.split('=')[1];

function leerApiUrlDelEnv() {
  try {
    const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
    const env = readFileSync(join(raiz, '.env'), 'utf8');
    return env.match(/^EXPO_PUBLIC_API_URL=(.+)$/m)?.[1]?.trim();
  } catch {
    return undefined;
  }
}

const API = (process.env.PAQ_API_URL || leerApiUrlDelEnv() || '').replace(/\/$/, '');
const EMAIL = process.env.PAQ_EMAIL;
const PASSWORD = process.env.PAQ_PASSWORD;
const ADMIN_EMAIL = process.env.PAQ_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PAQ_ADMIN_PASSWORD;

if (!API) {
  console.error('No encontré la URL de la API. Define PAQ_API_URL o EXPO_PUBLIC_API_URL en el .env.');
  process.exit(1);
}
if (ESCRITURA && !FOLIO_ESCRITURA) {
  console.error('Con --escritura indica el folio a entregar: --folio=PKT-8492');
  process.exit(1);
}

// JPEG real de 8x8 px (633 bytes) para la foto de evidencia
const JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDzaiiivtj5c//Z';
const FIRMA_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120"><rect width="100%" height="100%" fill="#FFFFFF"/><path d="M20,80 L60,40 L100,90 L140,30 L180,85" fill="none" stroke="#0B2B5B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const FOLIO_INEXISTENTE = 'NO-EXISTE-' + Date.now();

// ---------- Resultados ----------
const resultados = [];
const ICONO = { 'Pasó': '✔', 'Falló': '✘', 'Bloqueado': '■', 'Revisar': '!', 'Info': 'i' };

function registrar(id, prueba, resultado, detalle = '') {
  resultados.push({ id, prueba, resultado, detalle });
  console.log(`${ICONO[resultado] ?? ' '} ${id.padEnd(7)} ${resultado.padEnd(9)} ${prueba}${detalle ? `\n            ${detalle}` : ''}`);
}

// ---------- HTTP con cookie de sesión ----------
class Sesion {
  constructor() {
    this.cookies = new Map();
  }
  get cabecera() {
    return [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ');
  }
  guardar(respuesta) {
    for (const linea of respuesta.headers.getSetCookie?.() ?? []) {
      const [par] = linea.split(';');
      const i = par.indexOf('=');
      if (i > 0) this.cookies.set(par.slice(0, i).trim(), par.slice(i + 1).trim());
    }
  }
  async pedir(ruta, opciones = {}) {
    const inicio = Date.now();
    const headers = { ...(opciones.headers ?? {}) };
    if (this.cookies.size) headers.Cookie = this.cabecera;
    if (opciones.json !== undefined) {
      headers['Content-Type'] = 'application/json';
      opciones.body = JSON.stringify(opciones.json);
    }
    const url = ruta.startsWith('http') ? ruta : `${API}${ruta}`;
    const respuesta = await fetch(url, {
      method: opciones.method ?? 'GET',
      headers,
      body: opciones.body,
      redirect: 'manual',
      signal: AbortSignal.timeout(15000),
    });
    this.guardar(respuesta);
    const texto = await respuesta.text();
    let json = null;
    try {
      json = texto ? JSON.parse(texto) : null;
    } catch {
      /* no es JSON */
    }
    return {
      status: respuesta.status,
      tipo: respuesta.headers.get('content-type') ?? '',
      allow: respuesta.headers.get('allow') ?? '',
      texto,
      json,
      ms: Date.now() - inicio,
    };
  }
}

const sinSesion = new Sesion();

function formEntrega({ folio, nombre = 'Prueba automática', firma = FIRMA_SVG, foto = 'jpeg', omitir = [] }) {
  const form = new FormData();
  if (!omitir.includes('folio')) form.append('folio', folio);
  if (!omitir.includes('nombreReceptor')) form.append('nombreReceptor', nombre);
  if (!omitir.includes('firmaSvg')) form.append('firmaSvg', firma);
  if (!omitir.includes('foto')) {
    if (foto === 'jpeg') {
      form.append('foto', new Blob([Buffer.from(JPEG_BASE64, 'base64')], { type: 'image/jpeg' }), 'evidencia.jpg');
    } else {
      form.append('foto', new Blob(['esto no es una imagen'], { type: 'text/plain' }), 'notas.txt');
    }
  }
  return form;
}

const esHtml = (r) => r.tipo.includes('text/html');
const noExiste = (r) => r.status === 405 || r.status === 404 || esHtml(r);
const resumen = (r) => `HTTP ${r.status}${r.texto && !esHtml(r) ? ` · ${r.texto.slice(0, 140).replace(/\s+/g, ' ')}` : ''}`;

async function intentar(id, prueba, fn) {
  try {
    await fn();
  } catch (e) {
    const msg = e?.name === 'TimeoutError' ? 'El servidor no respondió en 15 s.' : (e?.cause?.code ?? e?.message ?? String(e));
    registrar(id, prueba, 'Falló', `Error de conexión: ${msg}`);
  }
}

// Validación de entregas: espera 400. 409 = el servidor revisó el estado antes de validar.
function evaluarRechazo(id, prueba, r) {
  if (r.status === 400) registrar(id, prueba, 'Pasó', resumen(r));
  else if (r.status >= 200 && r.status < 300) registrar(id, prueba, 'Falló', `El servidor ACEPTÓ datos inválidos (${resumen(r)}). Revisa COMPROBANTES_ENTREGA.`);
  else if (r.status === 409) registrar(id, prueba, 'Revisar', `Respondió 409 (ya entregado) antes de validar los datos. Repetir con un folio "En ruta". ${resumen(r)}`);
  else if (noExiste(r)) registrar(id, prueba, 'Bloqueado', 'El endpoint POST /api/entregas no está disponible.');
  else registrar(id, prueba, 'Falló', `Se esperaba 400. ${resumen(r)}`);
}

// ---------- Pruebas ----------
async function main() {
  console.log(`\nPruebas de API · ${API}`);
  console.log(`Modo: ${ESCRITURA ? `ESCRITURA (entrega real del folio ${FOLIO_ESCRITURA})` : 'solo lectura y validaciones'}\n`);

  // F-01: el servidor responde
  await intentar('F-01', 'La API responde en menos de 10 s', async () => {
    const r = await sinSesion.pedir('/auth/me');
    if (r.ms < 10000) registrar('F-01', 'La API responde en menos de 10 s', 'Pasó', `HTTP ${r.status} en ${r.ms} ms`);
    else registrar('F-01', 'La API responde en menos de 10 s', 'Falló', `Tardó ${r.ms} ms`);
  });

  // --- Sin sesión ---
  await intentar('API-01', 'Sin sesión: /auth/me, /packages y /entregas responden 401', async () => {
    const me = await sinSesion.pedir('/auth/me');
    const paq = await sinSesion.pedir('/packages');
    const ent = await sinSesion.pedir('/entregas', { method: 'POST', body: formEntrega({ folio: FOLIO_INEXISTENTE }) });
    const estados = `me=${me.status}, packages=${paq.status}, entregas=${ent.status}`;
    if (noExiste(ent)) registrar('API-01', 'Sin sesión: /auth/me, /packages y /entregas responden 401', 'Bloqueado', `POST /entregas no existe (${estados})`);
    else if ([me, paq, ent].every((r) => r.status === 401)) registrar('API-01', 'Sin sesión: /auth/me, /packages y /entregas responden 401', 'Pasó', estados);
    else registrar('API-01', 'Sin sesión: /auth/me, /packages y /entregas responden 401', 'Falló', estados);
  });

  await intentar('API-02', 'Una ruta /api que no existe responde 404', async () => {
    const r = await sinSesion.pedir('/ruta-que-no-existe-' + Date.now(), { method: 'POST' });
    if (r.status === 404) registrar('API-02', 'Una ruta /api que no existe responde 404', 'Pasó', 'HTTP 404');
    else registrar('API-02', 'Una ruta /api que no existe responde 404', 'Falló', `HTTP ${r.status}${r.allow ? ` (Allow: ${r.allow})` : ''}. El comodín de la página web está atendiendo rutas de API.`);
  });

  await intentar('API-03', 'Sin sesión: /notificaciones responde 401', async () => {
    const r = await sinSesion.pedir('/notificaciones');
    if (r.status === 401) registrar('API-03', 'Sin sesión: /notificaciones responde 401', 'Pasó', 'HTTP 401');
    else if (noExiste(r)) registrar('API-03', 'Sin sesión: /notificaciones responde 401', 'Bloqueado', 'GET /api/notificaciones todavía no existe.');
    else registrar('API-03', 'Sin sesión: /notificaciones responde 401', 'Falló', resumen(r));
  });

  // F-05: credenciales incorrectas y campos vacíos
  await intentar('F-05', 'Login con contraseña incorrecta y con campos vacíos se rechaza', async () => {
    const intruso = new Sesion();
    const mala = await intruso.pedir('/auth/login', { method: 'POST', json: { email: EMAIL || 'nadie@ejemplo.com', password: 'contraseña-incorrecta-123' } });
    const meIntruso = await intruso.pedir('/auth/me');
    const vacia = await new Sesion().pedir('/auth/login', { method: 'POST', json: { email: '', password: '' } });
    const detalle = `incorrecta=${mala.status}, me tras intento=${meIntruso.status}, vacíos=${vacia.status}`;
    const ok = mala.status >= 400 && mala.status < 500 && meIntruso.status === 401 && vacia.status >= 400 && vacia.status < 500;
    registrar('F-05', 'Login con contraseña incorrecta y con campos vacíos se rechaza', ok ? 'Pasó' : 'Falló', detalle);
  });

  // --- Con sesión de repartidor ---
  if (!EMAIL || !PASSWORD) {
    registrar('F-03', 'Pruebas con sesión', 'Bloqueado', 'Define PAQ_EMAIL y PAQ_PASSWORD para ejecutar el resto.');
    return;
  }

  const s = new Sesion();
  let logueado = false;
  await intentar('F-03', 'Login válido y /auth/me devuelve el usuario', async () => {
    const login = await s.pedir('/auth/login', { method: 'POST', json: { email: EMAIL, password: PASSWORD } });
    const me = await s.pedir('/auth/me');
    const nombre = me.json?.nombre ?? me.json?.name ?? me.json?.user?.nombre ?? me.json?.email;
    logueado = login.status >= 200 && login.status < 300 && me.status === 200;
    registrar('F-03', 'Login válido y /auth/me devuelve el usuario', logueado ? 'Pasó' : 'Falló', `login=${login.status}, me=${me.status}${nombre ? `, usuario=${nombre}` : ''}`);
  });
  if (!logueado) return;

  // Paquetes
  let paquetes = [];
  await intentar('F-09', 'GET /packages devuelve la lista con los campos que usa la app', async () => {
    const r = await s.pedir('/packages');
    if (r.status === 403) {
      registrar('F-09', 'GET /packages devuelve la lista con los campos que usa la app', 'Falló', 'HTTP 403: esta cuenta no tiene permiso para ver paquetes.');
      return;
    }
    const campos = ['idPaquete', 'folio', 'direccionDestino', 'esPrioritario', 'esFragil', 'estadoActual'];
    const tipos = { idPaquete: 'number', folio: 'string', direccionDestino: 'string', esPrioritario: 'boolean', esFragil: 'boolean', estadoActual: 'string' };
    if (r.status !== 200 || !Array.isArray(r.json)) {
      registrar('F-09', 'GET /packages devuelve la lista con los campos que usa la app', 'Falló', resumen(r));
      return;
    }
    paquetes = r.json;
    const malos = paquetes.filter((p) => campos.some((c) => typeof p[c] !== tipos[c]));
    const enRuta = paquetes.filter((p) => String(p.estadoActual).trim().toLowerCase() === 'en ruta');
    const cuenta = `total=${paquetes.length}, prioritarios=${paquetes.filter((p) => p.esPrioritario).length}, frágiles=${paquetes.filter((p) => p.esFragil).length}, en ruta=${enRuta.length}`;
    if (malos.length) registrar('F-09', 'GET /packages devuelve la lista con los campos que usa la app', 'Falló', `${malos.length} paquete(s) con campos faltantes o nulos (folios: ${malos.map((p) => p.folio).join(', ')}). La app los rechaza.`);
    else registrar('F-09', 'GET /packages devuelve la lista con los campos que usa la app', 'Pasó', `${cuenta}. Compara con los contadores de Inicio.`);
    registrar('F-11', 'Folios "En ruta" que debe mostrar Ruta Activa', 'Info', enRuta.map((p) => p.folio).join(', ') || '(ninguno)');
  });

  await intentar('API-04', 'GET /packages incluye coordenadasDestino válidas', async () => {
    if (!paquetes.length) return registrar('API-04', 'GET /packages incluye coordenadasDestino válidas', 'Bloqueado', 'No hay paquetes para revisar.');
    const sinCampo = paquetes.filter((p) => !('coordenadasDestino' in p));
    if (sinCampo.length === paquetes.length) return registrar('API-04', 'GET /packages incluye coordenadasDestino válidas', 'Falló', 'La API no manda el campo coordenadasDestino (el mapa calcula la ubicación desde la dirección).');
    // Rango aproximado de Hermosillo
    const fuera = paquetes.filter((p) => {
      if (!p.coordenadasDestino) return false;
      const [lat, lng] = String(p.coordenadasDestino).split(',').map((x) => Number(x.trim()));
      return !(lat > 28.9 && lat < 29.3 && lng > -111.2 && lng < -110.8);
    });
    if (fuera.length) registrar('API-04', 'GET /packages incluye coordenadasDestino válidas', 'Revisar', `Coordenadas fuera de Hermosillo: ${fuera.map((p) => `${p.folio} (${p.coordenadasDestino})`).join(', ')}`);
    else registrar('API-04', 'GET /packages incluye coordenadasDestino válidas', 'Pasó', `${paquetes.filter((p) => p.coordenadasDestino).length} con coordenadas, ${paquetes.filter((p) => !p.coordenadasDestino).length} en null`);
  });

  // Entregas: validaciones (no deberían escribir nada)
  const entregado = paquetes.find((p) => String(p.estadoActual).trim().toLowerCase() === 'entregado');
  const folioValidacion = entregado?.folio ?? FOLIO_INEXISTENTE;

  await intentar('API-05', 'POST /entregas con folio inexistente responde 404', async () => {
    const r = await s.pedir('/entregas', { method: 'POST', body: formEntrega({ folio: FOLIO_INEXISTENTE }) });
    if (r.status === 404 && !esHtml(r)) registrar('API-05', 'POST /entregas con folio inexistente responde 404', 'Pasó', resumen(r));
    else if (noExiste(r)) registrar('API-05', 'POST /entregas con folio inexistente responde 404', 'Bloqueado', 'El endpoint no está disponible.');
    else registrar('API-05', 'POST /entregas con folio inexistente responde 404', 'Falló', resumen(r));
  });

  for (const [id, prueba, opciones] of [
    ['API-06', 'POST /entregas sin foto responde 400', { omitir: ['foto'] }],
    ['API-07', 'POST /entregas con un archivo que no es imagen responde 400', { foto: 'texto' }],
    ['API-08', 'POST /entregas con nombre vacío responde 400', { nombre: '' }],
    ['API-09', 'POST /entregas con nombre de más de 150 caracteres responde 400', { nombre: 'N'.repeat(151) }],
    ['API-10', 'POST /entregas sin firma responde 400', { omitir: ['firmaSvg'] }],
  ]) {
    await intentar(id, prueba, async () => {
      const r = await s.pedir('/entregas', { method: 'POST', body: formEntrega({ folio: folioValidacion, ...opciones }) });
      evaluarRechazo(id, prueba, r);
    });
  }

  // Notificaciones (lectura)
  let notificaciones = null;
  await intentar('API-11', 'GET /notificaciones devuelve la lista con el formato que usa la app', async () => {
    const r = await s.pedir('/notificaciones');
    if (noExiste(r)) return registrar('API-11', 'GET /notificaciones devuelve la lista con el formato que usa la app', 'Bloqueado', 'GET /api/notificaciones todavía no existe.');
    if (r.status !== 200 || !Array.isArray(r.json)) return registrar('API-11', 'GET /notificaciones devuelve la lista con el formato que usa la app', 'Falló', resumen(r));
    notificaciones = r.json;
    const malas = r.json.filter((n) => typeof n.idNotificacion !== 'number' || typeof n.titulo !== 'string' || typeof n.mensaje !== 'string' || typeof n.fechaHora !== 'string' || typeof n.leida !== 'boolean');
    const sinZ = r.json.filter((n) => typeof n.fechaHora === 'string' && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(n.fechaHora));
    const ordenadas = r.json.every((n, i, a) => i === 0 || new Date(a[i - 1].fechaHora) >= new Date(n.fechaHora));
    if (malas.length) registrar('API-11', 'GET /notificaciones devuelve la lista con el formato que usa la app', 'Falló', `${malas.length} con campos faltantes o de otro tipo.`);
    else if (sinZ.length) registrar('API-11', 'GET /notificaciones devuelve la lista con el formato que usa la app', 'Revisar', `${sinZ.length} fecha(s) sin zona horaria (sin "Z"). La app las toma como UTC.`);
    else if (!ordenadas) registrar('API-11', 'GET /notificaciones devuelve la lista con el formato que usa la app', 'Falló', 'No vienen ordenadas de la más reciente a la más antigua.');
    else registrar('API-11', 'GET /notificaciones devuelve la lista con el formato que usa la app', 'Pasó', `${r.json.length} notificación(es), ${r.json.filter((n) => !n.leida).length} sin leer`);
  });

  await intentar('API-12', 'Marcar como leída una notificación inexistente responde 404', async () => {
    if (notificaciones === null) return registrar('API-12', 'Marcar como leída una notificación inexistente responde 404', 'Bloqueado', 'El servicio de notificaciones no está disponible.');
    const r = await s.pedir('/notificaciones/999999999/leida', { method: 'POST' });
    registrar('API-12', 'Marcar como leída una notificación inexistente responde 404', r.status === 404 && !esHtml(r) ? 'Pasó' : 'Falló', resumen(r));
  });

  // --- Escritura (solo con --escritura) ---
  if (ESCRITURA) {
    const objetivo = paquetes.find((p) => p.folio === FOLIO_ESCRITURA);
    if (!objetivo) {
      registrar('F-30', 'Registrar una entrega completa', 'Bloqueado', `No encontré el folio ${FOLIO_ESCRITURA} en /packages.`);
    } else if (String(objetivo.estadoActual).trim().toLowerCase() !== 'en ruta') {
      registrar('F-30', 'Registrar una entrega completa', 'Bloqueado', `El folio ${FOLIO_ESCRITURA} está "${objetivo.estadoActual}", no "En ruta".`);
    } else {
      let respuesta = null;
      await intentar('F-30', 'Registrar una entrega completa', async () => {
        respuesta = await s.pedir('/entregas', { method: 'POST', body: formEntrega({ folio: FOLIO_ESCRITURA, nombre: 'Prueba automática' }) });
        const despues = await s.pedir('/packages');
        const estado = Array.isArray(despues.json) ? despues.json.find((p) => p.folio === FOLIO_ESCRITURA)?.estadoActual : '?';
        const ok = respuesta.status >= 200 && respuesta.status < 300 && String(estado).trim().toLowerCase() === 'entregado';
        registrar('F-30', 'Registrar una entrega completa', ok ? 'Pasó' : 'Falló', `${resumen(respuesta)} · estado después: ${estado}. Revisa en SQL el comprobante, PARADAS_RUTA y HISTORIAL_SEGUIMIENTO.`);
      });

      await intentar('F-31', 'La foto y la firma guardadas se pueden abrir por URL', async () => {
        const urlFoto = respuesta?.json?.urlFoto;
        const urlFirma = respuesta?.json?.urlFirma;
        if (!urlFoto || !urlFirma) return registrar('F-31', 'La foto y la firma guardadas se pueden abrir por URL', 'Revisar', 'La respuesta no trae urlFoto y urlFirma; revísalas en COMPROBANTES_ENTREGA.');
        const origen = new URL(API).origin;
        const foto = await s.pedir(urlFoto.startsWith('http') ? urlFoto : origen + urlFoto);
        const firma = await s.pedir(urlFirma.startsWith('http') ? urlFirma : origen + urlFirma);
        const ok = foto.status === 200 && foto.tipo.startsWith('image/') && firma.status === 200 && firma.texto.includes('<svg');
        registrar('F-31', 'La foto y la firma guardadas se pueden abrir por URL', ok ? 'Pasó' : 'Falló', `foto=${foto.status} ${foto.tipo}, firma=${firma.status} ${firma.tipo}`);
      });

      await intentar('F-35', 'Una segunda entrega del mismo folio se rechaza con 409', async () => {
        const r = await s.pedir('/entregas', { method: 'POST', body: formEntrega({ folio: FOLIO_ESCRITURA }) });
        registrar('F-35', 'Una segunda entrega del mismo folio se rechaza con 409', r.status === 409 ? 'Pasó' : 'Falló', `${resumen(r)}${r.status < 300 ? ' · Se creó un comprobante duplicado.' : ''}`);
      });
    }

    await intentar('API-13', 'Marcar todas las notificaciones como leídas', async () => {
      if (notificaciones === null) return registrar('API-13', 'Marcar todas las notificaciones como leídas', 'Bloqueado', 'El servicio de notificaciones no está disponible.');
      const r = await s.pedir('/notificaciones/leidas', { method: 'POST' });
      const despues = await s.pedir('/notificaciones');
      const pendientes = Array.isArray(despues.json) ? despues.json.filter((n) => !n.leida).length : '?';
      registrar('API-13', 'Marcar todas las notificaciones como leídas', r.status >= 200 && r.status < 300 && pendientes === 0 ? 'Pasó' : 'Falló', `HTTP ${r.status}, sin leer después: ${pendientes}`);
    });
  }

  // F-04: cuenta Admin (opcional)
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    await intentar('F-04', 'Qué pasa con la cuenta Admin en /packages y /notificaciones', async () => {
      const admin = new Sesion();
      const login = await admin.pedir('/auth/login', { method: 'POST', json: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
      const paq = await admin.pedir('/packages');
      const notif = await admin.pedir('/notificaciones');
      registrar('F-04', 'Qué pasa con la cuenta Admin en /packages y /notificaciones', 'Info', `login=${login.status}, packages=${paq.status}, notificaciones=${notif.status}. Anota si la app muestra un mensaje claro.`);
    });
  }

  // F-08: cerrar sesión (al final, porque invalida la sesión)
  await intentar('F-08', 'Cerrar sesión invalida la sesión', async () => {
    const out = await s.pedir('/auth/logout', { method: 'POST' });
    const me = await s.pedir('/auth/me');
    registrar('F-08', 'Cerrar sesión invalida la sesión', out.status < 300 && me.status === 401 ? 'Pasó' : 'Falló', `logout=${out.status}, me después=${me.status}`);
  });
}

await main();

// ---------- Resumen y CSV ----------
const contar = (r) => resultados.filter((x) => x.resultado === r).length;
const evaluadas = resultados.filter((x) => x.resultado !== 'Info').length;
console.log(`\nResumen: ${contar('Pasó')} pasaron · ${contar('Falló')} fallaron · ${contar('Bloqueado')} bloqueadas · ${contar('Revisar')} por revisar (de ${evaluadas})`);

const csv = ['Id,Prueba,Resultado,Detalle', ...resultados.map((r) => [r.id, r.prueba, r.resultado, r.detalle].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\r\n');
const carpetaResultados = join(dirname(fileURLToPath(import.meta.url)), 'resultados');
const ahora = new Date();
const dos = (n) => String(n).padStart(2, '0');
const sello = `${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())}_${dos(ahora.getHours())}-${dos(ahora.getMinutes())}`;
const archivoCsv = join(carpetaResultados, `resultados-api_${sello}.csv`);
mkdirSync(carpetaResultados, { recursive: true });
writeFileSync(archivoCsv, '﻿' + csv, 'utf8');
console.log(`Resultados guardados en ${archivoCsv}\n`);
process.exit(contar('Falló') > 0 ? 1 : 0);
