import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schemaTypes';
import { estructura } from './src/sanity/estructura';

/**
 * Este archivo lo leen dos entornos distintos: Vite, cuando empaqueta el panel
 * para el navegador (ahi solo existe `import.meta.env`), y Node, cuando corre la
 * CLI de Sanity (ahi solo existe `process.env`). Por eso se consultan los dos.
 */
function leerEnv(clave: string): string | undefined {
  const deVite = (import.meta.env as Record<string, string | undefined>)?.[clave];
  if (deVite) return deVite;
  return typeof process !== 'undefined' ? process.env?.[clave] : undefined;
}

export default defineConfig({
  name: 'default',
  title: 'Panel de contenido',

  projectId: leerEnv('PUBLIC_SANITY_PROJECT_ID') ?? '',
  dataset: leerEnv('PUBLIC_SANITY_DATASET') ?? 'production',

  basePath: '/admin',

  plugins: [
    structureTool({ structure: estructura }),

    /**
     * "Vista previa": el sitio embebido al lado del formulario. Se edita un
     * campo y se ve el cambio al instante, sin publicar.
     *
     * `initial: '/'` apunta al mismo origen donde vive el studio, asi que
     * funciona igual en localhost:4321 que en el dominio final.
     *
     * Ojo: el sitio se genera estatico (`output: 'static'`). En `astro dev`
     * cada pedido se renderiza al vuelo y esto anda; en produccion el HTML se
     * congela al compilar, asi que la vista previa refleja el contenido del
     * ultimo deploy. Para verla en vivo ahi haria falta que la pagina se
     * renderice en el servidor con modo borrador.
     */
    presentationTool({
      title: 'Vista previa',
      previewUrl: { initial: '/' },
    }),

    // Consola de consultas. Util para vos, invisible para quien edita contenido.
    visionTool({ defaultApiVersion: '2024-10-01' }),
  ],

  schema: { types: schemaTypes },
});
