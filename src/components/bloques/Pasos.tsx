import type { PasosBloque } from '../../tipos';

interface Props {
  bloque: PasosBloque;
}

function clasesGrilla(n: number): string {
  if (n <= 1) return 'grid-cols-1';
  if (n === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (n === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
}

/**
 * Como trabajamos, paso a paso.
 *
 * La numeracion se calcula sola: quien edita reordena o borra pasos sin tener
 * que renumerar nada a mano.
 */
export default function Pasos({ bloque }: Props) {
  const n = bloque.pasos?.length ?? 0;
  return (
    <section className="seccion">
      <div className="contenedor">
        <div className="max-w-2xl">
          {bloque.titulo && <h2 className="titulo-seccion text-tinta">{bloque.titulo}</h2>}
          {bloque.intro && <p className="cuerpo-lg mt-4 text-tinta-media text-pretty">{bloque.intro}</p>}
        </div>

        <ol className={`mt-12 grid gap-px border border-filete bg-filete ${clasesGrilla(n)}`}>
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
