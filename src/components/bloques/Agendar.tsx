import { useEffect, useRef, useState } from 'react';
import { PUBLIC_TURNSTILE_SITEKEY } from 'astro:env/client';
import { PAISES, PAIS_POR_DEFECTO } from '../../lib/telefono';
import type { AgendarBloque, Ajustes } from '../../tipos';

interface Props {
  bloque: AgendarBloque;
  ajustes: Ajustes;
  distritos: string[];
}

const SERVICIOS = ['Instalación', 'Mantenimiento', 'Reparación', 'Limpieza de conductos', 'Otro / no estoy seguro'];

// "No estoy seguro" va primero a proposito: la mayoria de clientes no sabe que
// equipo tiene, y un formulario que los obliga a saberlo los expulsa.
const EQUIPOS = ['No estoy seguro', 'Split (pared)', 'Ventana', 'Conductos / central', 'Portátil', 'Extractor / ventilación'];

const FRANJAS_POR_DEFECTO = [
  { etiqueta: 'Mañana (8:00 - 12:00)', cupo: 3 },
  { etiqueta: 'Tarde (13:00 - 18:00)', cupo: 3 },
];

/**
 * Turnstile se dibuja de forma explicita, no con la clase `cf-turnstile`.
 *
 * El formulario se queda en pantalla despues de un envio fallido, y el token
 * de Turnstile se usa una sola vez: sin reiniciar el widget, el segundo intento
 * se rechaza siempre y el cliente ve un error que no puede resolver. Para
 * reiniciarlo hace falta el id que devuelve `render`.
 */
interface Turnstile {
  render: (
    contenedor: HTMLElement,
    opciones: {
      sitekey: string;
      action?: string;
      callback: (token: string) => void;
      'error-callback'?: () => void;
      'expired-callback'?: () => void;
    },
  ) => string;
  reset: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const aIso = (fecha: Date) =>
  new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export default function Agendar({ bloque, ajustes, distritos }: Props) {
  const franjas = ajustes.franjas?.length ? ajustes.franjas : FRANJAS_POR_DEFECTO;

  const formulario = useRef<HTMLFormElement>(null);
  const exito = useRef<HTMLDivElement>(null);

  const [paso, setPaso] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [fechaMinima, setFechaMinima] = useState('');

  /**
   * Si el formulario ya responde.
   *
   * El HTML llega del servidor con los botones dibujados, pero hasta que React
   * no se monta no hay nadie escuchando el clic. Arranca en `false` — que es lo
   * que se renderiza en el servidor — y pasa a `true` al montar, asi el boton
   * se ve apagado en esa ventana en vez de parecer normal y no hacer nada.
   */
  const [listo, setListo] = useState(false);
  useEffect(() => setListo(true), []);

  const [codigoPais, setCodigoPais] = useState(PAIS_POR_DEFECTO);
  const [datosEnviados, setDatosEnviados] = useState<Record<string, string> | null>(null);

  const cajaTurnstile = useRef<HTMLDivElement>(null);
  const idTurnstile = useRef<string | null>(null);

  /**
   * El token va en una ref y no en el estado: no se dibuja en ningun lado, y
   * asi el envio lee el ultimo que resolvio el widget aunque haya llegado
   * mientras se esperaba.
   */
  const token = useRef('');

  useEffect(() => {
    const el = cajaTurnstile.current;
    if (!PUBLIC_TURNSTILE_SITEKEY || !(el instanceof HTMLElement)) return;

    const renderizar = () => {
      if (!window.turnstile || !(el instanceof HTMLElement)) return;
      idTurnstile.current = window.turnstile.render(el, {
        sitekey: PUBLIC_TURNSTILE_SITEKEY,
        action: 'agendar',
        callback: (nuevo) => { token.current = nuevo; },
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

  /** Un token gastado no sirve dos veces: se pide uno nuevo tras cada fallo. */
  const reiniciarTurnstile = () => {
    token.current = '';
    if (idTurnstile.current) window.turnstile?.reset(idTurnstile.current);
  };

  /**
   * Le da tiempo al widget a resolver antes de mandar.
   *
   * Turnstile tarda; quien llena el formulario rapido, o entra con una conexion
   * lenta, puede apretar Solicitar visita antes de que termine. Sin esta espera
   * se lleva un rechazo del servidor siendo una persona, y el mensaje que ve
   * ("recarga la pagina") no le explica nada.
   *
   * Si el widget no responde en el limite, se manda igual con el token vacio y
   * decide el servidor: es una defensa, no la puerta, y una espera eterna en el
   * navegador seria la peor forma de cerrarla.
   */
  async function esperarToken(limiteMs = 8000) {
    const hasta = Date.now() + limiteMs;

    while (!token.current && Date.now() < hasta) {
      await new Promise((seguir) => setTimeout(seguir, 100));
    }

    return token.current;
  }
  const pais = PAISES.find((p) => p.codigo === codigoPais) ?? PAISES[0];

  const mensajeWa = (datos: Record<string, string>) => {
    const fecha = datos.fechaPreferida
      ? new Date(`${datos.fechaPreferida}T00:00:00`).toLocaleDateString('es-AR', {
          weekday: 'long', day: 'numeric', month: 'long',
        })
      : '';
    return [
      'Hola, acabo de solicitar una visita técnica por la web. Mis datos:',
      '',
      `• Nombre: ${datos.nombre}`,
      `• Servicio: ${datos.tipoServicio}`,
      datos.tipoEquipo ? `• Equipo: ${datos.tipoEquipo}` : '',
      `• Dirección: ${datos.direccion}, ${datos.distrito}`,
      fecha ? `• Fecha: ${fecha}` : '',
      `• Franja: ${datos.franja}`,
      datos.descripcion ? `• Problema: ${datos.descripcion}` : '',
      '',
      'Les adjunto fotos del equipo.',
    ].filter(Boolean).join('\n');
  };

  const enPaso2 = paso === 2;

  /**
   * La fecha minima se calcula en el navegador, no al renderizar.
   *
   * El servidor responde en UTC: para alguien en Buenos Aires, "manana" alla
   * puede seguir siendo hoy aca. Ademas quedaria escrita en el HTML de la
   * respuesta, y quien tuviera la pagina abierta pasada la medianoche se
   * quedaria con la fecha de ayer. El servidor la vuelve a validar en
   * `/api/reservar`, porque esto se puede saltear desde el navegador.
   */
  useEffect(() => {
    const minima = new Date();
    minima.setDate(minima.getDate() + (ajustes.diasAnticipacion ?? 1));
    setFechaMinima(aIso(minima));
  }, [ajustes.diasAnticipacion]);

  useEffect(() => {
    if (enviado) exito.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [enviado]);

  function irAPaso2() {
    if (!formulario.current?.reportValidity()) return;
    setPaso(2);
    formulario.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Recibe el formulario y no el evento: los tipos de eventos de React 19
   *  estan marcados como obsoletos, y aca lo unico que hace falta es el form. */
  async function enviar(form: HTMLFormElement) {
    setError(null);
    if (!form.reportValidity()) return;

    setEnviando(true);

    try {
      const datosDelFormulario = Object.fromEntries(new FormData(form)) as Record<string, string>;

      // El telefono se guarda con el codigo de pais adelante, para que despues
      // no haya que adivinar de donde es.
      const { codigoPais: codigo, ...resto } = datosDelFormulario;
      const cuerpo = {
        ...resto,
        telefono: `+${codigo} ${resto.telefono}`.trim(),
        turnstile: await esperarToken(),
      };

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
      const { turnstile: _t, sitioWeb: _s, ...guardar } = cuerpo;
      setDatosEnviados(guardar);
    } catch {
      setError('Parece que se cortó la conexión. Escribinos por WhatsApp y te atendemos igual.');
      reiniciarTurnstile();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section id="agendar" className="banda seccion">
      <div className="contenedor">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            {bloque.titulo && <h2 className="titulo-seccion text-tinta">{bloque.titulo}</h2>}
            {bloque.texto && <p className="cuerpo-lg mt-4 text-tinta-media text-pretty">{bloque.texto}</p>}
            <p className="cuerpo-sm mt-6 border-t border-superficie-2 pt-6 text-tinta-media">
              No cobramos nada por agendar. Confirmamos la hora exacta por WhatsApp.
            </p>
          </div>

          <form
            ref={formulario}
            onSubmit={(evento) => {
              evento.preventDefault();
              void enviar(evento.currentTarget);
            }}
            className={`border border-superficie-2 bg-lienzo p-6 sm:p-8 ${enviado ? 'hidden' : ''}`}
            noValidate
          >
            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between">
                <span className="cuerpo-sm text-tinta-media">
                  {enPaso2 ? 'Paso 2 de 2 — Tu visita' : 'Paso 1 de 2 — Tus datos'}
                </span>
                <span className="cuerpo-sm text-tinta-media">{enPaso2 ? '100%' : '50%'}</span>
              </div>
              <div className="h-1 bg-superficie-2">
                <div className="h-full bg-azul transition-all duration-300" style={{ width: enPaso2 ? '100%' : '50%' }} />
              </div>
            </div>

            <div className={enPaso2 ? 'hidden' : undefined}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="etiqueta-campo">Nombre y apellido *</span>
                  <input name="nombre" type="text" required autoComplete="name" className="campo" />
                </label>

                <label className="block">
                  <span className="etiqueta-campo">Teléfono / WhatsApp *</span>
                  {/* El código de país va aparte y no dentro del texto libre:
                      con el número suelto no se puede saber si "11 4567-8900"
                      es de acá, y el enlace de WhatsApp del panel abre un chat
                      con un número que no existe. Ver src/lib/telefono.ts. */}
                  <div className="flex gap-px">
                    <select
                      name="codigoPais"
                      value={codigoPais}
                      onChange={(e) => setCodigoPais(e.target.value)}
                      aria-label="Código de país"
                      className="campo w-28 shrink-0"
                    >
                      {PAISES.map((p) => (
                        <option key={p.codigo} value={p.codigo}>
                          +{p.codigo} {p.nombre.slice(0, 3)}
                        </option>
                      ))}
                    </select>
                    <input
                      name="telefono"
                      type="tel"
                      required
                      autoComplete="tel-national"
                      inputMode="tel"
                      placeholder={pais.ejemplo}
                      className="campo flex-1 min-w-0"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="etiqueta-campo">Barrio *</span>
                  <select name="distrito" required defaultValue="" className="campo">
                    <option value="">Elegí tu barrio</option>
                    {distritos.map((distrito) => (
                      <option key={distrito} value={distrito}>
                        {distrito}
                      </option>
                    ))}
                    <option value="Otro">Otro (no figura en la lista)</option>
                  </select>
                </label>

                <label className="block">
                  <span className="etiqueta-campo">Qué necesitás *</span>
                  <select name="tipoServicio" required defaultValue="" className="campo">
                    <option value="">Elegí un servicio</option>
                    {SERVICIOS.map((servicio) => (
                      <option key={servicio} value={servicio}>
                        {servicio}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="button"
                onClick={irAPaso2}
                disabled={!listo}
                aria-busy={!listo}
                className="boton boton-primario mt-8 w-full"
              >
                Siguiente
              </button>
            </div>

            {/*
              El paso 2 se oculta, no se desmonta: asi lo que ya escribieron sigue
              ahi si vuelven atras.

              Y va apagado mientras esta oculto, porque `display:none` NO exime a
              un campo de la validacion del navegador; solo `disabled` lo hace.
              Sin eso, `reportValidity()` en el paso 1 falla por los `required`
              del paso 2, no puede enfocarlos porque estan ocultos, y corta en
              silencio: el boton "Siguiente" no hace nada. Un campo apagado
              conserva su valor, solo queda fuera de la validacion y del FormData.
            */}
            <div className={enPaso2 ? undefined : 'hidden'}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="etiqueta-campo">Dirección *</span>
                  <input
                    name="direccion"
                    type="text"
                    required
                    disabled={!enPaso2}
                    autoComplete="street-address"
                    className="campo"
                  />
                </label>

                <label className="block">
                  <span className="etiqueta-campo">Tipo de equipo</span>
                  <select name="tipoEquipo" disabled={!enPaso2} className="campo">
                    {EQUIPOS.map((equipo) => (
                      <option key={equipo} value={equipo}>
                        {equipo}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="etiqueta-campo">Día preferido *</span>
                  {/* `key` fuerza a React a rehacer el campo cuando llega la fecha
                      minima: un `defaultValue` que cambia no se aplica solo. */}
                  <input
                    key={fechaMinima}
                    name="fechaPreferida"
                    type="date"
                    required
                    disabled={!enPaso2}
                    min={fechaMinima}
                    defaultValue={fechaMinima}
                    className="campo"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="etiqueta-campo">Contanos qué pasa</span>
                  <textarea
                    name="descripcion"
                    rows={3}
                    disabled={!enPaso2}
                    className="campo"
                    placeholder="Ej: el equipo enfría poco y hace ruido desde hace una semana"
                  />
                </label>

                <fieldset className="block sm:col-span-2">
                  <legend className="etiqueta-campo">Franja horaria *</legend>
                  <div className="grid gap-px bg-superficie-2 sm:grid-cols-2">
                    {franjas.map((franja, indice) => (
                      <label
                        key={franja.etiqueta}
                        className="cuerpo-sm flex min-h-12 cursor-pointer items-center gap-3 bg-superficie px-4 py-3 text-tinta has-checked:bg-azul has-checked:text-white"
                      >
                        <input
                          type="radio"
                          name="franja"
                          value={franja.etiqueta}
                          required
                          disabled={!enPaso2}
                          defaultChecked={indice === 0}
                          className="accent-azul"
                        />
                        {franja.etiqueta}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              {/* Campo trampa: doble proteccion — desplazado visualmente Y oculto semanticamente */}
              <div
                className="sr-only"
                aria-hidden="true"
                style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}
              >
                <label>
                  No completar
                  <input name="sitioWeb" type="text" tabIndex={-1} disabled={!enPaso2} autoComplete="off" />
                </label>
              </div>

              {/* Notificacion en linea de Carbon: barra de color a la izquierda, sin fondo saturado. */}
              {error && (
                <p className="cuerpo-sm mt-6 border-l-[3px] border-error bg-superficie px-4 py-3 text-tinta" role="alert">
                  {error}
                </p>
              )}

              <div ref={cajaTurnstile} className="mt-6" />

              <div className="mt-6 flex gap-px">
                <button type="button" onClick={() => setPaso(1)} className="boton boton-terciario">
                  Volver
                </button>
                <button type="submit" disabled={enviando || !listo} className="boton boton-primario flex-1">
                  {enviando ? 'Enviando...' : 'Solicitar visita'}
                </button>
              </div>

              {/*
                Debajo del boton y no en letra chica escondida: son datos
                personales y quien los deja tiene derecho a saber para que.
                Ley 25.326 de proteccion de datos personales.
              */}
              <p className="leyenda mt-4 text-tinta-media">
                Usamos tus datos solo para coordinar esta visita. No se comparten con terceros ni se usan para
                publicidad. Si querés que los borremos, escribinos
                {ajustes.email ? (
                  <>
                    {' '}
                    a <a href={`mailto:${ajustes.email}`} className="underline">{ajustes.email}</a>.
                  </>
                ) : (
                  ' por WhatsApp.'
                )}
              </p>
            </div>
          </form>
        </div>

        {enviado && (
          <div ref={exito} className="mt-10 border border-superficie-2 bg-lienzo p-8 lg:max-w-2xl">
            <div className="flex size-12 items-center justify-center bg-exito text-white">
              <svg
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m5 13 4 4L19 7" />
              </svg>
            </div>
            <h3 className="titulo-tarjeta mt-6 text-tinta">Listo</h3>
            <p className="mt-3 max-w-md text-tinta-media text-pretty">{bloque.mensajeExito}</p>
            <a
              href={`https://wa.me/${ajustes.whatsapp}?text=${encodeURIComponent(
                datosEnviados ? mensajeWa(datosEnviados) : 'Hola, acabo de solicitar una visita técnica por la web.',
              )}`}
              target="_blank"
              rel="noopener"
              className="boton boton-whatsapp mt-6"
            >
              Enviar resumen por WhatsApp
            </a>
            <p className="cuerpo-sm mt-3 text-tinta-media">Con una foto del equipo podemos estimar el trabajo antes de ir.</p>
          </div>
        )}
      </div>
    </section>
  );
}
