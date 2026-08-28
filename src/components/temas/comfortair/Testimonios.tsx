import { urlImagen } from '../../../sanity/imagen';
import type { TestimoniosBloque } from '../../../tipos';

interface Props {
  bloque: TestimoniosBloque;
}

function Estrellas({ n = 5 }: { n?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${n} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`size-4 ${i < n ? 'text-yellow-400' : 'text-slate-200'}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z"/>
        </svg>
      ))}
    </div>
  );
}

export default function Testimonios({ bloque }: Props) {
  return (
    <section id="ca-testimonios" className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">

        {/* Encabezado */}
        <div className="text-center mb-12">
          {bloque.titulo && (
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{bloque.titulo}</h2>
          )}
          {/* Calificación Google */}
          <div className="mt-4 inline-flex items-center gap-2 text-slate-500 text-sm">
            {/* Ícono G de Google */}
            <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-label="Google" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Calificación Google: <strong className="text-slate-900">5.0</strong> basada en más de 30 reseñas</span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {bloque.testimonios?.map((t) => (
            <figure key={t._key} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">

              {/* Google G */}
              <div className="flex items-center justify-between mb-4">
                <Estrellas n={t.estrellas ?? 5} />
                <svg className="size-5 opacity-40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>

              <blockquote className="grow text-slate-600 text-sm leading-relaxed text-pretty">
                "{t.texto}"
              </blockquote>

              <figcaption className="mt-5 flex items-center gap-3 pt-4 border-t border-slate-100">
                {t.foto?.asset ? (
                  <img
                    src={urlImagen(t.foto).width(80).height(80).fit('crop').url()}
                    alt=""
                    className="size-10 rounded-full object-cover shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-sm">
                      {t.nombre?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-slate-900 font-semibold text-sm">{t.nombre}</p>
                  {t.distrito && <p className="text-slate-400 text-xs">{t.distrito}</p>}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
