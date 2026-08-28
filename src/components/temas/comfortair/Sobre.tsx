import { urlImagen } from '../../../sanity/imagen';
import type { PasosBloque } from '../../../tipos';

interface Props {
  bloque: PasosBloque;
}

export default function Sobre({ bloque }: Props) {
  if (!bloque.pasos?.length) return null;

  return (
    <section id="ca-sobre" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 space-y-14">
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
              <div className="lg:[direction:ltr]">
                <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-[4/3]">
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-200" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
