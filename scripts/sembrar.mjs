/**
 * Carga contenido de ejemplo en Sanity para poder ver el sitio funcionando.
 *
 *   npm run sembrar
 *
 * Los textos son genericos a proposito: sirven de plantilla para reemplazar
 * desde /admin. No sube imagenes; esas se cargan desde el panel.
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
  telefono: '+51 999 888 777',
  whatsapp: '51999888777',
  mensajeWhatsapp: 'Hola, quiero consultar por un servicio de ventilacion.',
  email: 'contacto@airecontrol.pe',
  direccion: 'Av. Principal 1234, Lima',
  horario: 'Lunes a sabado, 8:00 a 18:00',
  mostrarBarraContacto: true,
  diasAnticipacion: 1,
  franjas: [
    { _key: k(), etiqueta: 'Manana (8:00 - 12:00)', cupo: 3 },
    { _key: k(), etiqueta: 'Tarde (13:00 - 18:00)', cupo: 3 },
  ],
};

const pagina = {
  _id: 'pagina-inicio',
  _type: 'pagina',
  titulo: 'Inicio',
  slug: { _type: 'slug', current: 'inicio' },
  seo: {
    titulo: 'AireControl — Aire acondicionado y ventilacion en Lima',
    descripcion:
      'Instalacion, mantenimiento y reparacion de aire acondicionado en Lima. Tecnicos certificados, garantia por escrito y visita agendada online.',
  },
  secciones: [
    {
      _key: k(),
      _type: 'heroBloque',
      titular: 'Tu aire acondicionado, funcionando como el primer dia',
      subtitulo:
        'Instalacion, mantenimiento y reparacion con tecnicos certificados. Agenda tu visita online y confirmamos por WhatsApp el mismo dia.',
      textoBotonAgendar: 'Agendar visita',
      mostrarBotonWhatsapp: true,
    },
    {
      _key: k(),
      _type: 'beneficiosBloque',
      titulo: '¿Por que elegirnos?',
      items: [
        { _key: k(), icono: 'moneda', titulo: 'Hasta 30% menos de consumo', texto: 'Un equipo limpio y bien calibrado gasta bastante menos luz.' },
        { _key: k(), icono: 'escudo', titulo: 'Garantia por escrito', texto: 'Seis meses de garantia en todo trabajo de reparacion.' },
        { _key: k(), icono: 'hoja', titulo: 'Aire mas limpio', texto: 'Limpieza profunda de filtros y ductos, clave si hay alergias en casa.' },
        { _key: k(), icono: 'reloj', titulo: 'Atencion en 24 a 48 horas', texto: 'Coordinamos la visita para el dia siguiente en la mayoria de casos.' },
      ],
    },
    {
      _key: k(),
      _type: 'serviciosBloque',
      titulo: 'Nuestros servicios',
      intro: 'Trabajamos con equipos residenciales y de oficinas pequenas, de cualquier marca.',
      servicios: [
        { _key: k(), icono: 'aire', nombre: 'Instalacion de equipos', descripcion: 'Split, ventana o multisplit. Incluye soportes, tuberia y puesta en marcha.', precioDesde: 'S/ 250' },
        { _key: k(), icono: 'herramienta', nombre: 'Mantenimiento preventivo', descripcion: 'Limpieza de filtros y serpentines, carga de gas y revision electrica.', precioDesde: 'S/ 120' },
        { _key: k(), icono: 'termometro', nombre: 'Reparacion y diagnostico', descripcion: 'No enfria, gotea, hace ruido o se apaga solo. Diagnostico en el momento.', precioDesde: 'S/ 90' },
        { _key: k(), icono: 'ducto', nombre: 'Limpieza de ductos', descripcion: 'Ventilacion completa para departamentos y oficinas.', precioDesde: 'S/ 350' },
        { _key: k(), icono: 'rayo', nombre: 'Recarga de gas refrigerante', descripcion: 'Deteccion de fugas y recarga con el refrigerante que corresponde.', precioDesde: 'S/ 150' },
        { _key: k(), icono: 'casa', nombre: 'Plan anual para hogares', descripcion: 'Dos mantenimientos al ano y atencion prioritaria ante fallas.', precioDesde: 'S/ 200' },
      ],
    },
    {
      _key: k(),
      _type: 'promocionesBloque',
      titulo: 'Promociones del mes',
      promos: [
        { _key: k(), destacado: '20% OFF', titulo: 'Primer mantenimiento', descripcion: 'Para clientes nuevos, en cualquier equipo residencial.' },
        { _key: k(), destacado: '2x1', titulo: 'Mantenimiento de dos equipos', descripcion: 'Pagas uno y revisamos dos en la misma visita.' },
        { _key: k(), destacado: 'Gratis', titulo: 'Diagnostico sin costo', descripcion: 'Si aceptas la reparacion, el diagnostico no se cobra.' },
      ],
    },
    {
      _key: k(),
      _type: 'antesDespuesBloque',
      titulo: 'Trabajos realizados',
      pares: [
        { _key: k(), descripcion: 'Limpieza profunda de split en departamento de Miraflores.' },
        { _key: k(), descripcion: 'Instalacion de equipo multisplit en oficina de San Isidro.' },
      ],
    },
    {
      _key: k(),
      _type: 'confianzaBloque',
      titulo: 'Trabajo respaldado',
      items: [
        { _key: k(), valor: '12 anos', etiqueta: 'En el rubro' },
        { _key: k(), valor: '+2.500', etiqueta: 'Equipos atendidos' },
        { _key: k(), valor: '6 meses', etiqueta: 'De garantia' },
        { _key: k(), valor: '4.8/5', etiqueta: 'Promedio de resenas' },
      ],
    },
    {
      _key: k(),
      _type: 'coberturaBloque',
      titulo: 'Zonas donde atendemos',
      texto: 'Cubrimos Lima Metropolitana. Sin cargo de movilidad en los distritos de la lista.',
      distritos: ['Miraflores', 'San Isidro', 'Surco', 'La Molina', 'San Borja', 'Barranco', 'Jesus Maria', 'Magdalena', 'Lince', 'Pueblo Libre', 'San Miguel', 'Chorrillos'],
      notaFueraDeZona: '¿No ves tu distrito? Escribinos igual, evaluamos cada caso.',
    },
    {
      _key: k(),
      _type: 'testimoniosBloque',
      titulo: 'Lo que dicen nuestros clientes',
      testimonios: [
        { _key: k(), nombre: 'Carla M.', distrito: 'Surco', estrellas: 5, texto: 'Vinieron al dia siguiente. El tecnico explico todo antes de tocar nada y el equipo quedo como nuevo.' },
        { _key: k(), nombre: 'Jorge R.', distrito: 'San Isidro', estrellas: 5, texto: 'Instalaron dos equipos en la oficina en una manana. Prolijos y sin dejar desorden.' },
        { _key: k(), nombre: 'Patricia L.', distrito: 'La Molina', estrellas: 5, texto: 'Pedi la visita por la web un domingo y el lunes temprano ya me habian escrito por WhatsApp.' },
      ],
    },
    {
      _key: k(),
      _type: 'faqBloque',
      titulo: 'Preguntas frecuentes',
      preguntas: [
        { _key: k(), pregunta: '¿Cuanto cuesta la visita?', respuesta: 'El diagnostico cuesta S/ 90 y se descuenta del total si aceptas la reparacion. El mantenimiento preventivo tiene precio cerrado desde S/ 120.' },
        { _key: k(), pregunta: '¿Cada cuanto conviene hacer mantenimiento?', respuesta: 'Dos veces al ano en uso residencial. En oficinas o si el equipo trabaja muchas horas por dia, cada cuatro meses.' },
        { _key: k(), pregunta: '¿Trabajan con todas las marcas?', respuesta: 'Si. Atendemos equipos de cualquier marca, tanto en garantia como fuera de ella.' },
        { _key: k(), pregunta: '¿Cuanto demora una instalacion?', respuesta: 'Un split estandar toma entre 3 y 4 horas. Un multisplit puede llevar todo el dia.' },
        { _key: k(), pregunta: '¿Que garantia tienen los trabajos?', respuesta: 'Seis meses en mano de obra de reparacion y un ano en instalaciones. Los repuestos mantienen la garantia del fabricante.' },
        { _key: k(), pregunta: '¿Puedo pagar con tarjeta?', respuesta: 'Si, aceptamos tarjeta, transferencia, Yape y efectivo.' },
      ],
    },
    {
      _key: k(),
      _type: 'agendarBloque',
      titulo: 'Agenda tu visita tecnica',
      texto: 'Elegi el dia y la franja que te queda comodo. Confirmamos la hora exacta por WhatsApp.',
      mensajeExito: 'Recibimos tu solicitud. Te escribimos por WhatsApp dentro de las proximas horas para confirmar el horario.',
    },
    {
      _key: k(),
      _type: 'ctaBloque',
      titulo: '¿Tu equipo dejo de enfriar?',
      texto: 'No esperes a que el problema crezca. Escribinos y coordinamos una visita para esta semana.',
      textoBoton: 'Agendar visita',
    },
  ],
};

const main = async () => {
  await cliente.createOrReplace(ajustes);
  console.log('  Ajustes del negocio cargados');

  await cliente.createOrReplace(pagina);
  console.log('  Pagina de inicio cargada con 11 secciones');

  console.log('\nListo. Corre `npm run dev` y abri http://localhost:4321\n');
};

main().catch((error) => {
  console.error('\nFallo la carga:', error.message, '\n');
  process.exit(1);
});
