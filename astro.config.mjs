// @ts-check
import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Modo híbrido: estático por defecto, con prerender = false en las páginas
  // de servidor (api/*, administrador, ajustes, solicitudes, entrar).
  output: 'static',
  adapter: cloudflare(),

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],

    resolve: {
      /**
       * Una sola copia de React en todo el proceso.
       *
       * El bloque de agendamiento se renderiza en el servidor y además se
       * hidrata. Sin esto, el optimizador de dependencias sirve `react-dom` ya
       * empaquetado mientras `react` se carga crudo desde node_modules: quedan
       * dos copias, los hooks pierden su contexto y el render del servidor
       * muere con "Invalid hook call". La página entera devuelve 500.
       */
      dedupe: ['react', 'react-dom'],
    },
  },

  env: {
    schema: {
      PUBLIC_SANITY_PROJECT_ID: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_SANITY_DATASET: envField.string({ context: 'client', access: 'public', default: 'production' }),
      /**
       * Turnstile: la clave pública del widget.
       *
       * Va con valor por defecto y no como variable de build a cargar aparte,
       * a diferencia de las de Sanity. Esta clave es pública por definición —
       * viaja en el HTML de la página — y es fija para este sitio, así que
       * pedirla en dos lugares más solo agrega un paso que se olvida. Se puede
       * pisar desde el .env o desde el panel el día que se rote el widget.
       */
      PUBLIC_TURNSTILE_SITEKEY: envField.string({
        context: 'client',
        access: 'public',
        default: '0x4AAAAAAEWDk-wk5ES4YCyp',
      }),
      /**
       * La clave secreta del widget, que es la que verifica de verdad.
       *
       * Opcional a propósito: si falta, la verificación no corre y el
       * formulario sigue recibiendo pedidos. Es una defensa, no la puerta —
       * dejar al negocio sin poder recibir una visita por un secreto mal
       * cargado sería peor que el spam que evita.
       */
      TURNSTILE_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Token con permiso de escritura. Solo lo usa `npm run sembrar`.
      SANITY_WRITE_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      NOTIFY_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Cloudflare Access: protegen /solicitudes. Sin ellas, en producción la
      // página devuelve 403 en vez de mostrar datos de clientes.
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
