import type { BeneficiosBloque } from '../../../tipos';

interface Props {
  bloque: BeneficiosBloque;
}

/* Iconos SVG por nombre de icono */
const ICONOS: Record<string, string> = {
  estrella: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z"/>',
  escudo: '<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>',
  herramienta: '<path d="M14.7 6.3a4 4 0 0 1 5.3 5.3l-8.4 8.4a2.1 2.1 0 0 1-3-3l8.4-8.4"/><path d="M9.3 4.7 4.7 9.3 2 6.6 6.6 2z"/>',
  aire: '<rect x="2" y="4" width="20" height="9" rx="2"/><path d="M6 17c0 1.5 1 2 2 2M12 17c0 2 1.5 3 3 3M18 17c0 1.5-1 2-2 2"/>',
  moneda: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5a3 3 0 0 0-3-1.5c-1.7 0-3 .9-3 2s1.3 2 3 2 3 .9 3 2-1.3 2-3 2a3 3 0 0 1-3-1.5"/><path d="M12 6v12"/>',
  hoja: '<path d="M11 20A7 7 0 0 1 9.8 6.1C13 5 17 5 21 3c-1 4-1 8-2.1 11.2A7 7 0 0 1 11 20"/><path d="M3 21c1-3 3.5-7 8-10"/>',
  rayo: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  telefono: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.4 2.1L8 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2"/>',
};

function IconoSvg({ nombre = 'aire' }: { nombre?: string }) {
  const trazo = ICONOS[nombre] ?? ICONOS.aire;
  return (
    <svg
      className="size-6 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: trazo }}
    />
  );
}

export default function Estadisticas({ bloque }: Props) {
  if (!bloque.items?.length) return null;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {bloque.items.map((item) => (
            <div
              key={item._key}
              className="ca-casa bg-blue-50 flex flex-col items-center text-center px-4 pt-16 pb-6 min-h-[240px]"
            >
              {/* Círculo azul con icono */}
              <div className="size-14 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <IconoSvg nombre={item.icono} />
              </div>

              <h3 className="mt-4 font-bold text-slate-900 text-base leading-snug">
                {item.titulo}
              </h3>
              {item.texto && (
                <p className="mt-1.5 text-slate-500 text-sm leading-snug">{item.texto}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
