import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Reemplaza el `robots.txt` que Cloudflare sirve por defecto.
 *
 * Se genera en cada pedido, y no como archivo estático, por una sola razón: la
 * línea `Sitemap` tiene que llevar la URL absoluta, y el dominio sale del
 * pedido. Mudarse a un dominio propio no obliga a acordarse de esto.
 *
 * Las rutas de administración no se listan a propósito. Todas redirigen a la
 * pantalla de entrada y llevan `noindex`, así que no hay nada que bloquear —
 * y un `Disallow` sería publicar dónde está la puerta.
 */
export const GET: APIRoute = ({ site, url }) => {
  const raiz = (site ?? new URL(url.origin)).origin;

  return new Response(
    `User-agent: *
Allow: /

Sitemap: ${raiz}/sitemap.xml
`,
    {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=3600',
      },
    },
  );
};
