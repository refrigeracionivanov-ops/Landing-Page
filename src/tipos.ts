import type { Image } from '@sanity/types';
import type { ValorIcono } from './sanity/schemaTypes/iconos';

export type ImagenSanity = Image & { alt?: string };

export interface Ajustes {
  nombre: string;
  logo?: ImagenSanity;
  telefono: string;
  whatsapp: string;
  mensajeWhatsapp?: string;
  email?: string;
  direccion?: string;
  horario?: string;
  mostrarBarraContacto?: boolean;
  franjas?: { etiqueta: string; cupo: number }[];
  diasAnticipacion?: number;
}

interface BloqueBase {
  _key: string;
  _type: string;
}

export interface HeroBloque extends BloqueBase {
  _type: 'heroBloque';
  titular: string;
  subtitulo?: string;
  imagen?: ImagenSanity;
  textoBotonAgendar?: string;
  mostrarBotonWhatsapp?: boolean;
}

export interface ServiciosBloque extends BloqueBase {
  _type: 'serviciosBloque';
  titulo?: string;
  intro?: string;
  servicios?: { _key: string; icono?: ValorIcono; nombre: string; descripcion?: string; precioDesde?: string }[];
}

export interface BeneficiosBloque extends BloqueBase {
  _type: 'beneficiosBloque';
  titulo?: string;
  items?: { _key: string; icono?: ValorIcono; titulo: string; texto?: string }[];
}

export interface AntesDespuesBloque extends BloqueBase {
  _type: 'antesDespuesBloque';
  titulo?: string;
  pares?: { _key: string; antes?: ImagenSanity; despues?: ImagenSanity; descripcion?: string }[];
}

export interface CoberturaBloque extends BloqueBase {
  _type: 'coberturaBloque';
  titulo?: string;
  texto?: string;
  distritos?: string[];
  notaFueraDeZona?: string;
}

export interface PromocionesBloque extends BloqueBase {
  _type: 'promocionesBloque';
  titulo?: string;
  promos?: { _key: string; destacado: string; titulo: string; descripcion?: string; vigenciaHasta?: string }[];
}

export interface ConfianzaBloque extends BloqueBase {
  _type: 'confianzaBloque';
  titulo?: string;
  items?: { _key: string; valor: string; etiqueta: string }[];
  marcas?: ({ _key: string } & ImagenSanity)[];
}

export interface TestimoniosBloque extends BloqueBase {
  _type: 'testimoniosBloque';
  titulo?: string;
  testimonios?: { _key: string; nombre: string; distrito?: string; texto: string; estrellas?: number; foto?: ImagenSanity }[];
}

export interface FaqBloque extends BloqueBase {
  _type: 'faqBloque';
  titulo?: string;
  preguntas?: { _key: string; pregunta: string; respuesta: string }[];
}

export interface AgendarBloque extends BloqueBase {
  _type: 'agendarBloque';
  titulo?: string;
  texto?: string;
  mensajeExito?: string;
}

export interface CtaBloque extends BloqueBase {
  _type: 'ctaBloque';
  titulo: string;
  texto?: string;
  textoBoton?: string;
}

export type Bloque =
  | HeroBloque
  | ServiciosBloque
  | BeneficiosBloque
  | AntesDespuesBloque
  | CoberturaBloque
  | PromocionesBloque
  | ConfianzaBloque
  | TestimoniosBloque
  | FaqBloque
  | AgendarBloque
  | CtaBloque;

export interface Pagina {
  titulo: string;
  seo?: { titulo?: string; descripcion?: string };
  secciones?: Bloque[];
}

/** Payload que envia el formulario de agendamiento. */
export interface SolicitudEntrante {
  nombre: string;
  telefono: string;
  distrito: string;
  direccion: string;
  tipoServicio: string;
  tipoEquipo: string;
  descripcion?: string;
  fechaPreferida: string;
  franja: string;
  /** Campo trampa contra bots. Debe llegar vacio. */
  sitioWeb?: string;
}
