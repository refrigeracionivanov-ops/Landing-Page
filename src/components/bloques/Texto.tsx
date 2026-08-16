import type { TextoBloque } from '../../tipos';

interface Props {
  bloque: TextoBloque;
}

/**
 * El bloque comodin: un titulo y texto corrido.
 *
 * Los parrafos se separan con una linea en blanco al escribir. No hay negritas
 * ni enlaces a proposito: en cuanto se abre esa puerta, el texto del sitio
 * empieza a llenarse de formato improvisado y se rompe la jerarquia.
 */
export default function Texto({ bloque }: Props) {
  const parrafos = (bloque.texto ?? '').split(/\n{2,}/).filter((p) => p.trim());

  return (
    <section className={bloque.fondoGris ? 'banda seccion' : 'seccion'}>
      <div className="contenedor">
        <div className="max-w-2xl">
          {bloque.titulo && <h2 className="titulo-seccion text-tinta">{bloque.titulo}</h2>}
          {parrafos.map((parrafo, i) => (
            <p key={i} className={`cuerpo-lg text-tinta-media text-pretty ${i === 0 ? 'mt-4' : 'mt-4'}`}>
              {parrafo}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
