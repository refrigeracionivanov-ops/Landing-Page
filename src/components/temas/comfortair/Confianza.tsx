import { urlImagen } from '../../../sanity/imagen';
import type { ConfianzaBloque } from '../../../tipos';

interface Props {
  bloque: ConfianzaBloque;
}

export default function Confianza({ bloque }: Props) {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">

        {/* Cifras */}
        {bloque.items && bloque.items.length > 0 && (
          <>
            {bloque.titulo && (
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-12">{bloque.titulo}</h2>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {bloque.items.map((item) => (
                <div key={item._key} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <dt className="text-3xl sm:text-4xl font-bold text-blue-600 tracking-tight">{item.valor}</dt>
                  <dd className="mt-2 text-slate-500 text-sm leading-snug">{item.etiqueta}</dd>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Logos de marcas */}
        {bloque.marcas && bloque.marcas.length > 0 && (
          <>
            <p className="text-center text-slate-400 text-sm font-semibold tracking-widest uppercase mb-8">
              Productos de confianza. Instalación experta.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-6 items-center justify-items-center">
              {bloque.marcas.map((marca) => (
                <div key={marca._key} className="flex items-center justify-center">
                  <img
                    src={urlImagen(marca).height(80).url()}
                    alt={marca.alt ?? ''}
                    className="h-10 w-auto object-contain opacity-50 hover:opacity-80 transition-opacity"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <a href="#ca-agendar" className="ca-boton inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg">
                Contactar
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
