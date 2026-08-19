import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * El mapa del sitio para los buscadores.
 *
 * Es una sola página, así que Google la encontraría igual. Vale la pena de
 * todos modos por dos motivos: `lastmod` le dice cuándo cambió el contenido, y
 * el día que se sumen más páginas ya está el lugar donde declararlas.
 *
 * Se arma en cada pedido y no al compilar, porque la URL sale del dominio desde
 * el que se pidió: mudarse a un dominio propio no obliga a tocar nada acá.
 *
 * Las rutas privadas no figuran: `/administrador`, `/ajustes` y `/solicitudes`
 * redirigen a la pantalla de entrada, y ademas llevan `noindex`.
 */
export const GET: APIRoute = ({ site, url }) => {
  const raiz = (site ?? new URL(url.origin)).origin;
  const hoy = new Date().toISOString().slice(0, 10);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${raiz}/</loc>
    <lastmod>${hoy}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
