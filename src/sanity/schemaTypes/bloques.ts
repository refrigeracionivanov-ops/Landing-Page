import { defineField, defineType, defineArrayMember } from 'sanity';
import { OPCIONES_ICONO } from './iconos';

/**
 * Catalogo de bloques.
 *
 * Cada bloque es un objeto que se puede agregar, reordenar y borrar desde el panel.
 * Ninguno expone colores, tipografias ni espaciados: eso vive en el codigo.
 */

const campoImagen = (nombre = 'imagen', titulo = 'Imagen') =>
  defineField({
    name: nombre,
    title: titulo,
    type: 'image',
    options: { hotspot: true },
    fields: [
      defineField({
        name: 'alt',
        title: 'Texto alternativo',
        type: 'string',
        description: 'Describe la foto en pocas palabras. Lo leen los buscadores y los lectores de pantalla.',
        validation: (r) => r.required().warning('Sumale un texto alternativo para que Google entienda la foto.'),
      }),
    ],
  });

/* ------------------------------------------------------------------ Hero */

export const heroBloque = defineType({
  name: 'heroBloque',
  title: 'Portada',
  type: 'object',
  fields: [
    defineField({
      name: 'titular',
      title: 'Titular',
      type: 'string',
      description: 'La primera frase que se lee. Corta y concreta.',
      validation: (r) => r.required().max(70).warning('Arriba de 70 caracteres se corta feo en celular.'),
    }),
    defineField({ name: 'subtitulo', title: 'Subtitulo', type: 'text', rows: 2 }),
    campoImagen('imagen', 'Imagen de fondo'),
    defineField({
      name: 'textoBotonAgendar',
      title: 'Texto del boton de agendar',
      type: 'string',
      initialValue: 'Agendar visita',
    }),
    defineField({
      name: 'mostrarBotonWhatsapp',
      title: 'Mostrar boton de WhatsApp',
      type: 'boolean',
      initialValue: true,
      description: 'Usa el numero cargado en Ajustes del negocio.',
    }),
  ],
  preview: {
    select: { title: 'titular', media: 'imagen' },
    prepare: ({ title, media }) => ({ title: title || 'Portada', subtitle: 'Portada', media }),
  },
});

/* -------------------------------------------------------------- Servicios */

export const serviciosBloque = defineType({
  name: 'serviciosBloque',
  title: 'Servicios',
  type: 'object',
  fields: [
    defineField({ name: 'titulo', title: 'Titulo', type: 'string', initialValue: 'Nuestros servicios' }),
    defineField({ name: 'intro', title: 'Texto de entrada', type: 'text', rows: 2 }),
    defineField({
      name: 'servicios',
      title: 'Servicios',
      type: 'array',
      validation: (r) => r.min(1),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'icono',
              title: 'Icono',
              type: 'string',
              options: { list: [...OPCIONES_ICONO] },
              initialValue: 'aire',
            }),
            defineField({ name: 'nombre', title: 'Nombre', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'descripcion', title: 'Descripcion', type: 'text', rows: 3 }),
            defineField({
              name: 'precioDesde',
              title: 'Precio desde',
              type: 'string',
              description: 'Opcional. Ej: "S/ 120". Dejalo vacio si preferis no publicar precios.',
            }),
          ],
          preview: { select: { title: 'nombre', subtitle: 'precioDesde' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'titulo' },
    prepare: ({ title }) => ({ title: title || 'Servicios', subtitle: 'Servicios' }),
  },
});

/* ------------------------------------------------------------- Beneficios */

export const beneficiosBloque = defineType({
  name: 'beneficiosBloque',
  title: 'Beneficios',
  type: 'object',
  fields: [
    defineField({ name: 'titulo', title: 'Titulo', type: 'string', initialValue: '¿Por que elegirnos?' }),
    defineField({
      name: 'items',
      title: 'Beneficios',
      type: 'array',
      validation: (r) => r.min(1).max(6).warning('Con mas de 6 la seccion pierde fuerza.'),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'icono',
              title: 'Icono',
              type: 'string',
              options: { list: [...OPCIONES_ICONO] },
              initialValue: 'escudo',
            }),
            defineField({ name: 'titulo', title: 'Titulo', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'texto', title: 'Texto', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'titulo', subtitle: 'texto' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'titulo' },
    prepare: ({ title }) => ({ title: title || 'Beneficios', subtitle: 'Beneficios' }),
  },
});

/* --------------------------------------------------------- Antes/Despues */

export const antesDespuesBloque = defineType({
  name: 'antesDespuesBloque',
  title: 'Antes y despues',
  type: 'object',
  fields: [
    defineField({ name: 'titulo', title: 'Titulo', type: 'string', initialValue: 'Trabajos realizados' }),
    defineField({
      name: 'pares',
      title: 'Comparaciones',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            campoImagen('antes', 'Foto ANTES'),
            campoImagen('despues', 'Foto DESPUES'),
            defineField({
              name: 'descripcion',
              title: 'Descripcion del trabajo',
              type: 'string',
              description: 'Ej: "Limpieza de ductos en departamento de 90 m2".',
            }),
          ],
          preview: { select: { title: 'descripcion', media: 'despues' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'titulo' },
    prepare: ({ title }) => ({ title: title || 'Antes y despues', subtitle: 'Antes y despues' }),
  },
});

/* ---------------------------------------------------------- Cobertura */

export const coberturaBloque = defineType({
  name: 'coberturaBloque',
  title: 'Zonas de cobertura',
  type: 'object',
  fields: [
    defineField({ name: 'titulo', title: 'Titulo', type: 'string', initialValue: 'Zonas donde atendemos' }),
    defineField({ name: 'texto', title: 'Texto', type: 'text', rows: 2 }),
    defineField({
      name: 'distritos',
      title: 'Distritos',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
      description: 'Escribi cada distrito y presiona Enter. Estos mismos aparecen en el formulario de agendamiento.',
    }),
    defineField({
      name: 'notaFueraDeZona',
      title: 'Nota para quien esta fuera de zona',
      type: 'string',
      initialValue: '¿No ves tu distrito? Escribinos igual, evaluamos cada caso.',
    }),
  ],
  preview: {
    select: { title: 'titulo' },
    prepare: ({ title }) => ({ title: title || 'Zonas de cobertura', subtitle: 'Zonas de cobertura' }),
  },
});

/* -------------------------------------------------------- Promociones */

export const promocionesBloque = defineType({
  name: 'promocionesBloque',
  title: 'Promociones',
  type: 'object',
  fields: [
    defineField({ name: 'titulo', title: 'Titulo', type: 'string', initialValue: 'Promociones del mes' }),
    defineField({
      name: 'promos',
      title: 'Promociones',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'destacado',
              title: 'Destacado',
              type: 'string',
              description: 'Lo mas grande de la tarjeta. Ej: "20% OFF" o "2x1".',
              validation: (r) => r.required(),
            }),
            defineField({ name: 'titulo', title: 'Titulo', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'descripcion', title: 'Descripcion', type: 'text', rows: 2 }),
            defineField({
              name: 'vigenciaHasta',
              title: 'Vigente hasta',
              type: 'date',
              options: { dateFormat: 'DD/MM/YYYY' },
              description: 'Pasada esta fecha la promo deja de mostrarse sola. No hay que acordarse de borrarla.',
            }),
          ],
          preview: { select: { title: 'titulo', subtitle: 'destacado' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'titulo' },
    prepare: ({ title }) => ({ title: title || 'Promociones', subtitle: 'Promociones' }),
  },
});

/* ---------------------------------------------------------- Confianza */

export const confianzaBloque = defineType({
  name: 'confianzaBloque',
  title: 'Confianza y respaldo',
  type: 'object',
  fields: [
    defineField({ name: 'titulo', title: 'Titulo', type: 'string', initialValue: 'Trabajo respaldado' }),
    defineField({
      name: 'items',
      title: 'Datos de respaldo',
      type: 'array',
      description: 'Ej: anos de experiencia, garantia, numero de licencia, tecnicos certificados.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'valor',
              title: 'Dato',
              type: 'string',
              description: 'Ej: "12 anos", "6 meses", "+2.500".',
              validation: (r) => r.required(),
            }),
            defineField({ name: 'etiqueta', title: 'Etiqueta', type: 'string', validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'valor', subtitle: 'etiqueta' } },
        }),
      ],
    }),
    defineField({
      name: 'marcas',
      title: 'Marcas con las que trabajamos',
      type: 'array',
      of: [defineArrayMember(campoImagen('logo', 'Logo'))],
    }),
  ],
  preview: {
    select: { title: 'titulo' },
    prepare: ({ title }) => ({ title: title || 'Confianza y respaldo', subtitle: 'Confianza y respaldo' }),
  },
});

/* -------------------------------------------------------- Testimonios */

export const testimoniosBloque = defineType({
  name: 'testimoniosBloque',
  title: 'Testimonios',
  type: 'object',
  fields: [
    defineField({ name: 'titulo', title: 'Titulo', type: 'string', initialValue: 'Lo que dicen nuestros clientes' }),
    defineField({
      name: 'testimonios',
      title: 'Testimonios',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'nombre', title: 'Nombre', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'distrito', title: 'Distrito', type: 'string' }),
            defineField({ name: 'texto', title: 'Comentario', type: 'text', rows: 3, validation: (r) => r.required() }),
            defineField({
              name: 'estrellas',
              title: 'Estrellas',
              type: 'number',
              options: { list: [1, 2, 3, 4, 5] },
              initialValue: 5,
            }),
            campoImagen('foto', 'Foto (opcional)'),
          ],
          preview: { select: { title: 'nombre', subtitle: 'texto', media: 'foto' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'titulo' },
    prepare: ({ title }) => ({ title: title || 'Testimonios', subtitle: 'Testimonios' }),
  },
});

/* --------------------------------------------------------------- FAQ */

export const faqBloque = defineType({
  name: 'faqBloque',
  title: 'Preguntas frecuentes',
  type: 'object',
  fields: [
    defineField({ name: 'titulo', title: 'Titulo', type: 'string', initialValue: 'Preguntas frecuentes' }),
    defineField({
      name: 'preguntas',
      title: 'Preguntas',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'pregunta', title: 'Pregunta', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'respuesta', title: 'Respuesta', type: 'text', rows: 4, validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'pregunta' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'titulo' },
    prepare: ({ title }) => ({ title: title || 'Preguntas frecuentes', subtitle: 'Preguntas frecuentes' }),
  },
});

/* ----------------------------------------------------------- Agendar */

export const agendarBloque = defineType({
  name: 'agendarBloque',
  title: 'Formulario de agendamiento',
  type: 'object',
  fields: [
    defineField({ name: 'titulo', title: 'Titulo', type: 'string', initialValue: 'Agenda tu visita tecnica' }),
    defineField({
      name: 'texto',
      title: 'Texto',
      type: 'text',
      rows: 2,
      initialValue: 'Elegi el dia y la franja que te queda comodo. Confirmamos la hora exacta por WhatsApp.',
    }),
    defineField({
      name: 'mensajeExito',
      title: 'Mensaje al enviar',
      type: 'text',
      rows: 2,
      initialValue: 'Recibimos tu solicitud. Te escribimos por WhatsApp dentro de las proximas horas para confirmar el horario.',
    }),
  ],
  preview: {
    select: { title: 'titulo' },
    prepare: ({ title }) => ({ title: title || 'Formulario de agendamiento', subtitle: 'Formulario de agendamiento' }),
  },
});

/* --------------------------------------------------------------- CTA */

export const ctaBloque = defineType({
  name: 'ctaBloque',
  title: 'Llamado a la accion',
  type: 'object',
  fields: [
    defineField({ name: 'titulo', title: 'Titulo', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'texto', title: 'Texto', type: 'text', rows: 2 }),
    defineField({ name: 'textoBoton', title: 'Texto del boton', type: 'string', initialValue: 'Agendar visita' }),
  ],
  preview: {
    select: { title: 'titulo' },
    prepare: ({ title }) => ({ title: title || 'Llamado a la accion', subtitle: 'Llamado a la accion' }),
  },
});

export const bloques = [
  heroBloque,
  serviciosBloque,
  beneficiosBloque,
  antesDespuesBloque,
  coberturaBloque,
  promocionesBloque,
  confianzaBloque,
  testimoniosBloque,
  faqBloque,
  agendarBloque,
  ctaBloque,
];
