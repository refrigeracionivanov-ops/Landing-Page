// @ts-check
import { defineConfig, envField } from 'astro/config';
import { loadEnv } from 'vite';
import sanity from '@sanity/astro';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// El archivo de configuracion corre antes de que Astro cargue el .env,
// asi que lo leemos nosotros.
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

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
    }),
    react(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  env: {
    schema: {
      PUBLIC_SANITY_PROJECT_ID: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_SANITY_DATASET: envField.string({ context: 'client', access: 'public', default: 'production' }),
      // Token con permiso de escritura. Solo lo usa `npm run sembrar`.
      SANITY_WRITE_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      NOTIFY_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Cloudflare Access: protegen /solicitudes. Sin ellas, en produccion la
      // pagina devuelve 403 en vez de mostrar datos de clientes.
      CF_ACCESS_TEAM_DOMAIN: envField.string({ context: 'server', access: 'secret', optional: true }),
      CF_ACCESS_AUD: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Google Calendar: espeja las visitas agendadas. Si faltan, el espejo
      // simplemente no ocurre y el resto sigue funcionando igual.
      GOOGLE_SA_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      GOOGLE_SA_PRIVATE_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      GOOGLE_CALENDAR_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      GOOGLE_CALENDAR_TIMEZONE: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
