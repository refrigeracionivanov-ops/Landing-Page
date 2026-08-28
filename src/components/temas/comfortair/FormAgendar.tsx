import { useEffect, useRef, useState } from 'react';
import { PUBLIC_TURNSTILE_SITEKEY } from 'astro:env/client';
import { PAISES, PAIS_POR_DEFECTO } from '../../../lib/telefono';
import type { AgendarBloque, Ajustes } from '../../../tipos';

interface Props {
  bloque: AgendarBloque;
  ajustes: Ajustes;
  distritos: string[];
}

const SERVICIOS = ['Instalación', 'Mantenimiento', 'Reparación', 'Limpieza de conductos', 'Otro / no estoy seguro'];
const EQUIPOS = ['No estoy seguro', 'Split (pared)', 'Ventana', 'Conductos / central', 'Portátil', 'Extractor / ventilación'];
const FRANJAS_POR_DEFECTO = [
  { etiqueta: 'Mañana (8:00 - 12:00)', cupo: 3 },
  { etiqueta: 'Tarde (13:00 - 18:00)', cupo: 3 },
];

interface Turnstile {
  render: (el: HTMLElement, opts: { sitekey: string; action?: string; callback: (t: string) => void; 'error-callback'?: () => void; 'expired-callback'?: () => void }) => string;
  reset: (id: string) => void;
}
declare global { interface Window { turnstile?: Turnstile } }

const aIso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const FIELD = 'border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';
const INPUT = `w-full ${FIELD}`;
const SELECT = `${INPUT} cursor-pointer`;
const SELECT_ANCHO = `${FIELD} cursor-pointer`; // sin w-full, para selects con ancho fijo
const LABEL = 'block text-sm font-medium text-slate-700 mb-1.5';

export default function FormAgendar({ bloque, ajustes, distritos }: Props) {
  const franjas = ajustes.franjas?.length ? ajustes.franjas : FRANJAS_POR_DEFECTO;
  const formulario = useRef<HTMLFormElement>(null);
  const exito = useRef<HTMLDivElement>(null);

  const [paso, setPaso] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [fechaMinima, setFechaMinima] = useState('');
  const [listo, setListo] = useState(false);
  const [codigoPais, setCodigoPais] = useState(PAIS_POR_DEFECTO);

  const cajaTurnstile = useRef<HTMLDivElement>(null);
  const idTurnstile = useRef<string | null>(null);
  const token = useRef('');

  useEffect(() => setListo(true), []);

  useEffect(() => {
    const minima = new Date();
    minima.setDate(minima.getDate() + (ajustes.diasAnticipacion ?? 1));
    setFechaMinima(aIso(minima));
  }, [ajustes.diasAnticipacion]);

  useEffect(() => {
    if (enviado) exito.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [enviado]);

  useEffect(() => {
    const el = cajaTurnstile.current;
    if (!PUBLIC_TURNSTILE_SITEKEY || !(el instanceof HTMLElement)) return;

    const renderizar = () => {
      if (!window.turnstile || !(el instanceof HTMLElement)) return;
      idTurnstile.current = window.turnstile.render(el, {
        sitekey: PUBLIC_TURNSTILE_SITEKEY,
        action: 'agendar',
        callback: (t) => { token.current = t; },
        'error-callback': () => { token.current = ''; },
        'expired-callback': () => { token.current = ''; },
      });
    };

    if (window.turnstile) {
      renderizar();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = renderizar;
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);

  const reiniciarTurnstile = () => {
    token.current = '';
    if (idTurnstile.current) window.turnstile?.reset(idTurnstile.current);
  };

  async function esperarToken(limiteMs = 8000) {
    const hasta = Date.now() + limiteMs;
    while (!token.current && Date.now() < hasta) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return token.current;
  }

  function irAPaso2() {
    if (!formulario.current?.reportValidity()) return;
    setPaso(2);
    formulario.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function enviar(form: HTMLFormElement) {
    setError(null);
    if (!form.reportValidity()) return;
    setEnviando(true);
    try {
      const raw = Object.fromEntries(new FormData(form)) as Record<string, string>;
      const { codigoPais: codigo, ...resto } = raw;
      const cuerpo = { ...resto, telefono: `+${codigo} ${resto.telefono}`.trim(), turnstile: await esperarToken() };
      const respuesta = await fetch('/api/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      });
      const datos = (await respuesta.json().catch(() => ({}))) as { mensaje?: string };
      if (!respuesta.ok) {
        setError(datos.mensaje ?? 'No pudimos enviar la solicitud. Escribinos por WhatsApp y te atendemos igual.');
        reiniciarTurnstile();
        return;
      }
      setEnviado(true);
    } catch {
      setError('Parece que se cortó la conexión. Escribinos por WhatsApp y te atendemos igual.');
      reiniciarTurnstile();
    } finally {
      setEnviando(false);
    }
  }

  const pais = PAISES.find((p) => p.codigo === codigoPais) ?? PAISES[0];
  const enPaso2 = paso === 2;

  if (enviado) {
    return (
      <div ref={exito} className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
        <div className="mx-auto size-14 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="size-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m5 13 4 4L19 7"/>
          </svg>
        </div>
        <h3 className="mt-5 text-xl font-bold text-slate-900">¡Solicitud enviada!</h3>
        <p className="mt-3 text-slate-500 text-sm leading-relaxed max-w-sm mx-auto text-pretty">
          {bloque.mensajeExito ?? 'Recibimos tu solicitud. Te escribimos por WhatsApp en breve para confirmar el horario.'}
        </p>
        <a
          href={`https://wa.me/${ajustes.whatsapp}?text=${encodeURIComponent('Hola, acabo de solicitar una visita por la web y les mando fotos del equipo.')}`}
          target="_blank"
          rel="noopener"
          className="mt-6 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
          </svg>
          Enviar fotos del equipo por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form
      ref={formulario}
      onSubmit={(e) => { e.preventDefault(); void enviar(e.currentTarget); }}
      noValidate
    >
      {/* Barra de progreso */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>{enPaso2 ? 'Paso 2 de 2 — Tu visita' : 'Paso 1 de 2 — Tus datos'}</span>
          <span>{enPaso2 ? '100%' : '50%'}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: enPaso2 ? '100%' : '50%' }}
          />
        </div>
      </div>

      {/* ── Paso 1 ── */}
      <div className={enPaso2 ? 'hidden' : undefined}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={LABEL}>Nombre y apellido *</span>
            <input name="nombre" type="text" required autoComplete="name" className={INPUT} />
          </label>

          <label className="block sm:col-span-2">
            <span className={LABEL}>Teléfono / WhatsApp *</span>
            <div className="flex gap-2">
              <select
                name="codigoPais"
                value={codigoPais}
                onChange={(e) => setCodigoPais(e.target.value)}
                aria-label="Código de país"
                className={`${SELECT_ANCHO} w-28 shrink-0`}
              >
                {PAISES.map((p) => (
                  <option key={p.codigo} value={p.codigo}>+{p.codigo} {p.nombre.slice(0, 3)}</option>
                ))}
              </select>
              <input name="telefono" type="tel" required autoComplete="tel-national" inputMode="tel" placeholder={pais.ejemplo} className={`${INPUT} grow`} />
            </div>
          </label>

          <label className="block">
            <span className={LABEL}>Barrio *</span>
            <select name="distrito" required defaultValue="" className={SELECT}>
              <option value="">Elegí tu barrio</option>
              {distritos.map((d) => <option key={d} value={d}>{d}</option>)}
              <option value="Otro">Otro (no figura en la lista)</option>
            </select>
          </label>

          <label className="block">
            <span className={LABEL}>Qué necesitás *</span>
            <select name="tipoServicio" required defaultValue="" className={SELECT}>
              <option value="">Elegí un servicio</option>
              {SERVICIOS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={irAPaso2}
          disabled={!listo}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
        >
          Siguiente →
        </button>
      </div>

      {/* ── Paso 2 ── */}
      <div className={enPaso2 ? undefined : 'hidden'}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={LABEL}>Dirección *</span>
            <input name="direccion" type="text" required disabled={!enPaso2} autoComplete="street-address" className={INPUT} />
          </label>

          <label className="block">
            <span className={LABEL}>Tipo de equipo</span>
            <select name="tipoEquipo" disabled={!enPaso2} className={SELECT}>
              {EQUIPOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </label>

          <label className="block">
            <span className={LABEL}>Día preferido *</span>
            <input key={fechaMinima} name="fechaPreferida" type="date" required disabled={!enPaso2} min={fechaMinima} defaultValue={fechaMinima} className={INPUT} />
          </label>

          <label className="block sm:col-span-2">
            <span className={LABEL}>Contanos qué pasa</span>
            <textarea name="descripcion" rows={3} disabled={!enPaso2} className={`${INPUT} resize-none`} placeholder="Ej: el equipo enfría poco y hace ruido desde hace una semana" />
          </label>

          <fieldset className="block sm:col-span-2">
            <legend className={LABEL}>Franja horaria *</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {franjas.map((franja, i) => (
                <label key={franja.etiqueta} className="flex items-center gap-3 border border-slate-200 rounded-lg px-4 py-3 cursor-pointer has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 transition-colors">
                  <input type="radio" name="franja" value={franja.etiqueta} required disabled={!enPaso2} defaultChecked={i === 0} className="accent-blue-600" />
                  <span className="text-sm text-slate-700">{franja.etiqueta}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Campo trampa */}
        <div className="sr-only" aria-hidden="true" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
          <input name="sitioWeb" type="text" tabIndex={-1} disabled={!enPaso2} autoComplete="off" />
        </div>

        {error && (
          <p className="mt-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
            {error}
          </p>
        )}

        <div ref={cajaTurnstile} className="mt-5" />

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={() => setPaso(1)} className="border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium py-3 px-5 rounded-lg transition-colors text-sm">
            ← Volver
          </button>
          <button type="submit" disabled={enviando || !listo} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm">
            {enviando ? 'Enviando...' : 'Solicitar visita'}
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-400 leading-relaxed">
          Usamos tus datos solo para coordinar esta visita. No se comparten con terceros.{' '}
          {ajustes.email && <a href={`mailto:${ajustes.email}`} className="underline">{ajustes.email}</a>}
        </p>
      </div>
    </form>
  );
}
