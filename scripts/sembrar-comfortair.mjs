/**
 * Carga el contenido inicial de la página ComfortAir en Sanity.
 *
 *   npm run sembrar-comfortair
 *
 * Refleja el prototipo de referencia (ComfortAir Co.) con texto en español.
 * Las imágenes no se suben aquí; se cargan desde /administrador-comfortair.
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
  return () => `ca${++n}`;
})();

const pagina = {
  _id: 'pagina-comfortair',
  _type: 'pagina',
  titulo: 'ComfortAir',
  slug: { _type: 'slug', current: 'comfortair' },
  seo: {
    titulo: 'Instalación y mantenimiento de ventilación — Servicio profesional',
    descripcion:
      'Sistemas de ventilación residencial y comercial. Ingenieros certificados, garantía por escrito y visita confirmada el mismo día.',
  },
  secciones: [
    // ── Hero ─────────────────────────────────────────────────────────
    {
      _key: k(),
      _type: 'heroBloque',
      titular: 'Respirá aire más limpio y viví con mayor confort',
      subtitulo:
        'Ayudamos a las familias a respirar aire sano y seguro con servicios de ventilación expertos, diseñados para cada hogar.',
      textoBotonAgendar: 'Reservar servicio',
      mostrarBotonWhatsapp: true,
    },

    // ── Estadísticas (casas) ──────────────────────────────────────────
    {
      _key: k(),
      _type: 'beneficiosBloque',
      titulo: '¿Por qué elegirnos?',
      items: [
        { _key: k(), icono: 'estrella',    titulo: '+15 años de experiencia en el rubro' },
        { _key: k(), icono: 'aire',        titulo: '8.000+ sistemas de confort instalados' },
        { _key: k(), icono: 'escudo',      titulo: 'Ingenieros certificados y acreditados' },
        { _key: k(), icono: 'casa',        titulo: 'Servicio con cobertura de seguro total' },
      ],
    },

    // ── Servicios ─────────────────────────────────────────────────────
    {
      _key: k(),
      _type: 'serviciosBloque',
      titulo: 'Nuestras soluciones de confort',
      intro: 'Diseñamos e instalamos sistemas adaptados a cada espacio residencial y comercial.',
      servicios: [
        {
          _key: k(),
          icono: 'ducto',
          nombre: 'Instalación de ventilación',
          descripcion:
            'Nuestros ingenieros instalan sistemas de ventilación superiores que equilibran el flujo de aire, reducen la humedad y crean ambientes interiores más saludables.',
        },
        {
          _key: k(),
          icono: 'herramienta',
          nombre: 'Servicio y mantenimiento',
          descripcion:
            'Mantenemos tu sistema funcionando con eficiencia máxima mediante inspecciones profesionales, limpieza, mantenimiento y optimización periódica.',
        },
        {
          _key: k(),
          icono: 'hoja',
          nombre: 'Consultoría de calidad del aire',
          descripcion:
            'Nuestros asesores ayudan a cada propietario a elegir la solución de ventilación ideal para un hogar más saludable y cómodo todo el año.',
        },
      ],
    },

    // ── Pasos (secciones alternadas imagen + texto) ───────────────────
    {
      _key: k(),
      _type: 'pasosBloque',
      titulo: 'Cómo lo hacemos',
      intro: 'Cada instalación sigue un proceso probado para garantizar resultados duraderos.',
      pasos: [
        {
          _key: k(),
          titulo: 'Aire fresco para cada hogar',
          texto:
            'Cada hogar merece aire limpio y ventilación confiable. Nuestros sistemas eliminan el aire viciado y los contaminantes interiores que afectan el bienestar diario. Ya sea que estés renovando o instalando por primera vez, nuestras soluciones mejoran la eficiencia energética y crean un ambiente más saludable para toda la familia.',
        },
        {
          _key: k(),
          titulo: 'Sistemas de ventilación eficientes',
          texto:
            'Nuestros sistemas están diseñados para entregar aire filtrado y fresco mientras reducen la pérdida de calor innecesaria. Al mantener un flujo de aire equilibrado y mejorar la calidad del aire interior, generan un entorno de vida más saludable y cómodo. Cada sistema está seleccionado para brindar un rendimiento confiable a largo plazo, menor consumo energético y confort durante todo el año.',
        },
        {
          _key: k(),
          titulo: 'Puesta en marcha completa del sistema',
          texto:
            'Antes de que tu sistema entre en uso, realizamos un proceso de puesta en marcha exhaustivo para asegurar que todo funcione exactamente como fue diseñado. Nuestros ingenieros verifican todos los componentes y ajustes, confirman los estándares de rendimiento correctos y te entregan documentación completa del sistema instalado.',
        },
      ],
    },

    // ── Testimonios ───────────────────────────────────────────────────
    {
      _key: k(),
      _type: 'testimoniosBloque',
      titulo: 'Lo que dicen nuestros clientes',
      testimonios: [
        {
          _key: k(),
          nombre: 'Sarah Mitchell',
          distrito: 'Palermo',
          estrellas: 5,
          texto:
            'No podríamos estar más contentos con el servicio. Los ingenieros fueron amables, profesionales y dejaron todo limpio después de la instalación. El nuevo sistema de ventilación funciona silenciosamente y ha marcado una diferencia real en nuestro hogar.',
        },
        {
          _key: k(),
          nombre: 'James Wilson',
          distrito: 'Belgrano',
          estrellas: 5,
          texto:
            'Excelente experiencia desde la primera consulta hasta la instalación final. El equipo fue competente, confiable y cumplió exactamente lo que prometió. Recomendaríamos a ComfortAir sin dudarlo a cualquiera que busque trabajo de ventilación de calidad.',
        },
        {
          _key: k(),
          nombre: 'Daniel Carter',
          distrito: 'Recoleta',
          estrellas: 5,
          texto:
            'ComfortAir hizo que todo el proceso fuera simple de principio a fin. El equipo llegó a tiempo, explicó todo claramente y completó la instalación con un estándar muy alto. Nuestro hogar se siente notablemente más fresco y con mejor aire.',
        },
      ],
    },

    // ── Video ─────────────────────────────────────────────────────────
    {
      _key: k(),
      _type: 'videoBloque',
      titulo: 'Miranos en acción',
      url: '',
    },

    // ── Confianza (cifras + logos) ────────────────────────────────────
    {
      _key: k(),
      _type: 'confianzaBloque',
      titulo: 'Productos confiables. Instalación experta. Confort duradero.',
      items: [
        { _key: k(), valor: '+15 años', etiqueta: 'De experiencia en el rubro' },
        { _key: k(), valor: '8.000+',   etiqueta: 'Sistemas instalados' },
        { _key: k(), valor: '5.0 ★',    etiqueta: 'Puntuación en Google' },
        { _key: k(), valor: '33',        etiqueta: 'Reseñas verificadas' },
      ],
    },

    // ── FAQ ───────────────────────────────────────────────────────────
    {
      _key: k(),
      _type: 'faqBloque',
      titulo: 'Preguntas frecuentes',
      preguntas: [
        {
          _key: k(),
          pregunta: '¿Cuánto demora una instalación de ventilación?',
          respuesta:
            'La mayoría de las instalaciones se completan en un día. Los sistemas más grandes pueden llevar más tiempo según el tamaño y la complejidad del espacio.',
        },
        {
          _key: k(),
          pregunta: '¿Ofrecen garantía en sus trabajos?',
          respuesta:
            'Sí. Todas nuestras instalaciones incluyen garantía de fábrica del fabricante más nuestra propia garantía de 12 meses en mano de obra.',
        },
        {
          _key: k(),
          pregunta: '¿Dejan la casa limpia después de la instalación?',
          respuesta:
            'Sin excepción. Nuestros ingenieros limpian todo al terminar y dejan tu hogar exactamente como lo encontraron.',
        },
        {
          _key: k(),
          pregunta: '¿Con qué frecuencia conviene hacerle servicio al sistema?',
          respuesta:
            'Recomendamos servicio anual para mantener el sistema funcionando con eficiencia y detectar cualquier problema a tiempo.',
        },
        {
          _key: k(),
          pregunta: '¿Trabajan en propiedades comerciales?',
          respuesta:
            'Sí. Trabajamos en propiedades residenciales y comerciales de todos los tamaños, desde departamentos hasta grandes oficinas.',
        },
        {
          _key: k(),
          pregunta: '¿Cómo puedo agendar una visita?',
          respuesta:
            'Podés agendar desde el formulario de esta página o escribirnos por WhatsApp. Confirmamos el horario en menos de 2 horas.',
        },
      ],
    },

    // ── Formulario de agendamiento ────────────────────────────────────
    {
      _key: k(),
      _type: 'agendarBloque',
      titulo: 'Reservá tu consulta técnica',
      texto:
        'Elegí el día y el horario que más te convenga. Confirmamos tu turno por WhatsApp en menos de 2 horas.',
      mensajeExito:
        'Recibimos tu solicitud. Te escribimos por WhatsApp en breve para confirmar el horario exacto.',
    },

    // ── CTA final ─────────────────────────────────────────────────────
    {
      _key: k(),
      _type: 'ctaBloque',
      titulo: '¿Listo para respirar aire más limpio y fresco?',
      texto:
        'No esperes a que el problema crezca. Contactanos hoy y coordinamos una visita para esta semana.',
      textoBoton: 'Reservar servicio',
    },
  ],
};

const main = async () => {
  await cliente.createOrReplace(pagina);
  console.log(`\n  ✓ Página ComfortAir cargada con ${pagina.secciones.length} secciones`);
  console.log('  Abrí /administrador-comfortair para agregar las imágenes\n');
};

main().catch((error) => {
  console.error('\nFalló la carga:', error.message, '\n');
  process.exit(1);
});
