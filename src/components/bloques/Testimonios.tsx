import { urlImagen } from '../../sanity/imagen';
import type { TestimoniosBloque } from '../../tipos';

interface Props {
  bloque: TestimoniosBloque;
}

export default function Testimonios({ bloque }: Props) {
  return (
    <section id="testimonios" className="seccion">
      <div className="contenedor">
        {bloque.titulo && <h2 className="titulo-seccion max-w-2xl text-tinta">{bloque.titulo}</h2>}

        <div className="mt-12 grid gap-px border border-filete bg-filete md:grid-cols-3">
          {bloque.testimonios?.map((testimonio) => (
            <figure key={testimonio._key} className="flex flex-col bg-lienzo p-6">
              <div className="flex gap-1 text-azul" aria-label={`${testimonio.estrellas ?? 5} de 5 estrellas`}>
                {Array.from({ length: testimonio.estrellas ?? 5 }).map((_, i) => (
                  <svg key={i} className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z" />
                  </svg>
                ))}
              </div>

              <blockquote className="mt-5 grow text-tinta text-pretty">{testimonio.texto}</blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-filete pt-4">
                {testimonio.foto?.asset && (
                  <img
                    src={urlImagen(testimonio.foto).width(80).height(80).fit('crop').url()}
                    alt=""
                    className="size-10 object-cover"
                    loading="lazy"
                  />
                )}
                <div>
                  <p className="cuerpo-sm font-semibold text-tinta">{testimonio.nombre}</p>
                  {testimonio.distrito && <p className="leyenda text-tinta-media">{testimonio.distrito}</p>}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
