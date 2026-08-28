import type { CtaBloque, Ajustes } from '../../../tipos';

interface Props {
  bloque: CtaBloque;
  ajustes: Ajustes;
}

export default function Cta({ bloque, ajustes }: Props) {
  const tel = ajustes.telefono.replace(/\s/g, '');
  return (
    <section className="bg-slate-900 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 grid lg:grid-cols-2 gap-8 items-end">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug text-balance">
            {bloque.titulo}
          </h2>
          {bloque.texto && (
            <p className="mt-4 text-white/70 text-lg leading-relaxed max-w-xl text-pretty">{bloque.texto}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 lg:justify-end">
          <a href="#ca-agendar" className="ca-boton inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-lg">
            {bloque.textoBoton ?? 'Agendar visita'}
          </a>
          <a href={`tel:${tel}`} className="ca-boton inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-semibold px-7 py-3.5 rounded-lg">
            Llamar {ajustes.telefono}
          </a>
        </div>
      </div>
    </section>
  );
}
