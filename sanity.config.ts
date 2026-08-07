import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
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
    // Consola de consultas. Util para vos, invisible para quien edita contenido.
    visionTool({ defaultApiVersion: '2024-10-01' }),
  ],

  schema: { types: schemaTypes },
});
