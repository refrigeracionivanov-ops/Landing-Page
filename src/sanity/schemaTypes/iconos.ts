/**
 * Lista cerrada de iconos.
 *
 * Es una lista y no un campo de texto libre a proposito: quien edita elige de un
 * desplegable y siempre existe el icono. Para agregar uno nuevo se suma aca y en
 * `src/components/Icono.astro`.
 */
export const OPCIONES_ICONO = [
  { title: 'Aire acondicionado', value: 'aire' },
  { title: 'Herramienta', value: 'herramienta' },
  { title: 'Escudo / garantia', value: 'escudo' },
  { title: 'Hoja / aire limpio', value: 'hoja' },
  { title: 'Rayo / energia', value: 'rayo' },
  { title: 'Reloj / rapidez', value: 'reloj' },
  { title: 'Estrella', value: 'estrella' },
  { title: 'Casa', value: 'casa' },
  { title: 'Termometro', value: 'termometro' },
  { title: 'Ducto / ventilacion', value: 'ducto' },
  { title: 'Moneda / ahorro', value: 'moneda' },
  { title: 'Telefono', value: 'telefono' },
] as const;

export type ValorIcono = (typeof OPCIONES_ICONO)[number]['value'];
