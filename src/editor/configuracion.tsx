import type { Config } from '@measured/puck';
import { OPCIONES_ICONO } from '../sanity/schemaTypes/iconos';
import CampoImagen from './CampoImagen';
import type { Ajustes } from '../tipos';

import Hero from '../components/bloques/Hero';
import Texto from '../components/bloques/Texto';
import Pasos from '../components/bloques/Pasos';
import Planes from '../components/bloques/Planes';
import Aviso from '../components/bloques/Aviso';
import Beneficios from '../components/bloques/Beneficios';
import Servicios from '../components/bloques/Servicios';
import Promociones from '../components/bloques/Promociones';
import AntesDespues from '../components/bloques/AntesDespues';
import Confianza from '../components/bloques/Confianza';
import Cobertura from '../components/bloques/Cobertura';
import Testimonios from '../components/bloques/Testimonios';
import Faq from '../components/bloques/FaqEditor';
import Agendar from '../components/bloques/Agendar';
import Cta from '../components/bloques/Cta';
import Video from '../components/bloques/Video';

/**
 * Que puede editar cada bloque, y con que se dibuja en el lienzo.
 *
 * Los `render` reusan exactamente los mismos componentes que renderiza el sitio
 * publicado. No hay una version "de editor" y otra "de verdad": lo que se ve
 * arrastrando es la pagina.
 */

const opcionesIcono = OPCIONES_ICONO.map((o) => ({ label: o.title, value: o.value }));

/** Puck entrega los props sueltos; los componentes esperan un `bloque`. */
const comoBloque = (props: any) => props;

/** Las listas de texto viajan como objetos por Puck. Ver `adaptador.ts`. */
const aplanar = (lista: any) => (lista ?? []).map((o: any) => o?.valor ?? '').filter(Boolean);

const PROYECTO = import.meta.env.PUBLIC_SANITY_PROJECT_ID as string;
const DATASET = (import.meta.env.PUBLIC_SANITY_DATASET as string) ?? 'production';

/** Campo de imagen: subida, vista previa y texto alternativo en un solo lugar. */
const campoImagen = (label: string) =>
  ({
    type: 'custom',
    label,
    render: ({ value, onChange }: any) => (
      <CampoImagen valor={value} alCambiar={onChange} proyecto={PROYECTO} dataset={DATASET} />
    ),
  }) as any;

const ajustesDe = (props: any): Ajustes => props.puck.metadata.ajustes;

export const configuracion: Config = {
  components: {
    Portada: {
      label: 'Portada',
      fields: {
        titular: { type: 'textarea', label: 'Titular' },
        subtitulo: { type: 'textarea', label: 'Subtítulo' },
        imagen: campoImagen('Imagen'),
        textoBotonAgendar: { type: 'text', label: 'Texto del botón' },
        mostrarBotonWhatsapp: {
          type: 'radio',
          label: 'Botón de WhatsApp',
          options: [
            { label: 'Mostrar', value: true },
            { label: 'Ocultar', value: false },
          ],
        },
      },
      defaultProps: { titular: 'Titular nuevo', mostrarBotonWhatsapp: true },
      render: (props: any) => <Hero bloque={comoBloque(props)} ajustes={ajustesDe(props)} />,
    },

    'Texto libre': {
      label: 'Texto libre',
      fields: {
        titulo: { type: 'text', label: 'Título' },
        texto: { type: 'textarea', label: 'Texto (dejá una línea en blanco entre párrafos)' },
        fondoGris: {
          type: 'radio',
          label: 'Fondo',
          options: [
            { label: 'Blanco', value: false },
            { label: 'Gris', value: true },
          ],
        },
      },
      defaultProps: { titulo: 'Título de la sección', texto: 'Escribí acá el texto.', fondoGris: false },
      render: (props: any) => <Texto bloque={comoBloque(props)} />,
    },

    'Como trabajamos': {
      label: 'Cómo trabajamos',
      fields: {
        titulo: { type: 'text', label: 'Título' },
        intro: { type: 'textarea', label: 'Texto de entrada' },
        pasos: {
          type: 'array',
          label: 'Pasos (se numeran solos)',
          getItemSummary: (item: any) => item.titulo || 'Paso',
          arrayFields: {
            titulo: { type: 'text', label: 'Título' },
            texto: { type: 'textarea', label: 'Texto' },
          },
        },
      },
      defaultProps: {
        titulo: 'Cómo trabajamos',
        pasos: [
          { titulo: 'Pedís la visita', texto: 'Por la web o por WhatsApp.' },
          { titulo: 'Confirmamos', texto: 'Te escribimos con el horario exacto.' },
          { titulo: 'Vamos', texto: 'El técnico llega el día acordado.' },
        ],
      },
      render: (props: any) => <Pasos bloque={comoBloque(props)} />,
    },

    'Planes y precios': {
      label: 'Planes y precios',
      fields: {
        titulo: { type: 'text', label: 'Título' },
        intro: { type: 'textarea', label: 'Texto de entrada' },
        planes: {
          type: 'array',
          label: 'Planes',
          getItemSummary: (item: any) => item.nombre || 'Plan',
          arrayFields: {
            nombre: { type: 'text', label: 'Nombre' },
            precio: { type: 'text', label: 'Precio (ej: $ 75.000)' },
            periodo: { type: 'text', label: 'Período (ej: por año)' },
            descripcion: { type: 'textarea', label: 'Descripción' },
            incluye: {
              type: 'array',
              label: 'Qué incluye',
              getItemSummary: (item: any) => item.valor || 'Item',
              arrayFields: { valor: { type: 'text', label: 'Item' } },
            },
            textoBoton: { type: 'text', label: 'Texto del botón' },
            destacado: {
              type: 'radio',
              label: 'Destacar',
              options: [
                { label: 'No', value: false },
                { label: 'Sí', value: true },
              ],
            },
          },
        },
      },
      defaultProps: {
        titulo: 'Planes de mantenimiento',
        planes: [{ nombre: 'Plan básico', precio: '$ 75.000', periodo: 'por año', incluye: [], destacado: false }],
      },
      render: (props: any) => (
        <Planes
          bloque={{
            ...comoBloque(props),
            planes: (props.planes ?? []).map((plan: any) => ({ ...plan, incluye: aplanar(plan.incluye) })),
          }}
        />
      ),
    },

    'Aviso destacado': {
      label: 'Aviso destacado',
      fields: {
        icono: { type: 'select', label: 'Icono', options: opcionesIcono },
        titulo: { type: 'text', label: 'Título' },
        texto: { type: 'text', label: 'Texto' },
        textoBoton: { type: 'text', label: 'Texto del botón (vacío = sin botón)' },
        accion: {
          type: 'select',
          label: 'Qué hace el botón',
          options: [
            { label: 'Ir al formulario', value: 'agendar' },
            { label: 'Abrir WhatsApp', value: 'whatsapp' },
            { label: 'Llamar', value: 'llamar' },
          ],
        },
      },
      defaultProps: {
        icono: 'rayo',
        titulo: 'Atención de emergencia',
        texto: 'Si tu equipo dejó de andar, coordinamos visita el mismo día.',
        textoBoton: 'Escribir ahora',
        accion: 'whatsapp',
      },
      render: (props: any) => <Aviso bloque={comoBloque(props)} ajustes={ajustesDe(props)} />,
    },

    Beneficios: {
      label: 'Beneficios',
      fields: {
        titulo: { type: 'text', label: 'Título' },
        items: {
          type: 'array',
          label: 'Beneficios',
          getItemSummary: (item: any) => item.titulo || 'Beneficio',
          arrayFields: {
            icono: { type: 'select', label: 'Icono', options: opcionesIcono },
            titulo: { type: 'text', label: 'Título' },
            texto: { type: 'textarea', label: 'Texto' },
          },
        },
      },
      defaultProps: { titulo: 'Por que elegirnos', items: [] },
      render: (props: any) => <Beneficios bloque={comoBloque(props)} />,
    },

    Servicios: {
      label: 'Servicios',
      fields: {
        titulo: { type: 'text', label: 'Título' },
        intro: { type: 'textarea', label: 'Introducción' },
        servicios: {
          type: 'array',
          label: 'Servicios',
          getItemSummary: (item: any) => item.nombre || 'Servicio',
          arrayFields: {
            icono: { type: 'select', label: 'Icono', options: opcionesIcono },
            nombre: { type: 'text', label: 'Nombre' },
            descripcion: { type: 'textarea', label: 'Descripción' },
            precioDesde: { type: 'text', label: 'Precio desde' },
          },
        },
      },
      defaultProps: { titulo: 'Nuestros servicios', servicios: [] },
      render: (props: any) => <Servicios bloque={comoBloque(props)} />,
    },

    Promociones: {
      label: 'Promociones',
      fields: {
        titulo: { type: 'text', label: 'Título' },
        promos: {
          type: 'array',
          label: 'Promociones',
          getItemSummary: (item: any) => item.titulo || 'Promocion',
          arrayFields: {
            destacado: { type: 'text', label: 'Destacado (ej: 20% OFF)' },
            titulo: { type: 'text', label: 'Título' },
            descripcion: { type: 'textarea', label: 'Descripción' },
            vigenciaHasta: { type: 'text', label: 'Vigente hasta (AAAA-MM-DD)' },
          },
        },
      },
      defaultProps: { titulo: 'Promociones del mes', promos: [] },
      render: (props: any) => <Promociones bloque={comoBloque(props)} />,
    },

    'Antes y despues': {
      label: 'Antes y después',
      fields: {
        titulo: { type: 'text', label: 'Título' },
        pares: {
          type: 'array',
          label: 'Trabajos',
          getItemSummary: (item: any) => item.descripcion || 'Trabajo',
          arrayFields: {
            antes: campoImagen('Foto ANTES'),
            despues: campoImagen('Foto DESPUES'),
            descripcion: { type: 'textarea', label: 'Descripción' },
          },
        },
      },
      defaultProps: { titulo: 'Trabajos realizados', pares: [] },
      render: (props: any) => <AntesDespues bloque={comoBloque(props)} />,
    },

    Confianza: {
      label: 'Confianza',
      fields: {
        titulo: { type: 'text', label: 'Título' },
        items: {
          type: 'array',
          label: 'Cifras',
          getItemSummary: (item: any) => item.etiqueta || 'Cifra',
          arrayFields: {
            valor: { type: 'text', label: 'Valor (ej: 12 años)' },
            etiqueta: { type: 'text', label: 'Etiqueta' },
          },
        },
      },
      defaultProps: { titulo: 'Trabajo respaldado', items: [] },
      render: (props: any) => <Confianza bloque={comoBloque(props)} />,
    },

    'Zonas donde atendemos': {
      label: 'Zonas donde atendemos',
      fields: {
        titulo: { type: 'text', label: 'Título' },
        texto: { type: 'textarea', label: 'Texto' },
        distritos: {
          type: 'array',
          label: 'Barrios',
          getItemSummary: (item: any) => item.valor || 'Distrito',
          arrayFields: { valor: { type: 'text', label: 'Barrio' } },
        },
        notaFueraDeZona: { type: 'textarea', label: 'Nota al pie' },
      },
      defaultProps: { titulo: 'Zonas donde atendemos', distritos: [] },
      // Los distritos viajan como objetos por Puck; el componente los quiere planos.
      render: (props: any) => (
        <Cobertura bloque={{ ...comoBloque(props), distritos: aplanar(props.distritos) }} />
      ),
    },

    Testimonios: {
      label: 'Testimonios',
      fields: {
        titulo: { type: 'text', label: 'Título' },
        testimonios: {
          type: 'array',
          label: 'Testimonios',
          getItemSummary: (item: any) => item.nombre || 'Testimonio',
          arrayFields: {
            nombre: { type: 'text', label: 'Nombre' },
            distrito: { type: 'text', label: 'Barrio' },
            texto: { type: 'textarea', label: 'Testimonio' },
            estrellas: { type: 'number', label: 'Estrellas', min: 1, max: 5 },
            foto: campoImagen('Foto (opcional)'),
          },
        },
      },
      defaultProps: { titulo: 'Lo que dicen nuestros clientes', testimonios: [] },
      render: (props: any) => <Testimonios bloque={comoBloque(props)} />,
    },

    'Preguntas frecuentes': {
      label: 'Preguntas frecuentes',
      fields: {
        titulo: { type: 'text', label: 'Título' },
        preguntas: {
          type: 'array',
          label: 'Preguntas',
          getItemSummary: (item: any) => item.pregunta || 'Pregunta',
          arrayFields: {
            pregunta: { type: 'text', label: 'Pregunta' },
            respuesta: { type: 'textarea', label: 'Respuesta' },
          },
        },
      },
      defaultProps: { titulo: 'Preguntas frecuentes', preguntas: [] },
      render: (props: any) => <Faq bloque={comoBloque(props)} />,
    },

    /**
     * Todavia no esta portado a React: es el unico bloque con logica propia
     * (formulario de dos pasos y envio a /api/reservar). En el lienzo se muestra
     * como un marcador para que se pueda mover y ordenar; en el sitio publicado
     * sigue renderizando el formulario real.
     */
    'Agendar visita': {
      label: 'Agendar visita',
      fields: {
        titulo: { type: 'text', label: 'Título' },
        texto: { type: 'textarea', label: 'Texto' },
        mensajeExito: { type: 'textarea', label: 'Mensaje al enviar' },
      },
      defaultProps: { titulo: 'Agendá tu visita técnica' },
      render: (props: any) => (
        <Agendar
          bloque={comoBloque(props)}
          ajustes={ajustesDe(props)}
          /* Ya vienen como lista de textos desde el servidor: `aplanar` es para
             las listas que edita Puck, que viajan como objetos. */
          distritos={props.puck.metadata.distritos}
        />
      ),
    },

    Video: {
      label: 'Video',
      fields: {
        titulo: { type: 'text', label: 'Título de la sección' },
        url: { type: 'text', label: 'URL del video (YouTube)' },
      },
      defaultProps: { titulo: 'Miranos en acción' },
      render: (props: any) => <Video bloque={comoBloque(props)} />,
    },

    Cierre: {
      label: 'Cierre',
      fields: {
        titulo: { type: 'text', label: 'Título' },
        texto: { type: 'textarea', label: 'Texto' },
        textoBoton: { type: 'text', label: 'Texto del botón' },
      },
      defaultProps: { titulo: '¿Tu equipo dejó de enfriar?' },
      render: (props: any) => <Cta bloque={comoBloque(props)} ajustes={ajustesDe(props)} />,
    },
  },

  /**
   * Sin campos propios de la pagina.
   *
   * Si no se declara nada, Puck arma solo un panel "Page" con un campo "title".
   * Ese titulo no se guarda en ningun lado — `dePuckASanity` solo mira las
   * secciones — asi que era una casilla que se podia llenar para nada. El titulo
   * de verdad, el que ve Google, esta en el campo SEO de la pagina en Sanity.
   */
  root: { fields: {} },
};
