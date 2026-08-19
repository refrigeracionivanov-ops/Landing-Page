import type { PromocionesBloque } from '../../tipos';

interface Props {
  bloque: PromocionesBloque;
}

const formatearFecha = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });

export default function Promociones({ bloque }: Props) {
  // Si todas las promos vencieron, la consulta devuelve una lista vacia y la seccion no se dibuja.
  if (!bloque.promos || bloque.promos.length === 0) return null;

  return (
    <section className="seccion">
      <div className="contenedor">
        {bloque.titulo && <h2 className="titulo-seccion max-w-2xl text-tinta">{bloque.titulo}</h2>}

        {/* `feature-card-elevated`: mismo cuadrado, sobre gris en vez de blanco.
            Es asi como Carbon destaca una tarjeta, no con borde de color. */}
        <div className="mt-12 grid gap-px border border-superficie-2 bg-superficie-2 md:grid-cols-3">
          {bloque.promos.map((promo) => (
            <article key={promo._key} className="flex flex-col bg-superficie p-8">
              {/* En carbon el azul es solo para CTA, enlaces y foco. Una cifra
                  destacada en azul seria deriva de marca: va en tinta. */}
              <p className="display-lg text-tinta">{promo.destacado}</p>
              <h3 className="titulo-tarjeta mt-4 text-tinta">{promo.titulo}</h3>
              {promo.descripcion && <p className="cuerpo-sm mt-3 grow text-tinta-media">{promo.descripcion}</p>}
              {promo.vigenciaHasta && (
                <p className="leyenda mt-6 text-tinta-media">Valido hasta el {formatearFecha(promo.vigenciaHasta)}</p>
              )}
              <a href="#agendar" className="boton boton-primario mt-4 self-start">
                Quiero esta promo
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
