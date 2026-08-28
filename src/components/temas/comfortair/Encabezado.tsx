import { urlImagen } from '../../../sanity/imagen';
import type { Ajustes } from '../../../tipos';

interface Props {
  ajustes: Ajustes;
}

export default function Encabezado({ ajustes }: Props) {
  const tel = ajustes.telefono.replace(/\s/g, '');
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 flex h-16 items-center justify-between gap-6">

        {/* Logo */}
        <a href="/comfortair" className="flex items-center gap-2.5 shrink-0">
          {ajustes.logo?.asset ? (
            <img src={urlImagen(ajustes.logo).height(64).url()} alt={ajustes.nombre} className="h-8 w-auto" />
          ) : (
            <>
              <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="9" rx="2"/>
                  <path d="M6 17c0 1.5 1 2 2 2M12 17c0 2 1.5 3 3 3M18 17c0 1.5-1 2-2 2"/>
                </svg>
              </div>
              <span className="font-semibold text-white text-sm">{ajustes.nombre}</span>
            </>
          )}
        </a>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Secciones">
          <a href="#ca-servicios" className="text-sm text-white/80 hover:text-white transition-colors">Servicios</a>
          <a href="#ca-sobre"     className="text-sm text-white/80 hover:text-white transition-colors">Nosotros</a>
          <a href="#ca-testimonios" className="text-sm text-white/80 hover:text-white transition-colors">Reseñas</a>
          <a href="#ca-preguntas" className="text-sm text-white/80 hover:text-white transition-colors">FAQ</a>
        </nav>

        {/* CTA */}
        <a href="#ca-agendar" className="ca-boton hidden sm:inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 text-sm font-semibold px-5 py-2.5 rounded-lg">
          Contactar
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </header>
  );
}
