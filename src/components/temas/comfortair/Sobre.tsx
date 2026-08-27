import { urlImagen } from '../../../sanity/imagen';
import type { PasosBloque } from '../../../tipos';

interface Props {
  bloque: PasosBloque;
}

export default function Sobre({ bloque }: Props) {
  if (!bloque.pasos?.length) return null;

  return (
    <section id="ca-sobre" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 space-y-24">
        {bloque.pasos.map((paso, idx) => {
          const esImpar = idx % 2 === 0;
          const num = String(idx + 1).padStart(2, '0');

          return (
            <div
              key={paso._key ?? idx}
              className={`grid lg:grid-cols-2 items-center gap-12 lg:gap-20 ${esImpar ? '' : 'lg:[direction:rtl]'}`}
            >
              {/* Texto */}
              <div className="lg:[direction:ltr]">
                <span className="text-blue-600 font-bold text-sm tracking-widest uppercase">{num}</span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                  {paso.titulo}
                </h2>
                {paso.texto && (
                  <p className="mt-5 text-slate-500 text-lg leading-relaxed text-pretty">{paso.texto}</p>
                )}
              </div>

              {/* Imagen o placeholder */}
              <div className="lg:[direction:ltr] relative">
                <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-[4/3]">
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-200 flex items-center justify-center">
                    <svg className="size-16 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="4" width="20" height="9" rx="2"/>
                      <path d="M6 17c0 1.5 1 2 2 2M12 17c0 2 1.5 3 3 3M18 17c0 1.5-1 2-2 2"/>
                    </svg>
                  </div>
                </div>
                {/* Ícono de acento en la esquina */}
                <div className="absolute -bottom-4 -right-4 size-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                  <svg className="size-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M13 2 4 14h7l-1 8 9-12h-7z"/>
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
