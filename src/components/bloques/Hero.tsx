import { urlImagen } from '../../sanity/imagen';
import type { HeroBloque, Ajustes } from '../../tipos';

interface Props {
  bloque: HeroBloque;
  ajustes: Ajustes;
}

export default function Hero({ bloque, ajustes }: Props) {
  const foto = bloque.imagen?.asset ? urlImagen(bloque.imagen).width(1200).quality(75).url() : null;
  const enlaceWhatsapp = `https://wa.me/${ajustes.whatsapp}?text=${encodeURIComponent(ajustes.mensajeWhatsapp ?? '')}`;

  return (
    /* Carbon no oscurece el hero ni pone la foto de fondo: el titular vive sobre
       lienzo blanco y la imagen es un bloque plano al costado. */
    <section className="border-b border-filete bg-lienzo flex items-center min-h-[calc(100svh-5rem)]">
      <div className="contenedor grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16 w-full">
        <div>
          <h1 className="display-xl text-tinta text-balance">{bloque.titular}</h1>

          {bloque.subtitulo && (
            <p className="cuerpo-lg mt-6 max-w-xl text-tinta-media text-pretty">{bloque.subtitulo}</p>
          )}

          <div className="mt-10 flex flex-wrap gap-px">
            <a href="#agendar" className="boton boton-primario">
              {bloque.textoBotonAgendar ?? 'Agendar visita'}
            </a>

            {bloque.mostrarBotonWhatsapp !== false && (
              <a href={enlaceWhatsapp} target="_blank" rel="noopener" className="boton boton-whatsapp">
                Escribir por WhatsApp
              </a>
            )}
          </div>

          {ajustes.horario && <p className="cuerpo-sm mt-6 text-tinta-media">{ajustes.horario}</p>}

          {ajustes.googlePuntuacion && (
            <div className="mt-6">
              <a
                href={ajustes.googleResenas || undefined}
                target={ajustes.googleResenas ? '_blank' : undefined}
                rel="noopener"
                className="inline-flex items-center gap-2 text-tinta-media hover:text-tinta transition-colors"
              >
                <span className="text-[#fbbc04] text-sm leading-none" aria-hidden="true">★★★★★</span>
                <span className="cuerpo-sm font-semibold text-tinta">{ajustes.googlePuntuacion}</span>
                <span className="cuerpo-sm text-tinta-media">
                  {ajustes.googleCantidadResenas
                    ? `· ${ajustes.googleCantidadResenas} reseñas en Google`
                    : '· Servicio calificado en Google'}
                </span>
              </a>
            </div>
          )}
        </div>

        {foto && (
          <div className="bg-superficie self-stretch flex">
            <img
              src={foto}
              alt={bloque.imagen?.alt ?? ''}
              className="w-full object-cover"
              fetchPriority="high"
            />
          </div>
        )}
      </div>
    </section>
  );
}
