import type { Bloque, Ajustes } from '../../../tipos';
import Hero from './Hero';
import Estadisticas from './Estadisticas';
import Servicios from './Servicios';
import Sobre from './Sobre';
import Testimonios from './Testimonios';
import Confianza from './Confianza';
import Faq from './Faq';
import Agendar from './Agendar';
import Cta from './Cta';
import Video from './Video';

interface Props {
  secciones: Bloque[];
  ajustes: Ajustes;
  distritos: string[];
}

/**
 * Renderiza cada bloque de Sanity con los componentes de ComfortAir.
 * Cada tipo de bloque tiene su propia representación visual independiente.
 */
export default function Bloques({ secciones, ajustes, distritos }: Props) {
  return (
    <>
      {secciones.map((bloque) => {
        switch (bloque._type) {
          case 'heroBloque':
            return <Hero key={bloque._key} bloque={bloque as any} ajustes={ajustes} />;

          case 'beneficiosBloque':
            return <Estadisticas key={bloque._key} bloque={bloque as any} />;

          case 'serviciosBloque':
            return <Servicios key={bloque._key} bloque={bloque as any} />;

          case 'pasosBloque':
            return <Sobre key={bloque._key} bloque={bloque as any} />;

          case 'testimoniosBloque':
            return <Testimonios key={bloque._key} bloque={bloque as any} />;

          case 'confianzaBloque':
            return <Confianza key={bloque._key} bloque={bloque as any} />;

          case 'faqBloque':
            return <Faq key={bloque._key} bloque={bloque as any} />;

          case 'agendarBloque':
            return <Agendar key={bloque._key} bloque={bloque as any} ajustes={ajustes} distritos={distritos} />;

          case 'ctaBloque':
            return <Cta key={bloque._key} bloque={bloque as any} ajustes={ajustes} />;

          case 'videoBloque':
            return <Video key={bloque._key} bloque={bloque as any} />;

          default:
            return null;
        }
      })}
    </>
  );
}
