import { urlImagen } from '../../sanity/imagen';
import type { ConfianzaBloque } from '../../tipos';

interface Props {
  bloque: ConfianzaBloque;
}

export default function Confianza({ bloque }: Props) {
  return (
    /* Antes esta seccion era azul oscuro. Carbon invierte una sola superficie en toda
       la pagina y es el pie: aca las cifras se sostienen con tamano y peso 300. */
    <section id="confianza" className="seccion">
      <div className="contenedor">
        {bloque.titulo && <h2 className="titulo-seccion max-w-2xl text-tinta">{bloque.titulo}</h2>}

        <dl className="mt-12 grid gap-px border border-filete bg-filete sm:grid-cols-2 lg:grid-cols-4">
          {bloque.items?.map((item) => (
            <div key={item._key} className="bg-lienzo p-6">
              <dt className="display-lg text-tinta">{item.valor}</dt>
              <dd className="cuerpo-sm mt-3 text-tinta-media">{item.etiqueta}</dd>
            </div>
          ))}
        </dl>

        {bloque.marcas && bloque.marcas.length > 0 && (
          <div className="mt-12">
            <p className="antetitulo">Trabajamos con</p>
            <div className="mt-4 grid gap-px border border-filete bg-filete grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              {bloque.marcas.map((marca) => (
                <div key={marca._key} className="flex items-center justify-center bg-lienzo p-6">
                  <img
                    src={urlImagen(marca).height(80).url()}
                    alt={marca.alt ?? ''}
                    className="h-8 w-auto opacity-60 transition hover:opacity-100"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
