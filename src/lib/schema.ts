import type { Ajustes } from '../tipos';

/**
 * Traduce los ajustes del negocio a schema.org.
 *
 * El dueño escribe el horario y la dirección como los diría en voz alta —
 * "Lunes a sábado, 8:00 a 18:00" — porque eso es lo que se muestra en la
 * página. Google, en cambio, solo entiende `Mo-Sa 08:00-18:00` y una dirección
 * partida en calle y ciudad; cualquier otra cosa la ignora en silencio.
 *
 * Antes que pedirle al dueño que cargue los mismos datos dos veces, una en
 * castellano y otra en un formato que no entiende, se traduce acá. Cuando la
 * traducción no sale, el campo se omite: un dato mal formado no es mejor que
 * ninguno, y así el resto de la ficha sigue siendo válida.
 */

const DIAS: Record<string, string> = {
  domingo: 'Su',
  lunes: 'Mo',
  martes: 'Tu',
  miercoles: 'We',
  jueves: 'Th',
  viernes: 'Fr',
  sabado: 'Sa',
};

/** Sin tildes y en minúsculas, para que "sábado" y "sabado" entren por el mismo lado. */
const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const dosDigitos = (hora: string, minutos?: string) =>
  `${hora.padStart(2, '0')}:${(minutos ?? '00').padStart(2, '0')}`;

/**
 * `Lunes a sábado, 8:00 a 18:00` -> `Mo-Sa 08:00-18:00`
 *
 * Cubre la forma en que se escribe el horario de un negocio de barrio: un rango
 * de días y un rango de horas. No intenta con casos partidos ("de 9 a 13 y de
 * 16 a 20") ni con días sueltos; ahí devuelve `undefined` y la propiedad no se
 * emite.
 */
export function horarioSchema(horario?: string): string | undefined {
  if (!horario) return undefined;

  const texto = normalizar(horario);

  const dias = texto.match(/(domingo|lunes|martes|miercoles|jueves|viernes|sabado)\s*(?:a|-|hasta)\s*(domingo|lunes|martes|miercoles|jueves|viernes|sabado)/);
  const horas = texto.match(/(\d{1,2})(?::(\d{2}))?\s*(?:a|-|hasta)\s*(\d{1,2})(?::(\d{2}))?/);

  if (!dias || !horas) return undefined;

  const desde = DIAS[dias[1]];
  const hasta = DIAS[dias[2]];
  if (!desde || !hasta) return undefined;

  const apertura = dosDigitos(horas[1], horas[2]);
  const cierre = dosDigitos(horas[3], horas[4]);

  // Un horario que abre despues de cerrar es un error de tipeo, no un turno
  // nocturno: mejor no publicarlo.
  if (apertura >= cierre) return undefined;

  return `${desde}-${hasta} ${apertura}-${cierre}`;
}

/** `Av. Corrientes 1234, CABA` -> calle y ciudad separadas. */
export function direccionSchema(direccion?: string) {
  if (!direccion?.trim()) return undefined;

  const partes = direccion.split(',').map((parte) => parte.trim()).filter(Boolean);

  return {
    '@type': 'PostalAddress',
    streetAddress: partes[0],
    ...(partes.length > 1 && { addressLocality: partes.slice(1).join(', ') }),
    addressCountry: 'AR',
  };
}

/**
 * La ficha del negocio para Google.
 *
 * `areaServed` sale de los barrios de la sección de cobertura: es lo que
 * conecta el sitio con la búsqueda "service de aire acondicionado en Belgrano",
 * que es de donde viene el trabajo en un rubro de cercanía.
 */
export function fichaDelNegocio(ajustes: Ajustes, opciones: { url: string; imagen?: string; barrios?: string[] }) {
  const horario = horarioSchema(ajustes.horario);
  const direccion = direccionSchema(ajustes.direccion);

  return {
    '@context': 'https://schema.org',
    '@type': 'HVACBusiness',
    name: ajustes.nombre,
    url: opciones.url,
    telephone: ajustes.telefono,
    ...(ajustes.email && { email: ajustes.email }),
    ...(direccion && { address: direccion }),
    ...(horario && { openingHours: horario }),
    ...(opciones.imagen && { image: opciones.imagen }),
    ...(opciones.barrios?.length && {
      areaServed: opciones.barrios.map((barrio) => ({ '@type': 'Place', name: barrio })),
    }),
  };
}
