import { urlImagen } from '../../sanity/imagen';
import type { AntesDespuesBloque } from '../../tipos';

interface Props {
  bloque: AntesDespuesBloque;
}

const foto = (imagen: NonNullable<AntesDespuesBloque['pares']>[number]['antes']) =>
  imagen?.asset ? urlImagen(imagen).width(700).height(500).fit('crop').quality(70).url() : null;

export default function AntesDespues({ bloque }: Props) {
  return (
    <section className="banda seccion">
      <div className="contenedor">
        {bloque.titulo && <h2 className="titulo-seccion max-w-2xl text-tinta">{bloque.titulo}</h2>}

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          {bloque.pares?.map((par) => (
            <figure key={par._key}>
              {/* Marcos planos, sin esquinas redondeadas: las imagenes siguen la
                  misma geometria que el resto del sistema. */}
              <div className="grid grid-cols-2 gap-px bg-superficie-2">
                {[
                  { etiqueta: 'Antes', imagen: par.antes },
                  { etiqueta: 'Despues', imagen: par.despues },
                ].map(({ etiqueta, imagen }) => (
                  <div key={etiqueta} className="relative bg-lienzo">
                    {foto(imagen) && (
                      <img
                        src={foto(imagen)!}
                        alt={imagen?.alt ?? `${etiqueta}: ${par.descripcion ?? ''}`}
                        className="aspect-4/3 w-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <span className="leyenda absolute left-0 top-0 bg-tinta px-2 py-1 font-semibold text-white">
                      {etiqueta}
                    </span>
                  </div>
                ))}
              </div>
              {par.descripcion && <figcaption className="cuerpo-sm mt-4 text-tinta-media">{par.descripcion}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
