/**
 * Carga contenido de ejemplo en Sanity para poder ver el sitio funcionando.
 *
 *   npm run sembrar
 *
 * Los textos son genericos a proposito: sirven de plantilla para reemplazar
 * desde /administrador. No sube imagenes; esas se cargan desde el panel.
 *
 * Los precios son de ejemplo y hay que revisarlos antes de publicar.
 */
import { createClient } from '@sanity/client';

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, SANITY_WRITE_TOKEN } = process.env;

if (!PUBLIC_SANITY_PROJECT_ID || !SANITY_WRITE_TOKEN) {
  console.error('\nFaltan PUBLIC_SANITY_PROJECT_ID o SANITY_WRITE_TOKEN en el archivo .env\n');
  process.exit(1);
}

const cliente = createClient({
  projectId: PUBLIC_SANITY_PROJECT_ID,
  dataset: PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-10-01',
  token: SANITY_WRITE_TOKEN,
  useCdn: false,
});

const k = (() => {
  let n = 0;
  return () => `k${++n}`;
})();

const ajustes = {
  _id: 'ajustes',
  _type: 'ajustes',
  nombre: 'AireControl',
  telefono: '+54 11 4567-8900',
  whatsapp: '5491145678900',
  mensajeWhatsapp: 'Hola, quiero consultar por un servicio de ventilación.',
  email: 'contacto@airecontrol.com.ar',
  direccion: 'Av. Corrientes 1234, CABA',
  horario: 'Lunes a sábado, 8:00 a 18:00',
  mostrarBarraContacto: true,
  diasAnticipacion: 1,
  googleResenas: '',
  mensajeResena:
    'Hola {nombre}, gracias por confiar en nosotros. Si quedaste conforme con la visita, nos ayudaría muchísimo una reseña en Google. Te toma un minuto:',
  franjas: [
    { _key: k(), etiqueta: 'Mañana (8:00 - 12:00)', cupo: 3 },
    { _key: k(), etiqueta: 'Tarde (13:00 - 18:00)', cupo: 3 },
  ],
};

const pagina = {
  _id: 'pagina-inicio',
  _type: 'pagina',
  titulo: 'Inicio',
  slug: { _type: 'slug', current: 'inicio' },
  seo: {
    titulo: 'AireControl — Aire acondicionado y ventilación en Buenos Aires',
    descripcion:
      'Instalación, mantenimiento y reparación de aire acondicionado en CABA y zona norte. Técnicos matriculados, garantía por escrito y visita agendada online.',
  },
  secciones: [
    {
      _key: k(),
      _type: 'heroBloque',
      titular: 'Tu aire acondicionado, funcionando como el primer día',
      subtitulo:
        'Instalación, mantenimiento y reparación con técnicos matriculados. Agendá tu visita online y confirmamos por WhatsApp el mismo día.',
      textoBotonAgendar: 'Agendar visita',
      mostrarBotonWhatsapp: true,
    },
    {
      _key: k(),
      _type: 'beneficiosBloque',
      titulo: '¿Por qué elegirnos?',
      items: [
        { _key: k(), icono: 'moneda', titulo: 'Hasta 30% menos de consumo', texto: 'Un equipo limpio y bien calibrado gasta bastante menos luz.' },
        { _key: k(), icono: 'escudo', titulo: 'Garantía por escrito', texto: 'Seis meses de garantía en todo trabajo de reparación.' },
        { _key: k(), icono: 'hoja', titulo: 'Aire más limpio', texto: 'Limpieza profunda de filtros y conductos, clave si hay alergias en casa.' },
        { _key: k(), icono: 'reloj', titulo: 'Atención en 24 a 48 horas', texto: 'Coordinamos la visita para el día siguiente en la mayoría de los casos.' },
      ],
    },
    {
      _key: k(),
      _type: 'serviciosBloque',
      titulo: 'Nuestros servicios',
      intro: 'Trabajamos con equipos residenciales y de oficinas chicas, de cualquier marca.',
      servicios: [
        { _key: k(), icono: 'aire', nombre: 'Instalación de equipos', descripcion: 'Split, ventana o multisplit. Incluye soportes, cañería y puesta en marcha.', precioDesde: '$ 180.000' },
        { _key: k(), icono: 'herramienta', nombre: 'Mantenimiento preventivo', descripcion: 'Limpieza de filtros y serpentinas, carga de gas y revisión eléctrica.', precioDesde: '$ 45.000' },
        { _key: k(), icono: 'termometro', nombre: 'Reparación y diagnóstico', descripcion: 'No enfría, gotea, hace ruido o se apaga solo. Diagnóstico en el momento.', precioDesde: '$ 30.000' },
        { _key: k(), icono: 'ducto', nombre: 'Limpieza de conductos', descripcion: 'Ventilación completa para departamentos y oficinas.', precioDesde: '$ 120.000' },
        { _key: k(), icono: 'rayo', nombre: 'Recarga de gas refrigerante', descripcion: 'Detección de pérdidas y recarga con el refrigerante que corresponde.', precioDesde: '$ 55.000' },
        { _key: k(), icono: 'casa', nombre: 'Plan anual para hogares', descripcion: 'Dos mantenimientos al año y atención prioritaria ante fallas.', precioDesde: '$ 75.000' },
      ],
    },
    {
      _key: k(),
      _type: 'promocionesBloque',
      titulo: 'Promociones del mes',
      promos: [
        { _key: k(), destacado: '20% OFF', titulo: 'Primer mantenimiento', descripcion: 'Para clientes nuevos, en cualquier equipo residencial.' },
        { _key: k(), destacado: '2x1', titulo: 'Mantenimiento de dos equipos', descripcion: 'Pagás uno y revisamos dos en la misma visita.' },
        { _key: k(), destacado: 'Gratis', titulo: 'Diagnóstico sin cargo', descripcion: 'Si aceptás la reparación, el diagnóstico no se cobra.' },
      ],
    },
    {
      _key: k(),
      _type: 'antesDespuesBloque',
      titulo: 'Trabajos realizados',
      pares: [
        { _key: k(), descripcion: 'Limpieza profunda de split en departamento de Palermo.' },
        { _key: k(), descripcion: 'Instalación de equipo multisplit en oficina de Belgrano.' },
      ],
    },
    {
      _key: k(),
      _type: 'confianzaBloque',
      titulo: 'Trabajo respaldado',
      items: [
        { _key: k(), valor: '12 años', etiqueta: 'En el rubro' },
        { _key: k(), valor: '+2.500', etiqueta: 'Equipos atendidos' },
        { _key: k(), valor: '6 meses', etiqueta: 'De garantía' },
        { _key: k(), valor: '4.8/5', etiqueta: 'Promedio de reseñas' },
      ],
    },
    {
      _key: k(),
      _type: 'coberturaBloque',
      titulo: 'Zonas donde atendemos',
      texto: 'Cubrimos CABA y zona norte del Gran Buenos Aires. Sin cargo de traslado en los barrios de la lista.',
      distritos: ['Palermo', 'Belgrano', 'Recoleta', 'Caballito', 'Núñez', 'Villa Urquiza', 'Almagro', 'Colegiales', 'Villa Devoto', 'Vicente López', 'Olivos', 'San Isidro'],
      notaFueraDeZona: '¿No ves tu barrio? Escribinos igual, evaluamos cada caso.',
    },
    {
      _key: k(),
      _type: 'testimoniosBloque',
      titulo: 'Lo que dicen nuestros clientes',
      testimonios: [
        { _key: k(), nombre: 'Carla M.', distrito: 'Caballito', estrellas: 5, texto: 'Vinieron al día siguiente. El técnico explicó todo antes de tocar nada y el equipo quedó como nuevo.' },
        { _key: k(), nombre: 'Jorge R.', distrito: 'Belgrano', estrellas: 5, texto: 'Instalaron dos equipos en la oficina en una mañana. Prolijos y sin dejar desorden.' },
        { _key: k(), nombre: 'Patricia L.', distrito: 'Vicente López', estrellas: 5, texto: 'Pedí la visita por la web un domingo y el lunes temprano ya me habían escrito por WhatsApp.' },
      ],
    },
    {
      _key: k(),
      _type: 'faqBloque',
      titulo: 'Preguntas frecuentes',
      preguntas: [
        { _key: k(), pregunta: '¿Cuánto cuesta la visita?', respuesta: 'El diagnóstico cuesta $ 30.000 y se descuenta del total si aceptás la reparación. El mantenimiento preventivo tiene precio cerrado desde $ 45.000.' },
        { _key: k(), pregunta: '¿Cada cuánto conviene hacer mantenimiento?', respuesta: 'Dos veces al año en uso residencial. En oficinas, o si el equipo trabaja muchas horas por día, cada cuatro meses.' },
        { _key: k(), pregunta: '¿Trabajan con todas las marcas?', respuesta: 'Sí. Atendemos equipos de cualquier marca, tanto en garantía como fuera de ella.' },
        { _key: k(), pregunta: '¿Cuánto demora una instalación?', respuesta: 'Un split estándar toma entre 3 y 4 horas. Un multisplit puede llevar todo el día.' },
        { _key: k(), pregunta: '¿Qué garantía tienen los trabajos?', respuesta: 'Seis meses en mano de obra de reparación y un año en instalaciones. Los repuestos mantienen la garantía del fabricante.' },
        { _key: k(), pregunta: '¿Cómo puedo pagar?', respuesta: 'Aceptamos efectivo, transferencia, Mercado Pago y tarjeta de débito o crédito.' },
      ],
    },
    {
      _key: k(),
      _type: 'agendarBloque',
      titulo: 'Agendá tu visita técnica',
      texto: 'Elegí el día y la franja que te queda cómoda. Confirmamos la hora exacta por WhatsApp.',
      mensajeExito: 'Recibimos tu solicitud. Te escribimos por WhatsApp dentro de las próximas horas para confirmar el horario.',
    },
    {
      _key: k(),
      _type: 'ctaBloque',
      titulo: '¿Tu equipo dejó de enfriar?',
      texto: 'No esperes a que el problema crezca. Escribinos y coordinamos una visita para esta semana.',
      textoBoton: 'Agendar visita',
    },
  ],
};

const main = async () => {
  await cliente.createOrReplace(ajustes);
  console.log('  Ajustes del negocio cargados');

  await cliente.createOrReplace(pagina);
  console.log('  Página de inicio cargada con 11 secciones');

  console.log('\nListo. Corré `npm run dev` y abrí http://localhost:4321\n');
};

main().catch((error) => {
  console.error('\nFalló la carga:', error.message, '\n');
  process.exit(1);
});
