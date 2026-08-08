# Landing de ventilación + agendamiento de visitas

Landing por bloques editable desde `/admin`, con formulario de solicitud de visita
técnica. Pensada para que la mantenga alguien sin formación técnica.

- **Astro** — sitio estático, salvo `/api/reservar` y `/solicitudes`
- **Sanity** — contenido de la landing y panel de edición (`/admin`)
- **Cloudflare D1** — solicitudes de visita (datos personales de clientes)
- **Cloudflare Access** — protege `/solicitudes`
- **Google Calendar** — espejo de las visitas agendadas (opcional)
- **Cloudflare Pages** — hosting (su plan gratuito permite uso comercial)
- **Tailwind v4** — estilos, con los tokens cerrados en `src/styles/global.css`

## Por qué los datos están partidos en dos

El contenido de la landing vive en Sanity. Las solicitudes de visita **no**.

El plan gratuito de Sanity solo permite datasets públicos, y "público" ahí significa
que cualquiera puede leer todos los documentos sin autenticarse. El
`PUBLIC_SANITY_PROJECT_ID` viaja en el HTML del sitio publicado, así que alcanza con
mirar el código fuente para consultarlo.

Para el contenido de marketing da igual — es público de todos modos. Para nombres,
teléfonos y direcciones de clientes, no. Por eso las solicitudes van a D1, cuyo plan
gratuito no obliga a exponer nada.

## Puesta en marcha

### 1. Sanity (contenido)

Creá un proyecto en [sanity.io/manage](https://sanity.io/manage) con un dataset
`production`. Anotá el *Project ID*.

En **API → Tokens**, generá un token con permiso de **Editor** (solo lo usa el script
de carga inicial; el sitio publicado no lo necesita).

En **API → CORS origins**, agregá `http://localhost:4321` con credenciales
habilitadas. Sin esto `/admin` carga en blanco.

```bash
cp .env.example .env    # completá PUBLIC_SANITY_PROJECT_ID y SANITY_WRITE_TOKEN
npm run sembrar
```

### 2. Cloudflare D1 (solicitudes)

```bash
npm run db:crear
```

Copiá el `database_id` que devuelve y pegalo en `wrangler.jsonc`. Después:

```bash
npm run tipos && npm run db:migrar
```

`db:migrar` trabaja sobre la base local. Para la base real, `npm run db:migrar:prod`.

### 3. Levantar

```bash
npm run dev
```

- Sitio → http://localhost:4321
- Contenido → http://localhost:4321/admin
- Solicitudes → http://localhost:4321/solicitudes

> En desarrollo `/solicitudes` **no está protegida** — Cloudflare Access solo existe
> en producción. La página avisa por consola cada vez que se abre.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run check` | Chequeo de tipos |
| `npm run sembrar` | Carga contenido de ejemplo en Sanity |
| `npm run tipos` | Regenera los tipos de los bindings de Cloudflare |
| `npm run db:migrar` | Aplica migraciones a la base local |
| `npm run db:migrar:prod` | Aplica migraciones a la base real |

Corré `npm run tipos` cada vez que cambies `wrangler.jsonc`.

## Cómo agregar un bloque nuevo

1. Definí el esquema en `src/sanity/schemaTypes/bloques.ts` y sumalo al array `bloques`
2. Creá el componente en `src/components/bloques/`
3. Agregá la línea correspondiente en el mapa de `src/components/Bloques.astro`

Aparece solo en el menú de "Agregar sección" del panel.

## Decisiones de diseño

**Los colores y las tipografías no se exponen en el panel.** Solo se editan textos,
imágenes, links y el orden de las secciones. Es lo que hace que la página siga
viéndose bien sin intervención de un desarrollador.

**Las visitas se piden por franja, no por hora exacta.** Un técnico que viaja no
puede comprometer las 14:00 sin saber dónde termina el trabajo anterior. El cliente
elige día y franja, el negocio confirma la hora por WhatsApp. El cupo por franja se
configura en *Ajustes del negocio*, en Sanity.

**La fecha mínima se calcula en el navegador, no al construir el sitio.** El sitio es
estático: si se calculara en el build, quedaría congelada en la fecha del deploy. El
servidor la vuelve a validar en `src/pages/api/reservar.ts`, porque el navegador se
puede saltear.

**Las promociones vencen solas.** El filtro por `vigenciaHasta` está en la consulta
GROQ.

**Las fotos de los equipos van por WhatsApp, no por el formulario.** Subir archivos
exigiría exponer un token de escritura o montar un proxy con límites de tamaño, y el
cliente ya tiene las fotos en el teléfono donde está WhatsApp.

**El token de Access se verifica aunque Cloudflare ya filtre en el borde.** La URL
interna del deployment (`*.pages.dev`) puede quedar accesible sin pasar por Access.
`src/lib/acceso.ts` valida la firma contra las claves públicas del equipo.

## Despliegue en Cloudflare Pages

Conectá el repositorio con:

- Build: `npm run build`
- Directorio de salida: `dist`

Cargá las variables de `.env` en el panel de Cloudflare, agregá el dominio de
producción a los **CORS origins** de Sanity, y corré `npm run db:migrar:prod`.

### Proteger `/solicitudes`

En **Zero Trust → Access → Applications**, creá una aplicación self-hosted:

- Dominio: tu dominio, path `solicitudes`
- Política: los correos que deban entrar

En la pestaña *Overview* de la aplicación está el **Application Audience (AUD) Tag**.
Ese valor va en `CF_ACCESS_AUD`, y tu dominio de equipo
(`algo.cloudflareaccess.com`) en `CF_ACCESS_TEAM_DOMAIN`.

> Sin esas dos variables la página devuelve 403 en producción. Es a propósito: es
> preferible que no cargue a que muestre datos de clientes sin verificar quién entra.

## Espejo en Google Calendar

D1 es la fuente de verdad; el calendario es la vista para el día a día. La idea es
que la persona trabaje en la app que ya conoce y abra `/solicitudes` solo para lo que
Calendar no sabe hacer: ver las nuevas sin atender y cambiar estados.

Se sincroniza al guardar un cambio de estado:

| Estado | Qué pasa con el evento |
|---|---|
| `agendada` | Se crea, o se actualiza si ya existía |
| `completada` | Se mantiene, como registro histórico |
| `nueva`, `contactada`, `cancelada` | Se borra si existía |

El horario del evento sale de la etiqueta de la franja: de `Manana (8:00 - 12:00)`
saca 8:00 a 12:00. Si la etiqueta no trae horas, el evento se crea de día completo en
vez de inventar un horario.

**Autenticación por cuenta de servicio, no OAuth.** No hay refresh token que caduque
ni sesión que alguien tenga que volver a iniciar: se comparte el calendario con el
correo de la cuenta de servicio y listo. Los pasos están en `.env.example`.

Si Google falla, el cambio de estado igual queda guardado y la página avisa que el
evento hay que revisarlo a mano. Nunca se pierde el trabajo de quien está usando el
panel por un problema de red.

## Pendientes

- Rebuild automático al publicar contenido (webhook de Sanity → deploy hook de
  Cloudflare). Sin esto, un cambio en el panel no se ve hasta el próximo build.
- Mercado Pago, si en algún momento se cobra seña de diagnóstico.
