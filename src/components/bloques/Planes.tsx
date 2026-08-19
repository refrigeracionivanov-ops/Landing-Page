import type { PlanesBloque } from '../../tipos';

interface Props {
  bloque: PlanesBloque;
}

/**
 * Planes comparados.
 *
 * El plan marcado como destacado no se pinta de otro color: se apoya sobre la
 * superficie gris, que es como Carbon jerarquiza una tarjeta.
 */
export default function Planes({ bloque }: Props) {
  return (
    <section className="banda seccion">
      <div className="contenedor">
        <div className="max-w-2xl">
          {bloque.titulo && <h2 className="titulo-seccion text-tinta">{bloque.titulo}</h2>}
          {bloque.intro && <p className="cuerpo-lg mt-4 text-tinta-media text-pretty">{bloque.intro}</p>}
        </div>

        <div className="mt-12 grid gap-px border border-superficie-2 bg-superficie-2 md:grid-cols-3">
          {bloque.planes?.map((plan) => (
            <article key={plan._key} className={`flex flex-col p-8 ${plan.destacado ? 'bg-superficie' : 'bg-lienzo'}`}>
              {plan.destacado && <p className="antetitulo text-azul">Más elegido</p>}
              <h3 className="titulo-tarjeta mt-2 text-tinta">{plan.nombre}</h3>

              {plan.precio && (
                <p className="display-lg mt-4 text-tinta">
                  {plan.precio}
                  {plan.periodo && <span className="cuerpo-sm ml-2 text-tinta-media">{plan.periodo}</span>}
                </p>
              )}

              {plan.descripcion && <p className="cuerpo-sm mt-4 text-tinta-media text-pretty">{plan.descripcion}</p>}

              {plan.incluye && plan.incluye.length > 0 && (
                <ul className="mt-6 grow space-y-3 border-t border-filete pt-6">
                  {plan.incluye.map((linea, i) => (
                    <li key={i} className="cuerpo-sm flex gap-3 text-tinta">
                      <svg
                        className="mt-1 size-4 shrink-0 text-azul"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                      {linea}
                    </li>
                  ))}
                </ul>
              )}

              <a href="#agendar" className="boton boton-primario mt-8 self-start">
                {plan.textoBoton ?? 'Quiero este plan'}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
