import { useState } from 'react';
import type { FaqBloque } from '../../tipos';

interface Props {
  bloque: FaqBloque;
}

/**
 * Version del FAQ para el canvas del editor.
 *
 * La version publicada usa <details>/<summary> (funciona sin JS). En el editor
 * el canvas intercepta el primer click para seleccionar el bloque, asi que el
 * toggle nativo nunca dispara. Con useState el segundo click (ya seleccionado)
 * si llega al componente y el acordeon funciona.
 */
export default function FaqEditor({ bloque }: Props) {
  const [abierto, setAbierto] = useState<string | null>(null);

  return (
    <section id="preguntas" className="seccion">
      <div className="contenedor">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          {bloque.titulo && <h2 className="titulo-seccion text-tinta">{bloque.titulo}</h2>}

          <div className="border-t border-filete">
            {bloque.preguntas?.map((item) => (
              <div key={item._key} className="border-b border-filete">
                <button
                  type="button"
                  className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left"
                  onClick={() => setAbierto(abierto === item._key ? null : item._key)}
                >
                  <span className="subtitulo text-tinta">{item.pregunta}</span>
                  <svg
                    className={`size-5 shrink-0 text-azul transition-transform${abierto === item._key ? ' rotate-45' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                {abierto === item._key && (
                  <p className="max-w-2xl pb-6 text-tinta-media text-pretty">{item.respuesta}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
