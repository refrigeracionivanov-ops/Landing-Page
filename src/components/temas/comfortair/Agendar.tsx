import FormAgendar from './FormAgendar';
import type { AgendarBloque, Ajustes } from '../../../tipos';

interface Props {
  bloque: AgendarBloque;
  ajustes: Ajustes;
  distritos: string[];
}

/**
 * Wrapper del formulario de agendamiento para el tema ComfortAir.
 * Reutiliza la lógica del formulario base (validación, Turnstile, envío)
 * y le agrega el contenedor visual de ComfortAir.
 */
export default function Agendar({ bloque, ajustes, distritos }: Props) {
  return (
    <section id="ca-agendar" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 grid lg:grid-cols-2 gap-16 items-start">

        {/* Columna izquierda: texto introductorio */}
        <div>
          <span className="text-blue-600 font-semibold text-sm tracking-widest uppercase">
            Reservá tu visita
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            {bloque.titulo ?? 'Agendá tu visita técnica'}
          </h2>
          {bloque.texto && (
            <p className="mt-5 text-slate-500 text-lg leading-relaxed text-pretty">{bloque.texto}</p>
          )}

          {/* Características de confianza */}
          <ul className="mt-8 space-y-4">
            {[
              'Sin costos ocultos — precio claro desde el diagnóstico',
              'Técnicos certificados y con seguro',
              'Confirmamos por WhatsApp en menos de 2 horas',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <div className="size-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="size-3 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </div>
                <span className="text-slate-600 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          {/* Contacto directo */}
          <div className="mt-10 flex flex-col gap-3">
            <a href={`tel:${ajustes.telefono.replace(/\s/g,'')}`} className="inline-flex items-center gap-2 text-slate-700 hover:text-blue-600 text-sm font-medium transition-colors">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.4 2.1L8 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2"/>
              </svg>
              {ajustes.telefono}
            </a>
          </div>
        </div>

        {/* Columna derecha: formulario base (mismo que el resto del sitio) */}
        <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100">
          <FormAgendar bloque={bloque} ajustes={ajustes} distritos={distritos} />
        </div>
      </div>
    </section>
  );
}
