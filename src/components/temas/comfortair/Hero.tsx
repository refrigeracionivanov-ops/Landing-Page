import { urlImagen } from '../../../sanity/imagen';
import type { HeroBloque, Ajustes } from '../../../tipos';

interface Props {
  bloque: HeroBloque;
  ajustes: Ajustes;
}

export default function Hero({ bloque, ajustes }: Props) {
  const foto = bloque.imagen?.asset ? urlImagen(bloque.imagen).width(1440).quality(80).url() : null;
  const wa = `https://wa.me/${ajustes.whatsapp}?text=${encodeURIComponent(ajustes.mensajeWhatsapp ?? '')}`;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950">

      {/* Imagen de fondo */}
      {foto && (
        <img
          src={foto}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
        />
      )}

      {/* Overlay con gradiente */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(105deg, rgba(7,12,26,0.84) 38%, rgba(7,12,26,0.42) 100%)' }}
        aria-hidden="true"
      />

      {/* Contenido */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 py-24 w-full">

        <h1 className="text-white font-bold text-4xl sm:text-5xl lg:text-[4.25rem] leading-[1.08] tracking-tight max-w-2xl text-balance">
          {bloque.titular}
        </h1>

        {bloque.subtitulo && (
          <p className="mt-6 text-white/80 text-lg max-w-xl leading-relaxed text-pretty">
            {bloque.subtitulo}
          </p>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <a href="#ca-agendar" className="ca-boton inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-semibold px-7 py-3.5 rounded-lg text-base">
            {bloque.textoBotonAgendar ?? 'Agendar visita'}
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>

          {bloque.mostrarBotonWhatsapp !== false && (
            <a href={wa} target="_blank" rel="noopener" className="ca-boton inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-7 py-3.5 rounded-lg text-base">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.557 4.116 1.528 5.843L.057 23.25a.75.75 0 0 0 .921.921l5.407-1.471A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 0 1-4.989-1.374l-.356-.213-3.692 1.004 1.004-3.692-.213-.356A9.71 9.71 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
              </svg>
              WhatsApp
            </a>
          )}
        </div>

        {ajustes.horario && (
          <p className="mt-6 text-white/60 text-sm">{ajustes.horario}</p>
        )}
      </div>
    </section>
  );
}
