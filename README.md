# Landing de ventilación + agendamiento de visitas

Landing por bloques editable desde `/admin`, con formulario de solicitud de visita
técnica. Pensada para que la mantenga alguien sin formación técnica.

- **Astro** — sitio estático, salvo `/api/reservar`
- **Sanity** — contenido, panel de administración e historial de solicitudes
- **Cloudflare Pages** — hosting (su plan gratuito permite uso comercial)
- **Tailwind v4** — estilos, con los tokens cerrados en `src/styles/global.css`

## Puesta en marcha

**1. Crear el proyecto en Sanity**

Entrá a [sanity.io/manage](https://sanity.io/manage), creá un proyecto y un dataset
llamado `production`. Anotá el *Project ID*.

En **API → Tokens**, generá un token con permiso de **Editor**. Se ve una sola vez.

**2. Configurar las variables**

```bash
cp .env.example .env
```

Completá `PUBLIC_SANITY_PROJECT_ID` y `SANITY_WRITE_TOKEN`.

**3. Autorizar el navegador**

En **API → CORS origins** de Sanity, agregá `http://localhost:4321` con credenciales
habilitadas. Sin esto el panel no carga.

**4. Cargar contenido de ejemplo**

```bash
npm run sembrar
```

Crea los ajustes del negocio y una página de inicio con las 11 secciones ya armadas,
con textos genéricos listos para reemplazar. No sube imágenes: esas se cargan desde
el panel.

**5. Levantar**

```bash
npm run dev
```

- Sitio → http://localhost:4321
- Panel → http://localhost:4321/admin

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run check` | Chequeo de tipos |
| `npm run sembrar` | Carga el contenido de ejemplo |

## Cómo agregar un bloque nuevo

Tres pasos, siempre los mismos:

1. Definí el esquema en `src/sanity/schemaTypes/bloques.ts` y sumalo al array `bloques`
2. Creá el componente en `src/components/bloques/`
3. Agregá la línea correspondiente en el mapa de `src/components/Bloques.astro`

Aparece solo en el menú de "Agregar sección" del panel.

## Decisiones de diseño

**Los colores y las tipografías no se exponen en el panel.** Solo se editan textos,
imágenes, links y el orden de las secciones. Es deliberado: es lo que hace que la
página siga viéndose bien sin intervención de un desarrollador.

**Las visitas se piden por franja, no por hora exacta.** Un técnico que viaja no
puede comprometer las 14:00 sin saber dónde termina el trabajo anterior. El cliente
elige día y franja, el negocio confirma la hora por WhatsApp. El cupo por franja se
configura en *Ajustes del negocio*.

**La fecha mínima se calcula en el navegador, no al construir el sitio.** El sitio es
estático: si se calculara en el build, quedaría congelada en la fecha del deploy. El
servidor vuelve a validarla en `src/pages/api/reservar.ts`, porque el navegador se
puede saltear.

**Las promociones vencen solas.** El filtro por `vigenciaHasta` está en la consulta
GROQ. Nadie tiene que acordarse de borrar la promo de julio en agosto.

**Las fotos de los equipos van por WhatsApp, no por el formulario.** Subir archivos
exigiría exponer un token de escritura o montar un proxy con límites de tamaño, y el
cliente ya tiene las fotos en el teléfono donde está WhatsApp. La pantalla de éxito
ofrece el botón.

## Despliegue en Cloudflare Pages

Conectá el repositorio y usá:

- Build: `npm run build`
- Directorio de salida: `dist`

Cargá las mismas variables de `.env` en el panel de Cloudflare, y agregá el dominio
de producción a los **CORS origins** de Sanity.

> El plan Hobby de Vercel prohíbe el uso comercial. Por eso Cloudflare.

## Pendientes

- Rebuild automático al publicar contenido (webhook de Sanity → deploy hook de Cloudflare).
  Sin esto, un cambio en el panel no se ve hasta el próximo build.
- Espejar las solicitudes a Google Calendar para que se administren desde ahí.
- Mercado Pago, si en algún momento se cobra seña de diagnóstico.
