import type { Ajustes } from '../../../tipos';

interface Props {
  ajustes: Ajustes;
}

export default function PieDePagina({ ajustes }: Props) {
  const anio = new Date().getFullYear();
  const tel = ajustes.telefono.replace(/\s/g, '');

  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

        {/* Columna marca */}
        <div>
          <p className="font-bold text-slate-900 text-lg">{ajustes.nombre}</p>
          {ajustes.direccion && <p className="mt-3 text-slate-500 text-sm leading-relaxed">{ajustes.direccion}</p>}
          {ajustes.horario && <p className="mt-1 text-slate-500 text-sm">{ajustes.horario}</p>}
          <a href="#ca-agendar" className="mt-5 inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors">
            Contactar
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        {/* Columna servicios */}
        <div>
          <p className="font-semibold text-slate-900 text-sm mb-4">Servicios</p>
          {[
            { label: 'Nuestros servicios', href: '#ca-servicios' },
            { label: 'Preguntas frecuentes', href: '#ca-preguntas' },
            { label: 'Agendar visita', href: '#ca-agendar' },
          ].map(({ label, href }) => (
            <p key={href} className="mt-2">
              <a href={href} className="text-slate-500 hover:text-blue-600 text-sm transition-colors">{label}</a>
            </p>
          ))}
        </div>

        {/* Columna contacto */}
        <div>
          <p className="font-semibold text-slate-900 text-sm mb-4">Contacto</p>
          <p className="mt-2">
            <a href={`tel:${tel}`} className="text-slate-500 hover:text-blue-600 text-sm transition-colors flex items-center gap-1.5">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.4 2.1L8 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2"/>
              </svg>
              {ajustes.telefono}
            </a>
          </p>
          {ajustes.email && (
            <p className="mt-2">
              <a href={`mailto:${ajustes.email}`} className="text-slate-500 hover:text-blue-600 text-sm transition-colors flex items-center gap-1.5">
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
                </svg>
                {ajustes.email}
              </a>
            </p>
          )}
          {ajustes.whatsapp && (
            <p className="mt-2">
              <a href={`https://wa.me/${ajustes.whatsapp}`} target="_blank" rel="noopener" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
                WhatsApp
              </a>
            </p>
          )}
        </div>

        {/* Columna empresa */}
        <div>
          <p className="font-semibold text-slate-900 text-sm mb-4">Empresa</p>
          {[
            { label: 'Inicio', href: '/comfortair' },
            { label: 'Reseñas', href: '#ca-testimonios' },
            { label: 'Administrador', href: '/administrador-comfortair' },
          ].map(({ label, href }) => (
            <p key={href} className="mt-2">
              <a href={href} className="text-slate-500 hover:text-blue-600 text-sm transition-colors">{label}</a>
            </p>
          ))}
        </div>
      </div>

      {/* Barra de copyright */}
      <div className="border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-slate-400 text-xs">© {anio} {ajustes.nombre}. Todos los derechos reservados.</p>
          <a href="/privacidad" className="text-slate-400 hover:text-slate-600 text-xs transition-colors">Política de privacidad</a>
        </div>
      </div>
    </footer>
  );
}
