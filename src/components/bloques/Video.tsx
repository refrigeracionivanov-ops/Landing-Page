import type { VideoBloque } from '../../tipos';

interface Props {
  bloque: VideoBloque;
}

function urlEmbed(url: string): string | null {
  if (!url) return null;
  const corta = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (corta) return `https://www.youtube.com/embed/${corta[1]}`;
  const larga = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (larga) return `https://www.youtube.com/embed/${larga[1]}`;
  if (url.includes('youtube.com/embed/')) return url;
  return null;
}

export default function Video({ bloque }: Props) {
  const embed = urlEmbed(bloque.url ?? '');

  return (
    <section className="banda seccion">
      <div className="contenedor">
        {bloque.titulo && (
          <h2 className="titulo-seccion text-tinta mb-8">{bloque.titulo}</h2>
        )}
        <div className="relative w-full bg-superficie-2" style={{ paddingTop: '56.25%' }}>
          {embed ? (
            <iframe
              src={embed}
              title={bloque.titulo ?? 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <div style={{ width: 56, height: 56, background: '#0f62fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="cuerpo-sm text-tinta-media">Agregá la URL del video en el editor</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
