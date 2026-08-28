import type { VideoBloque } from '../../../tipos';

interface Props {
  bloque: VideoBloque;
}

function urlEmbed(url: string): string | null {
  if (!url) return null;
  // youtu.be/ID
  const corta = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (corta) return `https://www.youtube.com/embed/${corta[1]}`;
  // youtube.com/watch?v=ID
  const larga = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (larga) return `https://www.youtube.com/embed/${larga[1]}`;
  // ya es un embed o iframe src
  if (url.includes('youtube.com/embed/')) return url;
  return null;
}

export default function Video({ bloque }: Props) {
  const embed = urlEmbed(bloque.url ?? '');

  return (
    <section className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        {bloque.titulo && (
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-10 tracking-tight">
            {bloque.titulo}
          </h2>
        )}

        {embed ? (
          <div className="relative w-full rounded-2xl overflow-hidden shadow-xl" style={{ paddingTop: '56.25%' }}>
            <iframe
              src={embed}
              title={bloque.titulo ?? 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ) : (
          <div className="relative w-full rounded-2xl overflow-hidden bg-slate-200 flex items-center justify-center" style={{ paddingTop: '56.25%' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="size-16 rounded-full bg-blue-600 flex items-center justify-center">
                <svg className="size-7 text-white ml-1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="text-slate-500 text-sm">Agregá la URL del video en el editor</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
