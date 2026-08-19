# Guía para administrar la página

Hay **tres direcciones** que vas a usar. No hace falta instalar nada; funcionan desde
la computadora o el celular.

| Dirección | Para qué |
|---|---|
| **tudominio.com/solicitudes** | Ver quién pidió una visita |
| **tudominio.com/administrador** | Cambiar textos y fotos de la página |
| **tudominio.com/ajustes** | Cambiar el teléfono, el horario y los cupos |

Las tres piden entrar: o con tu correo, o escribiendo una clave, según cómo esté
configurado. Tienen los datos de los clientes y los textos del sitio, así que no
quedan abiertas a cualquiera.

> Hay una cuarta, **tudominio.com/admin**, que ya casi no vas a necesitar: quedó
> solo para ver el historial de versiones si algo se rompe.

---

## Las tres cosas que vas a hacer siempre

### 1. Ver quién pidió una visita

Entrá a **tudominio.com/solicitudes**.

Aparecen ordenadas de la más reciente a la más vieja. Cada una trae el nombre,
teléfono, dirección, qué necesita y para qué día la pidió. Arriba tenés los filtros
por estado, con la cantidad de cada uno.

Cada solicitud tiene dos botones: **WhatsApp**, que abre el chat con ese cliente ya
listo para escribir, y el **teléfono**, que llama directo.

A medida que la vas atendiendo, cambiá el **Estado** y apretá *Guardar*:

| Estado | Cuándo ponerlo |
|---|---|
| Nueva | Recién llegó, nadie la miró |
| Contactada | Ya le escribiste o llamaste |
| Agendada | Quedó confirmado día y hora |
| Completada | El técnico ya fue |
| Cancelada | No se hace |

> Los datos del cliente no se pueden editar: quedan como los escribió él. Si querés
> anotar algo, usá el campo **Notas internas**.

**Importante:** las franjas que ya tienen el cupo lleno dejan de ofrecerse solas en
la web. El cupo se configura en Ajustes (ver abajo). Las solicitudes canceladas
liberan el lugar.

**Cuando pasás una a "Agendada", aparece sola en tu Google Calendar**, con la
dirección y el teléfono del cliente adentro. A partir de ahí podés trabajar desde el
calendario de siempre: te suena el celular y lo ves junto al resto de tu día.

Si después la pasás a "Cancelada", el evento se borra solo. Si la pasás a
"Completada", queda como registro de que la visita se hizo.

> No borres ni muevas el evento a mano desde Google Calendar: el sistema lo vuelve a
> acomodar la próxima vez que toques esa solicitud. Cambiá el estado acá y el
> calendario se actualiza solo.

**Cuando la pasás a "Completada" aparece el botón *Pedir reseña en Google*.** Abre el
chat de WhatsApp con ese cliente, con el mensaje ya escrito y el enlace a tu perfil
de Google. Vos solo apretás enviar.

El botón queda marcado con la fecha en que se la pediste, para que no le insistas dos
veces a la misma persona. Si querés volver a pedirla, se puede: sigue funcionando.

> Las reseñas en Google valen más que las de tu propia web: influyen en si aparecés
> cuando alguien busca "técnico aire acondicionado" en tu zona, y la gente les cree
> más porque no las escribís vos. Por eso el botón lleva ahí y no a un formulario
> nuestro.
>
> El momento importa: pedirla el mismo día de la visita, cuando el equipo recién
> quedó andando, funciona mucho mejor que una semana después.

### 2. Cambiar textos y fotos de la página

Entrá a **tudominio.com/administrador**. Vas a ver tu página en el medio, tal como la
ve un cliente, y dos columnas a los costados.

- **Para editar** una sección, hacé clic encima. A la derecha aparecen sus campos
- **Para agregar** una sección, arrastrala de la lista **Secciones** (izquierda) al
  lugar de la página donde la querés
- **Para mover** una sección, arrastrala en la lista **Orden de la página**
- **Para borrar o duplicar** una sección, elegila y usá los botones que aparecen
  sobre ella

Cuando terminás, apretá **Guardar**, arriba a la derecha. El sitio se actualiza en el
momento: recargá la página pública y ya está el cambio.

> **Deshacer solo funciona antes de guardar.** Las flechas de arriba deshacen lo que
> hiciste en esta sesión. Una vez que guardaste, para volver atrás hay que usar el
> historial de versiones (más abajo).

**Las fotos** se suben desde el mismo campo donde se ven. Cada una te pide una
descripción corta: escribila, es lo que lee Google y lo que escucha alguien que usa un
lector de pantalla. Con tres o cuatro palabras alcanza.

### 3. Cambiar el teléfono, el horario o los cupos

Entrá a **tudominio.com/ajustes**, o desde el editor con el enlace *Ajustes del
negocio*, arriba a la derecha.

Ahí está el nombre, el logo, el teléfono, el WhatsApp, el correo, la dirección y el
horario. Se usan en toda la página a la vez: lo cambiás una vez y se actualiza en
todos lados.

Más abajo, en **Cuando recibís visitas**:

- **Las franjas horarias** — las opciones que ve el cliente, y cuántas visitas
  aceptás por día en cada una. Podés agregar y quitar
- **Días mínimos de anticipación** — con 1, lo más pronto que alguien puede pedir es
  mañana

En **Reseñas en Google** va el enlace corto que da tu perfil de negocio en Google
para pedir reseñas, y el mensaje que se le manda al cliente. Donde escribas
`{nombre}` se pone su nombre. **Sin ese enlace cargado, el botón de pedir reseña no
aparece en Solicitudes.**

Cuando termines, **Guardar** arriba a la derecha.

> **Escribí las horas dentro del nombre de la franja.** De "Mañana (8:00 - 12:00)" el
> sistema saca el horario del evento de Google Calendar. Si no las encuentra, agenda
> la visita como de día completo.

---

## Cosas útiles que conviene saber

**Las promociones vencen solas.** Si le ponés fecha en *Vigente hasta*, desaparecen
de la web al día siguiente sin que hagas nada. Si no le ponés fecha, quedan para
siempre.

**Si borrás todas las promos, la sección desaparece entera.** No queda un espacio
vacío ni un título suelto.

**Los distritos del formulario salen de la sección "Zonas donde atendemos".** Si
agregás un distrito ahí, aparece solo en la lista desplegable del formulario. No hay
que cargarlo dos veces.

**Si algo se rompió, no borres nada.** El sistema guarda todas las versiones
anteriores del contenido. Entrá a `/admin`, abrí **Páginas → Inicio**, y en el ícono
de reloj arriba a la derecha podés ver el historial y volver a como estaba antes. Es
lo único para lo que sigue haciendo falta ese panel.

**Las solicitudes de los clientes no aparecen en ninguno de los dos paneles.** Están
aparte, en `/solicitudes`, justamente porque tienen datos personales y ese lugar está
protegido con inicio de sesión.

---

## Lo que NO se puede cambiar desde acá

Los colores, las tipografías y la distribución de la página.

Es a propósito. Así la página sigue viéndose bien con el paso del tiempo sin que
tengas que preocuparte. Si necesitás un cambio de esos, pedíselo a quien la desarrolló.
