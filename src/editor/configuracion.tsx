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
import Faq from '../components/bloques/Faq';
import Cta from '../components/bloques/Cta';

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
        subtitulo: { type: 'textarea', label: 'Subtitulo' },
        imagen: campoImagen('Imagen'),
        textoBotonAgendar: { type: 'text', label: 'Texto del boton' },
        mostrarBotonWhatsapp: {
          type: 'radio',
          label: 'Boton de WhatsApp',
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
        titulo: { type: 'text', label: 'Titulo' },
        texto: { type: 'textarea', label: 'Texto (deja una linea en blanco entre parrafos)' },
        fondoGris: {
          type: 'radio',
          label: 'Fondo',
          options: [
            { label: 'Blanco', value: false },
            { label: 'Gris', value: true },
          ],
        },
      },
      defaultProps: { titulo: 'Titulo de la seccion', texto: 'Escribi aca el texto.', fondoGris: false },
      render: (props: any) => <Texto bloque={comoBloque(props)} />,
    },

    'Como trabajamos': {
      label: 'Como trabajamos',
      fields: {
        titulo: { type: 'text', label: 'Titulo' },
        intro: { type: 'textarea', label: 'Texto de entrada' },
        pasos: {
          type: 'array',
          label: 'Pasos (se numeran solos)',
          getItemSummary: (item: any) => item.titulo || 'Paso',
          arrayFields: {
            titulo: { type: 'text', label: 'Titulo' },
            texto: { type: 'textarea', label: 'Texto' },
          },
        },
      },
      defaultProps: {
        titulo: 'Como trabajamos',
        pasos: [
          { titulo: 'Pedis la visita', texto: 'Por la web o por WhatsApp.' },
          { titulo: 'Confirmamos', texto: 'Te escribimos con el horario exacto.' },
          { titulo: 'Vamos', texto: 'El tecnico llega el dia acordado.' },
        ],
      },
      render: (props: any) => <Pasos bloque={comoBloque(props)} />,
    },

    'Planes y precios': {
      label: 'Planes y precios',
      fields: {
        titulo: { type: 'text', label: 'Titulo' },
        intro: { type: 'textarea', label: 'Texto de entrada' },
        planes: {
          type: 'array',
          label: 'Planes',
          getItemSummary: (item: any) => item.nombre || 'Plan',
          arrayFields: {
            nombre: { type: 'text', label: 'Nombre' },
            precio: { type: 'text', label: 'Precio (ej: S/ 200)' },
            periodo: { type: 'text', label: 'Periodo (ej: por ano)' },
            descripcion: { type: 'textarea', label: 'Descripcion' },
            incluye: {
              type: 'array',
              label: 'Que incluye',
              getItemSummary: (item: any) => item.valor || 'Item',
              arrayFields: { valor: { type: 'text', label: 'Item' } },
            },
            textoBoton: { type: 'text', label: 'Texto del boton' },
            destacado: {
              type: 'radio',
              label: 'Destacar',
              options: [
                { label: 'No', value: false },
                { label: 'Si', value: true },
              ],
            },
          },
        },
      },
      defaultProps: {
        titulo: 'Planes de mantenimiento',
        planes: [{ nombre: 'Plan basico', precio: 'S/ 200', periodo: 'por ano', incluye: [], destacado: false }],
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
        titulo: { type: 'text', label: 'Titulo' },
        texto: { type: 'text', label: 'Texto' },
        textoBoton: { type: 'text', label: 'Texto del boton (vacio = sin boton)' },
        accion: {
          type: 'select',
          label: 'Que hace el boton',
          options: [
            { label: 'Ir al formulario', value: 'agendar' },
            { label: 'Abrir WhatsApp', value: 'whatsapp' },
            { label: 'Llamar', value: 'llamar' },
          ],
        },
      },
      defaultProps: {
        icono: 'rayo',
        titulo: 'Atencion de emergencia',
        texto: 'Si tu equipo dejo de andar, coordinamos visita el mismo dia.',
        textoBoton: 'Escribir ahora',
        accion: 'whatsapp',
      },
      render: (props: any) => <Aviso bloque={comoBloque(props)} ajustes={ajustesDe(props)} />,
    },

    Beneficios: {
      label: 'Beneficios',
      fields: {
        titulo: { type: 'text', label: 'Titulo' },
        items: {
          type: 'array',
          label: 'Beneficios',
          getItemSummary: (item: any) => item.titulo || 'Beneficio',
          arrayFields: {
            icono: { type: 'select', label: 'Icono', options: opcionesIcono },
            titulo: { type: 'text', label: 'Titulo' },
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
        titulo: { type: 'text', label: 'Titulo' },
        intro: { type: 'textarea', label: 'Introduccion' },
        servicios: {
          type: 'array',
          label: 'Servicios',
          getItemSummary: (item: any) => item.nombre || 'Servicio',
          arrayFields: {
            icono: { type: 'select', label: 'Icono', options: opcionesIcono },
            nombre: { type: 'text', label: 'Nombre' },
            descripcion: { type: 'textarea', label: 'Descripcion' },
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
        titulo: { type: 'text', label: 'Titulo' },
        promos: {
          type: 'array',
          label: 'Promociones',
          getItemSummary: (item: any) => item.titulo || 'Promocion',
          arrayFields: {
            destacado: { type: 'text', label: 'Destacado (ej: 20% OFF)' },
            titulo: { type: 'text', label: 'Titulo' },
            descripcion: { type: 'textarea', label: 'Descripcion' },
            vigenciaHasta: { type: 'text', label: 'Vigente hasta (AAAA-MM-DD)' },
          },
        },
      },
      defaultProps: { titulo: 'Promociones del mes', promos: [] },
      render: (props: any) => <Promociones bloque={comoBloque(props)} />,
    },

    'Antes y despues': {
      label: 'Antes y despues',
      fields: {
        titulo: { type: 'text', label: 'Titulo' },
        pares: {
          type: 'array',
          label: 'Trabajos',
          getItemSummary: (item: any) => item.descripcion || 'Trabajo',
          arrayFields: {
            antes: campoImagen('Foto ANTES'),
            despues: campoImagen('Foto DESPUES'),
            descripcion: { type: 'textarea', label: 'Descripcion' },
          },
        },
      },
      defaultProps: { titulo: 'Trabajos realizados', pares: [] },
      render: (props: any) => <AntesDespues bloque={comoBloque(props)} />,
    },

    Confianza: {
      label: 'Confianza',
      fields: {
        titulo: { type: 'text', label: 'Titulo' },
        items: {
          type: 'array',
          label: 'Cifras',
          getItemSummary: (item: any) => item.etiqueta || 'Cifra',
          arrayFields: {
            valor: { type: 'text', label: 'Valor (ej: 12 anos)' },
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
        titulo: { type: 'text', label: 'Titulo' },
        texto: { type: 'textarea', label: 'Texto' },
        distritos: {
          type: 'array',
          label: 'Distritos',
          getItemSummary: (item: any) => item.valor || 'Distrito',
          arrayFields: { valor: { type: 'text', label: 'Distrito' } },
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
        titulo: { type: 'text', label: 'Titulo' },
        testimonios: {
          type: 'array',
          label: 'Testimonios',
          getItemSummary: (item: any) => item.nombre || 'Testimonio',
          arrayFields: {
            nombre: { type: 'text', label: 'Nombre' },
            distrito: { type: 'text', label: 'Distrito' },
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
        titulo: { type: 'text', label: 'Titulo' },
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
        titulo: { type: 'text', label: 'Titulo' },
        texto: { type: 'textarea', label: 'Texto' },
        mensajeExito: { type: 'textarea', label: 'Mensaje al enviar' },
      },
      defaultProps: { titulo: 'Agenda tu visita tecnica' },
      render: (props: any) => (
        <section className="banda seccion">
          <div className="contenedor">
            <h2 className="titulo-seccion text-tinta">{props.titulo}</h2>
            {props.texto && <p className="cuerpo-lg mt-4 text-tinta-media">{props.texto}</p>}
            <div className="mt-8 border border-dashed border-superficie-2 bg-lienzo p-8 text-center">
              <p className="cuerpo-sm text-tinta-media">
                Formulario de agendamiento — se muestra completo en el sitio publicado.
              </p>
            </div>
          </div>
        </section>
      ),
    },

    Cierre: {
      label: 'Cierre',
      fields: {
        titulo: { type: 'text', label: 'Titulo' },
        texto: { type: 'textarea', label: 'Texto' },
        textoBoton: { type: 'text', label: 'Texto del boton' },
      },
      defaultProps: { titulo: 'Tu equipo dejo de enfriar?' },
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
