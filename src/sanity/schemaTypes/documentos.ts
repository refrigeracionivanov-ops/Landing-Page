import { defineField, defineType, defineArrayMember } from 'sanity';
import { bloques } from './bloques';

/* ------------------------------------------------------------- Pagina */

export const pagina = defineType({
  name: 'pagina',
  title: 'Pagina',
  type: 'document',
  fields: [
    defineField({
      name: 'titulo',
      title: 'Titulo interno',
      type: 'string',
      description: 'Solo para identificarla en este panel. No se muestra en el sitio.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Direccion',
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
          title: 'Titulo en Google',
          type: 'string',
          validation: (r) => r.max(60).warning('Google corta alrededor de los 60 caracteres.'),
        }),
        defineField({
          name: 'descripcion',
          title: 'Descripcion en Google',
          type: 'text',
          rows: 3,
          validation: (r) => r.max(160).warning('Google corta alrededor de los 160 caracteres.'),
        }),
      ],
    }),
    defineField({
      name: 'secciones',
      title: 'Secciones de la pagina',
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
      title: 'Telefono',
      type: 'string',
      description: 'Con codigo de pais. Ej: +51 999 888 777',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp',
      type: 'string',
      description: 'Solo numeros, con codigo de pais y sin espacios ni signos. Ej: 51999888777',
      validation: (r) =>
        r
          .required()
          .regex(/^\d{8,15}$/, { name: 'solo numeros' })
          .error('Solo numeros, sin +, espacios ni guiones. Ej: 51999888777'),
    }),
    defineField({
      name: 'mensajeWhatsapp',
      title: 'Mensaje precargado de WhatsApp',
      type: 'string',
      initialValue: 'Hola, quiero consultar por un servicio de ventilacion.',
      description: 'Lo que aparece ya escrito cuando alguien abre el chat desde la web.',
    }),
    defineField({ name: 'email', title: 'Correo', type: 'string' }),
    defineField({ name: 'direccion', title: 'Direccion', type: 'string' }),
    defineField({
      name: 'horario',
      title: 'Horario de atencion',
      type: 'string',
      initialValue: 'Lunes a sabado, 8:00 a 18:00',
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
      title: 'Enlace para dejar resenas en Google',
      type: 'url',
      description:
        'El enlace corto que da tu perfil de negocio en Google para pedir resenas. Sin esto, el boton no aparece.',
    }),
    defineField({
      name: 'mensajeResena',
      title: 'Mensaje para pedir la resena',
      type: 'text',
      rows: 3,
      description: 'Se le manda por WhatsApp al cliente. {nombre} se reemplaza por su nombre.',
      initialValue:
        'Hola {nombre}, gracias por confiar en nosotros. Si quedaste conforme con la visita, nos ayudaria muchisimo una resena en Google. Te toma un minuto:',
    }),
    defineField({
      name: 'franjas',
      title: 'Franjas horarias de visita',
      type: 'array',
      description: 'Las opciones que ve el cliente al agendar, y cuantas visitas aceptas por franja.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'etiqueta',
              title: 'Etiqueta',
              type: 'string',
              description: 'Ej: "Manana (8:00 - 12:00)"',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'cupo',
              title: 'Visitas por dia en esta franja',
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
      title: 'Dias minimos de anticipacion',
      type: 'number',
      initialValue: 1,
      description: 'Con 1, lo mas temprano que alguien puede pedir es manana.',
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
