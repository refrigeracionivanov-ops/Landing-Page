/**
 * Sube fotos de plantilla a los huecos de imagen que estan vacios.
 *
 *   npm run fotos
 *
 * No son fotos: son marcadores dibujados con la paleta del sitio, para que la
 * pagina no se vea rota mientras no haya material real. Dicen lo que son, a
 * proposito — un cliente que ve un marcador entiende que falta una foto; uno
 * que ve una foto de banco de imagenes cree que asi trabaja el negocio.
 *
 * Cada uno se reemplaza desde /administrador sin tocar nada de esto.
 *
 * Solo completa lo que esta vacio: correrlo dos veces no pisa una foto real.
 */
import { createClient } from '@sanity/client';
import sharp from 'sharp';

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

const AZUL = '#0f62fe';
const TINTA = '#161616';
const TINTA_MEDIA = '#525252';
const SUPERFICIE = '#f4f4f4';
const FILETE = '#e0e0e0';

/** Un rectangulo con una linea de texto y el icono de una foto ausente. */
function marcador({ ancho, alto, titulo, detalle }) {
  const centroX = ancho / 2;
  const escala = Math.min(ancho, alto) / 500;
  const iconoY = alto / 2 - 60 * escala;
  const tamTitulo = Math.round(26 * escala);
  const tamDetalle = Math.round(18 * escala);

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}">
  <rect width="${ancho}" height="${alto}" fill="${SUPERFICIE}"/>
  <rect x="0.5" y="0.5" width="${ancho - 1}" height="${alto - 1}" fill="none" stroke="${FILETE}" stroke-width="2"/>

  <g transform="translate(${centroX} ${iconoY}) scale(${escala * 2})" stroke="${AZUL}" stroke-width="1.6" fill="none"
     stroke-linecap="round" stroke-linejoin="round">
    <rect x="-16" y="-12" width="32" height="24" rx="1"/>
    <circle cx="-7" cy="-4" r="3"/>
    <path d="M-16 7 l10 -9 l7 6 l6 -5 l9 8"/>
  </g>

  <text x="${centroX}" y="${alto / 2 + 30 * escala}" text-anchor="middle"
        font-family="IBM Plex Sans, Segoe UI, sans-serif" font-size="${tamTitulo}" font-weight="600" fill="${TINTA}">
    ${titulo}
  </text>
  <text x="${centroX}" y="${alto / 2 + 30 * escala + tamTitulo * 1.6}" text-anchor="middle"
        font-family="IBM Plex Sans, Segoe UI, sans-serif" font-size="${tamDetalle}" fill="${TINTA_MEDIA}">
    ${detalle}
  </text>
</svg>`);
}

/** El logo es el unico que no lleva icono: es una marca de texto. */
function marcadorLogo(nombre) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="160" viewBox="0 0 640 160">
  <rect width="640" height="160" fill="none"/>
  <rect x="8" y="34" width="8" height="92" fill="${AZUL}"/>
  <text x="36" y="88" font-family="IBM Plex Sans, Segoe UI, sans-serif" font-size="54" font-weight="300" fill="${TINTA}">
    ${nombre}
  </text>
  <text x="38" y="118" font-family="IBM Plex Sans, Segoe UI, sans-serif" font-size="20" fill="${TINTA_MEDIA}">
    logo de plantilla — reemplazar
  </text>
</svg>`);
}

async function subir(svg, nombreArchivo, alt) {
  const png = await sharp(svg).png().toBuffer();
  const asset = await cliente.assets.upload('image', png, { filename: nombreArchivo, contentType: 'image/png' });
  return { _type: 'image', alt, asset: { _type: 'reference', _ref: asset._id } };
}

const main = async () => {
  const ajustes = await cliente.getDocument('ajustes');
  const pagina = await cliente.getDocument('pagina-inicio');

  if (!ajustes || !pagina) {
    console.error('\nFalta el contenido en Sanity. Corre `npm run sembrar` primero.\n');
    process.exit(1);
  }

  let cambios = 0;

  // --- Logo -----------------------------------------------------------------
  if (!ajustes.logo?.asset) {
    const logo = await subir(marcadorLogo(ajustes.nombre ?? 'Tu negocio'), 'logo-plantilla.png', ajustes.nombre ?? '');
    await cliente.patch('ajustes').set({ logo }).commit();
    console.log('  Logo');
    cambios++;
  }

  const secciones = structuredClone(pagina.secciones ?? []);
  let tocoLaPagina = false;

  for (const bloque of secciones) {
    // --- Portada ------------------------------------------------------------
    if (bloque._type === 'heroBloque' && !bloque.imagen?.asset) {
      bloque.imagen = await subir(
        marcador({ ancho: 1600, alto: 1200, titulo: 'Foto de portada', detalle: 'Un equipo instalado, o el equipo trabajando' }),
        'portada-plantilla.png',
        'Foto de portada de ejemplo',
      );
      console.log('  Portada');
      tocoLaPagina = true;
    }

    // --- Antes y despues ----------------------------------------------------
    if (bloque._type === 'antesDespuesBloque') {
      for (const [i, par] of (bloque.pares ?? []).entries()) {
        if (!par.antes?.asset) {
          par.antes = await subir(
            marcador({ ancho: 1400, alto: 1050, titulo: 'Antes', detalle: 'El equipo como lo encontraste' }),
            `antes-${i + 1}-plantilla.png`,
            'Foto del antes, de ejemplo',
          );
          tocoLaPagina = true;
        }
        if (!par.despues?.asset) {
          par.despues = await subir(
            marcador({ ancho: 1400, alto: 1050, titulo: 'Después', detalle: 'El mismo equipo terminado' }),
            `despues-${i + 1}-plantilla.png`,
            'Foto del después, de ejemplo',
          );
          tocoLaPagina = true;
        }
      }
      if (tocoLaPagina) console.log(`  Trabajos realizados (${(bloque.pares ?? []).length} pares)`);
    }

    // --- Testimonios --------------------------------------------------------
    if (bloque._type === 'testimoniosBloque') {
      for (const testimonio of bloque.testimonios ?? []) {
        if (!testimonio.foto?.asset) {
          const inicial = (testimonio.nombre ?? '?').trim().charAt(0).toUpperCase();
          testimonio.foto = await subir(
            Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
              <rect width="400" height="400" fill="${SUPERFICIE}"/>
              <text x="200" y="248" text-anchor="middle" font-family="IBM Plex Sans, Segoe UI, sans-serif"
                    font-size="180" font-weight="300" fill="${AZUL}">${inicial}</text>
            </svg>`),
            `testimonio-${inicial}-plantilla.png`,
            '',
          );
          tocoLaPagina = true;
        }
      }
      console.log('  Testimonios');
    }
  }

  if (tocoLaPagina) {
    await cliente.patch('pagina-inicio').set({ secciones }).commit();
    cambios++;
  }

  console.log(
    cambios || tocoLaPagina
      ? '\nListo. Se reemplazan una por una desde /administrador.\n'
      : '\nNo habia huecos vacios: no se toco nada.\n',
  );
};

main().catch((error) => {
  console.error('\nFalló la carga:', error.message, '\n');
  process.exit(1);
});
