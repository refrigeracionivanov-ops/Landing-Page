import type { CtaBloque, Ajustes } from '../../tipos';

interface Props {
  bloque: CtaBloque;
  ajustes: Ajustes;
}

export default function Cta({ bloque, ajustes }: Props) {
  return (
    /* `cta-banner`: el unico lugar donde el azul IBM funciona como fondo y no como
       acento. Sin degradado, sin esquinas, sin sombra. */
    <section className="inverso bg-azul">
      <div className="contenedor grid gap-8 py-12 lg:grid-cols-2 lg:items-end lg:py-16">
        <div>
          <h2 className="titular text-white text-balance">{bloque.titulo}</h2>
          {bloque.texto && <p className="cuerpo-lg mt-4 max-w-xl text-white/85 text-pretty">{bloque.texto}</p>}
        </div>

        <div className="flex flex-wrap gap-px lg:justify-end">
          <a href="#agendar" className="boton boton-secundario">
            {bloque.textoBoton ?? 'Agendar visita'}
          </a>
          <a href={`tel:${ajustes.telefono.replace(/\s/g, '')}`} className="boton boton-terciario-inverso">
            Llamar {ajustes.telefono}
          </a>
        </div>
      </div>
    </section>
  );
}
