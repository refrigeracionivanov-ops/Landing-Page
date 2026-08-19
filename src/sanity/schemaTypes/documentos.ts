import { defineField, defineType, defineArrayMember } from 'sanity';
import { bloques } from './bloques';

/* ------------------------------------------------------------- Pagina */

export const pagina = defineType({
  name: 'pagina',
  title: 'Página',
  type: 'document',
  fields: [
    defineField({
      name: 'titulo',
      title: 'Título interno',
      type: 'string',
      description: 'Solo para identificarla en este panel. No se muestra en el sitio.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Dirección',
      type: 'slug',
      options: { source: 'titulo', maxLength: 96 },
      description: 'Usa "inicio" para la pagina principal.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'seo',
      title: 'Buscadores (Google)',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'titulo',
          title: 'Título en Google',
          type: 'string',
          validation: (r) => r.max(60).warning('Google corta alrededor de los 60 caracteres.'),
        }),
        defineField({
          name: 'descripcion',
          title: 'Descripción en Google',
          type: 'text',
          rows: 3,
          validation: (r) => r.max(160).warning('Google corta alrededor de los 160 caracteres.'),
        }),
      ],
    }),
    defineField({
      name: 'secciones',
      title: 'Secciones de la página',
      type: 'array',
      description: 'Agrega, arrastra para reordenar, o borra secciones. Se muestran en este orden.',
      of: bloques.map((b) => defineArrayMember({ type: b.name })),
    }),
  ],
  preview: { select: { title: 'titulo', subtitle: 'slug.current' } },
});

/* ------------------------------------------------------------ Ajustes */

export const ajustes = defineType({
  name: 'ajustes',
  title: 'Ajustes del negocio',
  type: 'document',
  fields: [
    defineField({ name: 'nombre', title: 'Nombre del negocio', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      fields: [defineField({ name: 'alt', title: 'Texto alternativo', type: 'string' })],
    }),
    defineField({
      name: 'telefono',
      title: 'Teléfono',
      type: 'string',
      description: 'Con código de país. Ej: +54 11 4567-8900',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp',
      type: 'string',
      description: 'Solo números, con código de país y sin espacios ni signos. Ej: 5491145678900',
      validation: (r) =>
        r
          .required()
          .regex(/^\d{8,15}$/, { name: 'solo numeros' })
          .error('Solo números, sin +, espacios ni guiones. Ej: 5491145678900'),
    }),
    defineField({
      name: 'mensajeWhatsapp',
      title: 'Mensaje precargado de WhatsApp',
      type: 'string',
      initialValue: 'Hola, quiero consultar por un servicio de ventilación.',
      description: 'Lo que aparece ya escrito cuando alguien abre el chat desde la web.',
    }),
    defineField({ name: 'email', title: 'Correo', type: 'string' }),
    defineField({ name: 'direccion', title: 'Dirección', type: 'string' }),
    defineField({
      name: 'horario',
      title: 'Horario de atención',
      type: 'string',
      initialValue: 'Lunes a sábado, 8:00 a 18:00',
    }),
    defineField({
      name: 'mostrarBarraContacto',
      title: 'Mostrar barra fija de contacto en celular',
      type: 'boolean',
      initialValue: true,
      description: 'La barra de "Llamar / WhatsApp" que queda fija abajo en el celular.',
    }),
    defineField({
      name: 'googleResenas',
      title: 'Enlace para dejar reseñas en Google',
      type: 'url',
      description:
        'El enlace corto que da tu perfil de negocio en Google para pedir reseñas. Sin esto, el botón no aparece.',
    }),
    defineField({
      name: 'mensajeResena',
      title: 'Mensaje para pedir la reseña',
      type: 'text',
      rows: 3,
      description: 'Se le manda por WhatsApp al cliente. {nombre} se reemplaza por su nombre.',
      initialValue:
        'Hola {nombre}, gracias por confiar en nosotros. Si quedaste conforme con la visita, nos ayudaría muchísimo una reseña en Google. Te toma un minuto:',
    }),
    defineField({
      name: 'franjas',
      title: 'Franjas horarias de visita',
      type: 'array',
      description: 'Las opciones que ve el cliente al agendar, y cuántas visitas aceptás por franja.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'etiqueta',
              title: 'Etiqueta',
              type: 'string',
              description: 'Ej: "Mañana (8:00 - 12:00)"',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'cupo',
              title: 'Visitas por día en esta franja',
              type: 'number',
              initialValue: 3,
              validation: (r) => r.required().min(1).max(20),
            }),
          ],
          preview: { select: { title: 'etiqueta', subtitle: 'cupo' } },
        }),
      ],
    }),
    defineField({
      name: 'diasAnticipacion',
      title: 'Días mínimos de anticipación',
      type: 'number',
      initialValue: 1,
      description: 'Con 1, lo más temprano que alguien puede pedir es mañana.',
      validation: (r) => r.min(0).max(30),
    }),
  ],
  preview: { prepare: () => ({ title: 'Ajustes del negocio' }) },
});

/* ------------------------------------------------------------------------
 * Las solicitudes de visita NO se modelan aca.
 *
 * Contienen nombre, telefono y direccion de clientes reales. El plan gratuito
 * de Sanity solo permite datasets publicos, y el project ID viaja en el HTML
 * del sitio, asi que cualquiera podria consultarlas sin autenticarse.
 *
 * Viven en Cloudflare D1 (`migrations/0001_solicitudes.sql`) y se administran
 * en /solicitudes, detras de Cloudflare Access.
 * ---------------------------------------------------------------------- */
