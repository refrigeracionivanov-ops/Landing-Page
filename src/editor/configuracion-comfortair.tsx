import type { Config } from '@measured/puck';
import { OPCIONES_ICONO } from '../sanity/schemaTypes/iconos';
import CampoImagen from './CampoImagen';
import type { Ajustes } from '../tipos';

import Hero from '../components/temas/comfortair/Hero';
import Estadisticas from '../components/temas/comfortair/Estadisticas';
import Servicios from '../components/temas/comfortair/Servicios';
import Sobre from '../components/temas/comfortair/Sobre';
import Testimonios from '../components/temas/comfortair/Testimonios';
import Confianza from '../components/temas/comfortair/Confianza';
import Faq from '../components/temas/comfortair/Faq';
import Agendar from '../components/temas/comfortair/Agendar';
import Cta from '../components/temas/comfortair/Cta';
import Video from '../components/temas/comfortair/Video';

const opcionesIcono = OPCIONES_ICONO.map((o) => ({ label: o.title, value: o.value }));

const comoBloque = (props: any) => props;
const aplanar = (lista: any) => (lista ?? []).map((o: any) => o?.valor ?? '').filter(Boolean);

const PROYECTO = import.meta.env.PUBLIC_SANITY_PROJECT_ID as string;
const DATASET = (import.meta.env.PUBLIC_SANITY_DATASET as string) ?? 'production';

const campoImagen = (label: string) =>
  ({
    type: 'custom',
    label,
    render: ({ value, onChange }: any) => (
      <CampoImagen valor={value} alCambiar={onChange} proyecto={PROYECTO} dataset={DATASET} />
    ),
  }) as any;

const ajustesDe = (props: any): Ajustes => props.puck.metadata.ajustes;

export const configuracionComfortair: Config = {
  components: {
    Portada: {
      label: 'Portada',
      fields: {
        titular: { type: 'textarea', label: 'Titular' },
        subtitulo: { type: 'textarea', label: 'Subtítulo' },
        imagen: campoImagen('Imagen de fondo'),
        textoBotonAgendar: { type: 'text', label: 'Texto del botón principal' },
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

    Beneficios: {
      label: 'Estadísticas',
      fields: {
        titulo: { type: 'text', label: 'Título' },
        items: {
          type: 'array',
          label: 'Tarjetas',
          getItemSummary: (item: any) => item.titulo || 'Estadística',
          arrayFields: {
            icono: { type: 'select', label: 'Icono', options: opcionesIcono },
            titulo: { type: 'text', label: 'Valor (ej: +500)' },
            texto: { type: 'textarea', label: 'Descripción' },
          },
        },
      },
      defaultProps: {
        titulo: 'Por qué elegirnos',
        items: [
          { icono: 'herramienta', titulo: '+500', texto: 'Equipos instalados' },
          { icono: 'reloj', titulo: '10 años', texto: 'De experiencia' },
          { icono: 'estrella', titulo: '4.9★', texto: 'Calificación promedio' },
          { icono: 'escudo', titulo: '100%', texto: 'Garantizados' },
        ],
      },
      render: (props: any) => <Estadisticas bloque={comoBloque(props)} />,
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
            imagen: campoImagen('Foto de fondo'),
          },
        },
      },
      defaultProps: { titulo: 'Nuestros servicios', servicios: [] },
      render: (props: any) => <Servicios bloque={comoBloque(props)} />,
    },

    'Como trabajamos': {
      label: 'Cómo trabajamos',
      fields: {
        titulo: { type: 'text', label: 'Título' },
        intro: { type: 'textarea', label: 'Texto de entrada' },
        pasos: {
          type: 'array',
          label: 'Pasos',
          getItemSummary: (item: any) => item.titulo || 'Paso',
          arrayFields: {
            titulo: { type: 'text', label: 'Título' },
            texto: { type: 'textarea', label: 'Texto' },
            imagen: campoImagen('Imagen'),
          },
        },
      },
      defaultProps: {
        titulo: 'Así trabajamos',
        pasos: [
          { titulo: 'Pedís la visita', texto: 'Por la web o por WhatsApp.' },
          { titulo: 'Confirmamos', texto: 'Te escribimos con el horario exacto.' },
          { titulo: 'Vamos', texto: 'El técnico llega el día acordado.' },
        ],
      },
      render: (props: any) => <Sobre bloque={comoBloque(props)} />,
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
            distrito: { type: 'text', label: 'Barrio o zona' },
            texto: { type: 'textarea', label: 'Testimonio' },
            estrellas: { type: 'number', label: 'Estrellas (1-5)', min: 1, max: 5 },
            foto: campoImagen('Foto (opcional)'),
          },
        },
      },
      defaultProps: { titulo: 'Lo que dicen nuestros clientes', testimonios: [] },
      render: (props: any) => <Testimonios bloque={comoBloque(props)} />,
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

    'Agendar visita': {
      label: 'Agendar visita',
      fields: {
        titulo: { type: 'text', label: 'Título' },
        texto: { type: 'textarea', label: 'Texto introductorio' },
        mensajeExito: { type: 'textarea', label: 'Mensaje al enviar' },
      },
      defaultProps: { titulo: 'Agendá tu visita técnica' },
      render: (props: any) => (
        <Agendar
          bloque={comoBloque(props)}
          ajustes={ajustesDe(props)}
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

  root: { fields: {} },
};
