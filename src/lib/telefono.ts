/**
 * Teléfonos: del formato en que la gente los escribe al que WhatsApp entiende.
 *
 * Nadie escribe su número como lo pide `wa.me`. Acá se escribe `11 4567-8900`,
 * o `011 15 4567-8900`, y WhatsApp necesita `5491145678900` — con el código de
 * país, con el 9 que Argentina exige para móviles, y sin el 0 ni el 15 que
 * sobran en formato internacional.
 *
 * Sin esta traducción el botón de WhatsApp del panel abre un chat con un número
 * inexistente, que es la peor forma de fallar: parece que funcionó.
 *
 * No es una biblioteca de teléfonos. Cubre las formas en que se escribe un
 * número en los países de la lista y, cuando no está seguro, deja los dígitos
 * como vinieron en vez de inventar.
 */

export interface Pais {
  codigo: string;
  nombre: string;
  ejemplo: string;
}

/**
 * La lista es corta a propósito.
 *
 * El negocio atiende CABA y zona norte: prácticamente todos los que agendan
 * tienen un número argentino. Los vecinos están para el residente que conservó
 * su línea, no para cubrir el mundo — cada opción de más es una decisión que
 * alguien tiene que tomar en un formulario donde cada paso cuesta.
 */
export const PAISES: Pais[] = [
  { codigo: '54', nombre: 'Argentina', ejemplo: '11 4567-8900' },
  { codigo: '598', nombre: 'Uruguay', ejemplo: '99 123 456' },
  { codigo: '55', nombre: 'Brasil', ejemplo: '11 91234-5678' },
  { codigo: '56', nombre: 'Chile', ejemplo: '9 1234 5678' },
  { codigo: '595', nombre: 'Paraguay', ejemplo: '981 123456' },
  { codigo: '591', nombre: 'Bolivia', ejemplo: '7123 4567' },
];

export const PAIS_POR_DEFECTO = '54';

const soloDigitos = (texto: string) => (texto ?? '').replace(/\D/g, '');

/**
 * Normaliza un número argentino escrito como se escribe acá.
 *
 * - `011 4567-8900`  el 0 es para discar dentro del país, afuera sobra
 * - `11 15 4567-8900`  el 15 es lo mismo para los móviles
 * - `11 4567-8900`  le falta el 9 que WhatsApp pide para móviles
 *
 * Los tres terminan en `5491145678900`. Si el número no tiene el largo que
 * corresponde, se devuelve como está: mejor un enlace que no abre a uno que
 * abre el chat de otra persona.
 */
function normalizarArgentina(nacional: string): string {
  let numero = nacional.replace(/^0+/, '');

  // El 15 va después del código de área, que mide 2, 3 o 4 dígitos. En vez de
  // adivinar dónde termina, se prueban los cortes posibles: si sacando el 15
  // queda un número de largo válido, era un 15.
  if (numero.length > 10) {
    for (const largoArea of [2, 3, 4]) {
      if (numero.slice(largoArea, largoArea + 2) === '15' && numero.length - 2 === 10) {
        numero = numero.slice(0, largoArea) + numero.slice(largoArea + 2);
        break;
      }
    }
  }

  if (numero.startsWith('9') && numero.length === 11) return `54${numero}`;
  if (numero.length === 10) return `549${numero}`;

  return `54${numero}`;
}

/**
 * El número listo para `wa.me`, en dígitos y sin signos.
 *
 * Acepta tanto lo que guardó el formulario (ya con código de país) como un
 * número suelto escrito a mano, para que siga funcionando con las solicitudes
 * que se cargaron antes de que el formulario pidiera el país.
 */
export function paraWhatsapp(telefono: string): string {
  const digitos = soloDigitos(telefono);
  if (!digitos) return '';

  for (const { codigo } of PAISES) {
    if (digitos.startsWith(codigo)) {
      const nacional = digitos.slice(codigo.length);
      return codigo === '54' ? normalizarArgentina(nacional) : digitos;
    }
  }

  // Sin código de país reconocible se asume el de casa: es lo que escribe
  // alguien que llenó el formulario viejo, o que tipeó el numero a mano.
  return normalizarArgentina(digitos);
}

/**
 * El número para el enlace `tel:`.
 *
 * Pasa por la misma normalización que WhatsApp y no por un `+` pegado a los
 * dígitos que vinieron: `11 4567-8900` con un `+` adelante es `+1 145678900`,
 * un número de Estados Unidos. El teléfono marca bien un `+54 9 …` tanto desde
 * acá como desde afuera.
 */
export const paraLlamar = (telefono: string) => {
  const numero = paraWhatsapp(telefono);
  return numero ? `+${numero}` : '';
};
