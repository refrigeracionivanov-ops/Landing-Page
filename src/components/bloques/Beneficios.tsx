import Icono from '../Icono';
import type { BeneficiosBloque } from '../../tipos';

interface Props {
  bloque: BeneficiosBloque;
}

export default function Beneficios({ bloque }: Props) {
  return (
    /* Banda gris: la alternancia lienzo / superficie-1 es todo el ritmo de la pagina.
       Reemplaza al patron de rayas diagonales, que Carbon no admite. */
    <section id="beneficios" className="banda seccion">
      <div className="contenedor">
        {bloque.titulo && <h2 className="titulo-seccion max-w-2xl text-tinta">{bloque.titulo}</h2>}

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {bloque.items?.map((item) => (
            <div key={item._key}>
              <Icono nombre={item.icono} clase="size-8 text-azul" />
              {/* Regla de 1px bajo el icono: la jerarquia de Carbon se dibuja con
                  filetes, nunca con circulos de color ni sombras. */}
              <hr className="mt-5 border-0 border-t border-superficie-2" />
              <h3 className="subtitulo mt-5 text-tinta">{item.titulo}</h3>
              {item.texto && <p className="cuerpo-sm mt-3 text-tinta-media text-pretty">{item.texto}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
