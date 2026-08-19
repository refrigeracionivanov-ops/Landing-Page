# Landing de ventilación + agendamiento de visitas

Landing por bloques editable desde `/administrador`, con formulario de solicitud de
visita técnica. Pensada para que la mantenga alguien sin formación técnica.

- **Astro** — la portada, el editor, `/solicitudes` y los endpoints se renderizan en
  el servidor; el resto es estático
- **Sanity** — almacena el contenido de la landing
- **Puck** — el editor visual de `/administrador`
- **Cloudflare D1** — solicitudes de visita (datos personales de clientes)
- **Cloudflare Access** — protege `/solicitudes` y `/administrador`
- **Google Calendar** — espejo de las visitas agendadas (opcional)
- **Cloudflare Workers** — hosting (su plan gratuito permite uso comercial)
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
- Editor de la página → http://localhost:4321/administrador
- Ajustes del negocio → http://localhost:4321/ajustes
- Historial de versiones → http://localhost:4321/admin
- Solicitudes → http://localhost:4321/solicitudes

> En desarrollo `/administrador` y `/solicitudes` **no están protegidas** — Cloudflare
> Access solo existe en producción. Se avisa por consola cada vez que se abren.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run check` | Chequeo de tipos |
| `npm run desplegar` | Compila y publica el Worker |
| `npm run sembrar` | Carga contenido de ejemplo en Sanity |
| `npm run fotos` | Rellena con marcadores los huecos de imagen vacíos |
| `npm run tipos` | Regenera los tipos de los bindings de Cloudflare |
| `npm run db:migrar` | Aplica migraciones a la base local |
| `npm run db:migrar:prod` | Aplica migraciones a la base real |

Corré `npm run tipos` cada vez que cambies `wrangler.jsonc`.

## Cómo agregar un bloque nuevo

Un bloque vive en cuatro lugares, y los cuatro tienen que coincidir:

1. El esquema en `src/sanity/schemaTypes/bloques.ts`, sumado al array `bloques`
2. El componente en `src/components/bloques/`, como `.tsx` — lo usan tanto el sitio
   publicado como la vista previa del editor
3. Una línea en el mapa de `src/components/Bloques.astro` (lo que ve el visitante)
4. Una entrada en `src/editor/configuracion.tsx` con sus campos, y el nombre en
   castellano en la tabla `TIPOS` de `src/editor/adaptador.ts`

Esa tabla `TIPOS` es además la lista blanca que usa `/api/guardar`: un bloque que no
figure ahí se rechaza al guardar.

## Decisiones de diseño

**Los colores y las tipografías no se exponen en el panel.** Solo se editan textos,
imágenes, links y el orden de las secciones. Es lo que hace que la página siga
viéndose bien sin intervención de un desarrollador.

**Las visitas se piden por franja, no por hora exacta.** Un técnico que viaja no
puede comprometer las 14:00 sin saber dónde termina el trabajo anterior. El cliente
elige día y franja, el negocio confirma la hora por WhatsApp. El cupo por franja se
configura en *Ajustes del negocio*, en Sanity.

**La portada se renderiza en cada visita, no al compilar.** Antes era estática y el
HTML quedaba congelado en el deploy: se guardaba desde el editor y el sitio seguía
mostrando lo viejo hasta el siguiente build. Con un editor en vivo eso no se sostiene
— lo que se guarda tiene que verse.

**El token de escritura de Sanity no sale del servidor.** El editor manda el contenido
a `/api/guardar` y `/api/imagen`, que validan quién pide y recién entonces escriben.
Si el navegador tuviera el token, cualquiera que abriera el código fuente podría
reescribir el sitio.

**La fecha mínima se calcula en el navegador, no al construir el sitio.** Si se
calculara en el build quedaría congelada en la fecha del deploy. El servidor la vuelve
a validar en `src/pages/api/reservar.ts`, porque el navegador se puede saltear.

**El teléfono se pide con el código de país separado.** Con el número suelto no se
puede saber si "11 4567-8900" es de Buenos Aires, y el enlace de WhatsApp del panel
abría un chat con un número inexistente — que es la peor forma de fallar, porque
parece que funcionó. `src/lib/telefono.ts` traduce lo que la gente escribe (`011`,
el `15`, con o sin código) al formato que pide `wa.me`, con el 9 que Argentina exige
para móviles. Sigue funcionando con las solicitudes cargadas antes del selector.

**El formulario público tiene tres frenos, no uno.** El campo trampa atrapa al bot
tonto; el límite por IP (`ratelimits` en `wrangler.jsonc`, tres por minuto) frena al
que insiste; y el cupo por franja pone un techo a lo que puede entrar en un día aunque
todo lo anterior falle. Si el limitador no responde, se deja pasar: es una defensa, no
la puerta, y un problema en Cloudflare no puede dejar al negocio sin recibir pedidos.

**El spam es un estado, no un borrado.** Sale de la lista y libera el cupo de la
franja, pero la fila queda. Un clic equivocado sobre un cliente real se deshace; un
`DELETE`, no. El vaciado explícito es el único borrado del sistema.

**Las promociones vencen solas.** El filtro por `vigenciaHasta` está en la consulta
GROQ.

**Los huecos de imagen se rellenan con marcadores, no con fotos de banco.** Un
marcador dice que falta una foto; una foto de stock hace creer que así trabaja el
negocio, y en un rubro donde el cliente no puede juzgar la técnica, eso es peor que un
espacio vacío. `npm run fotos` los dibuja con la paleta del sitio y solo completa lo
que está vacío, así correrlo de nuevo no pisa material real.

**Las fotos de los equipos van por WhatsApp, no por el formulario.** Subir archivos
exigiría exponer un token de escritura o montar un proxy con límites de tamaño, y el
cliente ya tiene las fotos en el teléfono donde está WhatsApp.

**El formulario de agendamiento es el único bloque que llega al navegador.** Los
demás se renderizan a HTML y ahí termina su trabajo. Ese lleva `client:load` en
`Bloques.astro` — no `client:visible`, aunque esté al final de la página. Con
`visible`, React empieza a descargarse recién cuando el formulario entra en pantalla,
o sea justo cuando alguien lo va a usar; hasta que termina, el botón "Siguiente" es
HTML sin nadie escuchando el clic. Los botones además llegan deshabilitados del
servidor y se encienden al montar: la ventana sigue existiendo, pero se ve.

**El horario y la dirección se traducen a schema.org, no se piden dos veces.** El
dueño escribe "Lunes a sábado, 8:00 a 18:00" porque es lo que se muestra en la página;
Google solo entiende `Mo-Sa 08:00-18:00`. `src/lib/schema.ts` traduce, y cuando no
puede omite la propiedad: un dato mal formado no es mejor que ninguno. Los barrios de
la sección de cobertura alimentan `areaServed`, que es lo que conecta el sitio con la
búsqueda "service de aire acondicionado en Belgrano".

**`robots.txt` y `sitemap.xml` se generan en cada pedido.** No son archivos estáticos
porque las dos cosas necesitan la URL absoluta del sitio, y esa cambia el día que haya
dominio propio. Así no hay nada que acordarse de actualizar.

**El token de Access se verifica aunque Cloudflare ya filtre en el borde.** La URL
interna del deployment (`*.workers.dev`) puede quedar accesible sin pasar por Access.
`src/lib/acceso.ts` valida la firma contra las claves públicas del equipo.

## Despliegue

El sitio corre como un Worker de Cloudflare, con los archivos estáticos servidos
desde el mismo deployment. Se publica a mano desde la máquina:

```bash
npm run desplegar
```

El comando corre desde la carpeta del proyecto: wrangler saca el nombre del Worker
del `wrangler.jsonc` que hay ahí. Desde otra carpeta falla con *Required Worker name
missing*, y se arregla con `--name landing-ventilacion`.

Eso compila y sube. La configuración del Worker la genera el adapter en
`dist/server/wrangler.json` a partir de `wrangler.jsonc`, así que los bindings (la
base D1) viajan solos.

Las variables sensibles **no** salen del `.env`: se cargan una vez como secretos del
Worker y quedan ahí entre despliegues.

```bash
npx wrangler secret list
npx wrangler secret put NOMBRE_DE_LA_VARIABLE
```

Las `PUBLIC_*` son la excepción: se hornean en el build, así que tienen que estar en
el `.env` de la máquina que compila.

La primera vez, además: `npm run db:migrar:prod`.

### Despliegue automático desde GitHub

Con **Workers Builds** conectado al repositorio, cada push a `main` compila y publica
solo. Se configura en el panel de Cloudflare: Workers & Pages → el Worker → Settings
→ Builds → Connect.

| Campo | Valor |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | (vacío) |

Las dos variables `PUBLIC_*` hay que cargarlas como **variables de build**. No están
en el repositorio — viven en el `.env`, que está en `.gitignore` — y sin ellas el
build falla al validar el esquema de `astro:env`. Falla ruidoso a propósito: es
preferible eso a publicar un sitio que no puede leer su contenido.

Los secretos del Worker **no** se tocan: viven en Cloudflare y sobreviven a cada
despliegue. No hacen falta en el build.

La versión de Node la fija `.nvmrc`. Las migraciones de D1 siguen siendo manuales:
un cambio de esquema que se aplica solo en un push es la clase de cosa que borra una
columna un martes.

### Proteger `/solicitudes` y `/administrador`

**Hoy están detrás de `CLAVE_EDITOR`**, la clave compartida que se canjea por una
cookie de 12 horas en `/entrar`. Es lo que hay mientras el sitio viva en un
`*.workers.dev`: Cloudflare Access solo funciona sobre un dominio propio. Es más
débil a propósito — una sola clave para todos, sin registro de quién entró y sin
poder revocar a una persona sola.

**Cuando haya dominio propio**, en **Zero Trust → Access → Applications**, creá una
aplicación self-hosted por cada ruta (`solicitudes` y `administrador`), con la
política de los correos que deban entrar. En cuanto existan las dos variables de
Access, la rama de la clave deja de usarse sola.

En la pestaña *Overview* de la aplicación está el **Application Audience (AUD) Tag**.
Ese valor va en `CF_ACCESS_AUD`, y tu dominio de equipo
(`algo.cloudflareaccess.com`) en `CF_ACCESS_TEAM_DOMAIN`.

> Sin ninguna de las dos protecciones — ni Access ni clave — las páginas devuelven
> 403 en producción. Es a propósito: es preferible que no carguen a que muestren
> datos de clientes sin verificar quién entra.

## Resenas: se piden para Google, no se guardan acá

El bloque de testimonios muestra texto que escribe el dueño. No hay formulario público
para que un cliente deje una reseña, y es a propósito.

Para un servicio local, una reseña en Google Business Profile vale más que una en el
propio sitio: pesa en el ranking local y la gente le cree más justamente porque el
negocio no la controla. Un formulario propio, además, arrastra moderación, spam y la
sospecha razonable de que las reseñas están elegidas.

Así que el sistema solo se ocupa del pedido. Cuando una solicitud pasa a `completada`,
`/solicitudes` muestra un botón que abre WhatsApp con ese cliente, el mensaje ya
escrito y el enlace de Google al final. El enlace y el mensaje se configuran en
`/ajustes`; sin enlace, el botón no aparece.

`resena_pedida_en` (migración `0003`) guarda cuándo se pidió. No guarda la reseña —
esa vive en Google — solo evita pedírsela dos veces a la misma persona. Volver a
pedirla sigue siendo posible: es una marca, no un candado.

El destino de WhatsApp lo arma el servidor, no el navegador: ahí están el teléfono del
cliente y el enlace del negocio, y el formulario solo manda el id.

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

**El Studio de Sanity sigue montado en `/admin` por una sola razón: el historial de
versiones.** Sanity guarda cada revisión y el Studio es lo único que sabe mostrarlas.

Para poder sacarlo hay que reemplazarlo. Dos caminos: leer el historial de Sanity por
API y dibujarlo, verificando antes cuánta retención da el plan gratuito; o guardar las
versiones nosotros en D1 — antes de sobrescribir, apilar la anterior y conservar las
últimas veinte. El segundo no depende del plan de nadie y cubre el caso real, que es
"toqué algo, quedó feo, quiero lo de antes".

Sacarlo se lleva unas 80 líneas de `astro.config.mjs` que existen solo por él: el
parche del bug de rutas en Windows, el plugin que evita que el panel quede en blanco
tras reoptimizar dependencias, y la lista de dependencias CommonJS. Y unos 9 MB de los
9,3 MB del build — que no le pesan a ningún visitante, porque solo se descargan en
`/admin`, pero sí a cada compilación.

**Mercado Pago**, si en algún momento se cobra seña de diagnóstico.
