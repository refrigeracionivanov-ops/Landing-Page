import { useRef, useState } from 'react';
import type { ImagenSanity } from '../tipos';

interface Props {
  valor?: ImagenSanity;
  alCambiar: (valor: ImagenSanity | undefined) => void;
  proyecto: string;
  dataset: string;
}

/**
 * Campo de imagen del editor: subir, ver, describir y quitar.
 *
 * El texto alternativo esta en el mismo campo y no en otro aparte, porque una
 * imagen sin descripcion no la lee Google ni un lector de pantalla, y separarlos
 * hace facil olvidarse del segundo.
 */
export default function CampoImagen({ valor, alCambiar, proyecto, dataset }: Props) {
  const entrada = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** El id de asset codifica el nombre del archivo y su extension. */
  const url = valor?.asset?._ref
    ? `https://cdn.sanity.io/images/${proyecto}/${dataset}/${valor.asset._ref
        .replace('image-', '')
        .replace(/-(\w+)$/, '.$1')}?w=320&fit=max&auto=format`
    : null;

  async function subir(archivo: File) {
    setSubiendo(true);
    setError(null);

    try {
      const cuerpo = new FormData();
      cuerpo.append('archivo', archivo);

      const r = await fetch('/api/imagen', { method: 'POST', body: cuerpo });
      const datos = (await r.json()) as { ok?: boolean; imagen?: ImagenSanity; error?: string };

      if (!r.ok || !datos.ok || !datos.imagen) throw new Error(datos.error ?? `El servidor respondio ${r.status}.`);

      alCambiar({ ...datos.imagen, alt: valor?.alt ?? '' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir.');
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {url && (
        <img
          src={url}
          alt=""
          style={{ width: '100%', maxHeight: 160, objectFit: 'cover', border: '1px solid #e0e0e0', background: '#f4f4f4' }}
        />
      )}

      <input
        ref={entrada}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        style={{ display: 'none' }}
        onChange={(e) => {
          const archivo = e.target.files?.[0];
          if (archivo) subir(archivo);
          e.target.value = '';
        }}
      />

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          disabled={subiendo}
          onClick={() => entrada.current?.click()}
          style={{
            flex: 1,
            height: 32,
            fontSize: 13,
            border: '1px solid #0f62fe',
            background: 'white',
            color: '#0f62fe',
            cursor: subiendo ? 'default' : 'pointer',
          }}
        >
          {subiendo ? 'Subiendo...' : url ? 'Cambiar imagen' : 'Subir imagen'}
        </button>

        {url && (
          <button
            type="button"
            onClick={() => alCambiar(undefined)}
            style={{ height: 32, fontSize: 13, border: '1px solid #e0e0e0', background: 'white', cursor: 'pointer', padding: '0 12px' }}
          >
            Quitar
          </button>
        )}
      </div>

      {url && (
        <label style={{ fontSize: 12, color: '#525252', display: 'grid', gap: 4 }}>
          Texto alternativo
          <input
            type="text"
            value={valor?.alt ?? ''}
            placeholder="Describi la foto en pocas palabras"
            onChange={(e) => alCambiar({ ...(valor as ImagenSanity), alt: e.target.value })}
            style={{ height: 32, fontSize: 13, border: '1px solid #e0e0e0', padding: '0 8px', width: '100%' }}
          />
        </label>
      )}

      {error && <p style={{ fontSize: 12, color: '#da1e28', margin: 0 }}>{error}</p>}
    </div>
  );
}
