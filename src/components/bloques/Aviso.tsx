import Icono from '../Icono';
import type { AvisoBloque, Ajustes } from '../../tipos';

interface Props {
  bloque: AvisoBloque;
  ajustes: Ajustes;
}

/**
 * Franja de una linea para algo puntual: una urgencia, un horario especial,
 * un corte de servicio. Va sin fondo de color -- el filete superior e inferior
 * alcanza para separarla de lo que tiene alrededor.
 */
export default function Aviso({ bloque, ajustes }: Props) {
  const enlace =
    bloque.accion === 'whatsapp'
      ? `https://wa.me/${ajustes.whatsapp}?text=${encodeURIComponent(ajustes.mensajeWhatsapp ?? '')}`
      : bloque.accion === 'llamar'
        ? `tel:${ajustes.telefono.replace(/\s/g, '')}`
        : '#agendar';

  return (
    <section className="border-y border-filete bg-superficie">
      <div className="contenedor flex flex-wrap items-center justify-between gap-4 py-6">
        <div className="flex items-center gap-4">
          <Icono nombre={bloque.icono} clase="size-6 shrink-0 text-azul" />
          <div>
            <p className="subtitulo text-tinta">{bloque.titulo}</p>
            {bloque.texto && <p className="cuerpo-sm mt-1 text-tinta-media">{bloque.texto}</p>}
          </div>
        </div>

        {bloque.textoBoton && (
          <a
            href={enlace}
            {...(bloque.accion === 'whatsapp' ? { target: '_blank', rel: 'noopener' } : {})}
            className="boton boton-primario"
          >
            {bloque.textoBoton}
          </a>
        )}
      </div>
    </section>
  );
}
