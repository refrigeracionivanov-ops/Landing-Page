import type { CoberturaBloque } from '../../tipos';

interface Props {
  bloque: CoberturaBloque;
}

export default function Cobertura({ bloque }: Props) {
  return (
    <section id="cobertura" className="banda seccion">
      <div className="contenedor">
        <div className="max-w-2xl">
          {bloque.titulo && <h2 className="titulo-seccion text-tinta">{bloque.titulo}</h2>}
          {bloque.texto && <p className="cuerpo-lg mt-4 text-tinta-media text-pretty">{bloque.texto}</p>}
        </div>

        {/* Antes eran pastillas redondeadas. Carbon las prohibe explicitamente:
            se leen como otra marca. Van como celdas cuadradas de una grilla. */}
        <ul className="mt-10 grid gap-px border border-superficie-2 bg-superficie-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {bloque.distritos?.map((distrito) => (
            <li key={distrito} className="cuerpo-sm flex min-h-12 items-center bg-lienzo px-4 py-3 text-tinta">
              {distrito}
            </li>
          ))}
        </ul>

        {bloque.notaFueraDeZona && <p className="cuerpo-sm mt-6 text-tinta-media">{bloque.notaFueraDeZona}</p>}
      </div>
    </section>
  );
}
