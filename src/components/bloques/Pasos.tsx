import type { PasosBloque } from '../../tipos';

interface Props {
  bloque: PasosBloque;
}

/**
 * Como trabajamos, paso a paso.
 *
 * La numeracion se calcula sola: quien edita reordena o borra pasos sin tener
 * que renumerar nada a mano.
 */
export default function Pasos({ bloque }: Props) {
  return (
    <section className="seccion">
      <div className="contenedor">
        <div className="max-w-2xl">
          {bloque.titulo && <h2 className="titulo-seccion text-tinta">{bloque.titulo}</h2>}
          {bloque.intro && <p className="cuerpo-lg mt-4 text-tinta-media text-pretty">{bloque.intro}</p>}
        </div>

        <ol className="mt-12 grid gap-px border border-filete bg-filete sm:grid-cols-2 lg:grid-cols-4">
          {bloque.pasos?.map((paso, i) => (
            <li key={paso._key} className="bg-lienzo p-6">
              {/* El numero es tipografia, no una pastilla de color: sigue la
                  misma regla que las cifras de Confianza. */}
              <p className="display-lg text-azul">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="titulo-tarjeta mt-4 text-tinta">{paso.titulo}</h3>
              {paso.texto && <p className="cuerpo-sm mt-3 text-tinta-media text-pretty">{paso.texto}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
