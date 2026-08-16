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
    <section className="border-b border-filete bg-lienzo">
      <div className="contenedor grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
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
        </div>

        {foto && (
          <div className="bg-superficie">
            <img
              src={foto}
              alt={bloque.imagen?.alt ?? ''}
              className="aspect-4/3 w-full object-cover"
              fetchPriority="high"
            />
          </div>
        )}
      </div>
    </section>
  );
}
