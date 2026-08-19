// @ts-check
import { defineConfig, envField } from 'astro/config';
import { loadEnv } from 'vite';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import sanity from '@sanity/astro';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// El archivo de configuracion corre antes de que Astro cargue el .env,
// asi que lo leemos nosotros.
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

// Carpeta raiz de un paquete instalado, calculada con `dirname` en vez de
// recortando la cadena. Ver `parcheAliasSanityWindows` mas abajo.
const require_ = createRequire(import.meta.url);
/** @param {string} paquete */
const carpetaDe = (paquete) => dirname(require_.resolve(`${paquete}/package.json`));

/**
 * Arregla un bug de @sanity/astro 3.5.0 que solo se manifiesta en Windows.
 *
 * El integration calcula la raiz de `sanity` asi:
 *
 *   resolve("sanity/package.json").replace(/\/package\.json$/, "")
 *
 * La regex exige barra normal. En Windows la ruta resuelta trae backslashes,
 * el replace no hace nada, y el alias termina apuntando al propio package.json.
 * A partir de ahi cada `import { definePlugin } from "sanity"` intenta sacar
 * exports de un JSON: rolldown tira cientos de MISSING_EXPORT, no genera
 * .vite/deps/sanity_structure.js, y /admin carga en blanco sin decir por que.
 *
 * Este plugin corre despues y reescribe esos alias con la ruta correcta.
 * Se puede borrar cuando @sanity/astro publique el arreglo.
 */
function parcheAliasSanityWindows() {
  return {
    name: 'parche-alias-sanity-windows',
    enforce: 'post',
    /** @param {import('vite').UserConfig} configuracion */
    config(configuracion) {
      const alias = configuracion.resolve?.alias;
      if (!Array.isArray(alias)) return;

      for (const entrada of alias) {
        if (typeof entrada.replacement !== 'string') continue;
        if (!/[\\/]package\.json$/.test(entrada.replacement)) continue;
        entrada.replacement = dirname(entrada.replacement);
      }
    },
  };
}

/**
 * Evita que el panel quede en blanco tras una reoptimizacion de dependencias.
 *
 * Vite sirve `node_modules/.vite/deps/*` con `Cache-Control: immutable` y
 * confia en que el `?v=<browserHash>` cambie cuando el contenido cambia. El
 * studio importa la mayoria de sus modulos de forma dinamica, asi que el
 * crawler inicial no los ve: recien al abrir /admin los descubre y reoptimiza.
 * Esa segunda corrida vuelve a emitir los chunks con hashes de contenido
 * distintos pero conserva el mismo browserHash, y el navegador se queda con un
 * `sanity.js` cacheado que apunta a archivos que ya no existen. Resultado:
 * varios 404, "Failed to fetch dynamically imported module", y /admin en
 * blanco. Ni recargar arregla — hace falta Ctrl+Shift+R.
 *
 * En desarrollo la caché de esos archivos no aporta nada (son locales), asi
 * que la desactivamos. Vite fija el encabezado despues de nuestros middlewares,
 * por eso interceptamos `setHeader` en vez de escribirlo directo.
 */
function sinCacheDeDepsOptimizadas() {
  return {
    name: 'sin-cache-de-deps-optimizadas',
    apply: 'serve',
    /** @param {import('vite').ViteDevServer} servidor */
    configureServer(servidor) {
      servidor.middlewares.use((peticion, respuesta, siguiente) => {
        if (!peticion.url?.includes('/.vite/deps/')) return siguiente();

        const setHeaderOriginal = respuesta.setHeader.bind(respuesta);
        respuesta.setHeader = (nombre, valor) =>
          setHeaderOriginal(
            nombre,
            String(nombre).toLowerCase() === 'cache-control' ? 'no-cache' : valor,
          );

        siguiente();
      });
    },
  };
}

export default defineConfig({
  // Todo el sitio se genera estatico. Solo /api/reservar corre en el servidor
  // (lleva `export const prerender = false`).
  output: 'static',
  // Los bindings de wrangler.jsonc (la base D1) quedan disponibles en
  // `Astro.locals.runtime.env` tanto en `astro dev` como en produccion.
  adapter: cloudflare(),

  integrations: [
    sanity({
      projectId: env.PUBLIC_SANITY_PROJECT_ID ?? '',
      dataset: env.PUBLIC_SANITY_DATASET ?? 'production',
      apiVersion: '2024-10-01',
      useCdn: true,
      // Aca vive el panel de administracion.
      studioBasePath: '/admin',

      /**
       * Stega apagado.
       *
       * Metia marcas invisibles dentro de cada texto que llegaba de Sanity para
       * que en la vista previa pudieras hacer clic en un titulo e ir al campo
       * que lo controla. Eso apuntaba al Studio de /admin, y desde que existe
       * /administrador el clic-para-editar se hace ahi directamente.
       *
       * Lo que quedaba era el costo: caracteres Unicode reales pegados en cada
       * texto (medido en la maqueta, 134.544 de 142.389 caracteres eran marcas),
       * que se colaban en el titulo de la pestana y en cualquier texto que se
       * copiara; y un componente de edicion visual que ni siquiera llegaba a
       * montarse en desarrollo.
       */
      stega: false,
    }),
    react(),
  ],

  vite: {
    plugins: [tailwindcss(), parcheAliasSanityWindows(), sinCacheDeDepsOptimizadas()],

    resolve: {
      /**
       * Una sola copia de React en todo el proceso.
       *
       * El bloque de agendamiento se renderiza en el servidor y ademas se
       * hidrata. Sin esto, el optimizador de dependencias sirve `react-dom` ya
       * empaquetado mientras `react` se carga crudo desde node_modules: quedan
       * dos copias, los hooks pierden su contexto y el render del servidor
       * muere con "Invalid hook call". La pagina entera devuelve 500.
       */
      dedupe: ['react', 'react-dom'],

      // Red de seguridad: si el parche de arriba no llegara a correr, estos
      // alias ya apuntan a la carpeta correcta.
      alias: [
        { find: /^sanity$/, replacement: carpetaDe('sanity') },
        { find: /^styled-components$/, replacement: carpetaDe('styled-components') },
      ],
    },

    optimizeDeps: {
      // Dependencias CommonJS que el studio importa como ESM. Sin declararlas,
      // rolldown las sirve sin interop y el modulo "no exporta default".
      include: ['speakingurl', 'react/compiler-runtime', 'react-is', 'lodash/isObject'],
    },
  },

  env: {
    schema: {
      PUBLIC_SANITY_PROJECT_ID: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_SANITY_DATASET: envField.string({ context: 'client', access: 'public', default: 'production' }),
      /**
       * Turnstile: la clave publica del widget.
       *
       * Va con valor por defecto y no como variable de build a cargar aparte,
       * a diferencia de las de Sanity. Esta clave es publica por definicion —
       * viaja en el HTML de la pagina — y es fija para este sitio, asi que
       * pedirla en dos lugares mas solo agrega un paso que se olvida. Se puede
       * pisar desde el .env o desde el panel el dia que se rote el widget.
       */
      PUBLIC_TURNSTILE_SITEKEY: envField.string({
        context: 'client',
        access: 'public',
        default: '0x4AAAAAAEWDk-wk5ES4YCyp',
      }),
      /**
       * La clave secreta del widget, que es la que verifica de verdad.
       *
       * Opcional a proposito: si falta, la verificacion no corre y el
       * formulario sigue recibiendo pedidos. Es una defensa, no la puerta —
       * dejar al negocio sin poder recibir una visita por un secreto mal
       * cargado seria peor que el spam que evita.
       */
      TURNSTILE_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Token con permiso de escritura. Solo lo usa `npm run sembrar`.
      SANITY_WRITE_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      NOTIFY_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Cloudflare Access: protegen /solicitudes. Sin ellas, en produccion la
      // pagina devuelve 403 en vez de mostrar datos de clientes.
      CF_ACCESS_TEAM_DOMAIN: envField.string({ context: 'server', access: 'secret', optional: true }),
      CF_ACCESS_AUD: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Puerta provisoria para /editor y /solicitudes mientras no haya un
      // dominio propio con Cloudflare Access delante. Ver src/lib/acceso.ts.
      CLAVE_EDITOR: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Google Calendar: espeja las visitas agendadas. Si faltan, el espejo
      // simplemente no ocurre y el resto sigue funcionando igual.
      GOOGLE_SA_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      GOOGLE_SA_PRIVATE_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      GOOGLE_CALENDAR_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      GOOGLE_CALENDAR_TIMEZONE: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
