import type { FaqBloque } from '../../tipos';

interface Props {
  bloque: FaqBloque;
}

export default function Faq({ bloque }: Props) {
  return (
    <section id="preguntas" className="seccion">
      <div className="contenedor">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          {bloque.titulo && <h2 className="titulo-seccion text-tinta">{bloque.titulo}</h2>}

          <div className="border-t border-filete">
            {bloque.preguntas?.map((item) => (
              <details key={item._key} className="group border-b border-filete">
                <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 py-4 text-tinta marker:content-['']">
                  <span className="subtitulo">{item.pregunta}</span>
                  <svg
                    className="size-5 shrink-0 text-azul transition group-open:rotate-45"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p className="max-w-2xl pb-6 text-tinta-media text-pretty">{item.respuesta}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
