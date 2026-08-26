import type { APIRoute } from 'astro';
import { COOKIE_CLAVE } from '../../lib/acceso';

export const prerender = false;

export const POST: APIRoute = () => {
  return new Response(null, {
    status: 303,
    headers: {
      location: '/administrador',
      'set-cookie': [
        `${COOKIE_CLAVE}=`,
        'Path=/',
        'HttpOnly',
        'Secure',
        'SameSite=Lax',
        'Max-Age=0',
      ].join('; '),
    },
  });
};
