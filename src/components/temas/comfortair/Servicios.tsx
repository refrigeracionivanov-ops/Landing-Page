import { urlImagen } from '../../../sanity/imagen';
import type { ServiciosBloque } from '../../../tipos';

interface Props {
  bloque: ServiciosBloque;
}

export default function Servicios({ bloque }: Props) {
  return (
    <section id="ca-servicios" className="bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">

        {/* Encabezado */}
        {(bloque.titulo || bloque.intro) && (
          <div className="mb-12">
            {bloque.titulo && (
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{bloque.titulo}</h2>
            )}
            {bloque.intro && (
              <p className="mt-3 text-slate-500 text-lg max-w-xl">{bloque.intro}</p>
            )}
          </div>
        )}

        {/* Grid de servicios */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bloque.servicios?.map((servicio) => (
            <article key={servicio._key} className="group relative overflow-hidden rounded-2xl bg-slate-800 min-h-[340px] flex flex-col justify-end">

              {/* Fondo de foto / color */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900" aria-hidden="true" />

              {/* Badge de tipo de servicio */}
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Servicio
                </span>
              </div>

              {/* Overlay con degradado inferior */}
              <div
                className="absolute inset-0 ca-servicio-overlay z-10"
                aria-hidden="true"
              />

              {/* Contenido sobre la foto */}
              <div className="relative z-20 p-6">
                <h3 className="text-white font-bold text-xl leading-snug">{servicio.nombre}</h3>
                {servicio.descripcion && (
                  <p className="mt-2 text-white/75 text-sm leading-relaxed line-clamp-2">{servicio.descripcion}</p>
                )}
                {servicio.precioDesde && (
                  <p className="mt-2 text-blue-300 text-sm font-medium">Desde {servicio.precioDesde}</p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <a href="#ca-agendar" className="ca-boton inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                    Agendar
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                  <a href={`tel:${servicio._key}`} className="ca-boton inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg border border-white/20">
                    Llamar
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
