/**
 * Pone en espanol la interfaz de Puck.
 *
 * Puck 0.20 no tiene traducciones: los textos estan escritos en ingles dentro
 * del paquete y no hay ninguna opcion para cambiarlos. Los `label` de nuestros
 * bloques y campos si son nuestros y ya estan en espanol; lo que queda en
 * ingles es el marco: los titulos de los paneles, los botones de la barra y los
 * mensajes de las listas.
 *
 * Como es la unica pantalla que usa la persona del negocio, se traduce sobre el
 * DOM ya montado. Es un parche, y se nota: si Puck cambia un texto en una
 * version nueva, esa palabra vuelve a aparecer en ingles (no se rompe nada, solo
 * queda sin traducir). Se puede borrar entero el dia que Puck sume i18n.
 */

/** Texto visible -> texto que queremos. */
const TEXTOS: Record<string, string> = {
  Components: 'Secciones',
  Outline: 'Orden de la pagina',
  Page: 'Pagina',
  'No items': 'Todavia no hay nada',
  'Select data': 'Elegir dato',
  'Select parent': 'Ir a la seccion que la contiene',
  Search: 'Buscar',
  Copy: 'Copiar',
  Delete: 'Borrar',
  Duplicate: 'Duplicar',
  Expand: 'Abrir',
  Collapse: 'Cerrar',
};

/** Lo mismo, para los globitos de ayuda de los botones con icono. */
const TITULOS: Record<string, string> = {
  'Toggle left sidebar': 'Mostrar u ocultar el panel de la izquierda',
  'Toggle right sidebar': 'Mostrar u ocultar el panel de la derecha',
  'Toggle menu bar': 'Mostrar u ocultar la barra',
  undo: 'Deshacer',
  redo: 'Rehacer',
  'Switch to Small viewport': 'Ver como en un celular',
  'Switch to Medium viewport': 'Ver como en una tablet',
  'Switch to Large viewport': 'Ver como en una computadora',
  'Zoom viewport out': 'Alejar',
  'Zoom viewport in': 'Acercar',
  Copy: 'Copiar',
  Delete: 'Borrar',
  Duplicate: 'Duplicar',
  'Select parent': 'Ir a la seccion que la contiene',
};

/**
 * Los nombres de clase de Puck llevan un hash al final
 * (`_SidebarSection-title_8boj8_12`), asi que se buscan por la parte estable.
 */
const SELECTOR_TEXTOS = [
  '[class*="SidebarSection-title"]',
  '[class*="SidebarSection-heading"]',
  '[class*="ActionBar-label"]',
  // Los botones con icono llevan el nombre en un span oculto, que es lo que
  // lee en voz alta un lector de pantalla.
  '[class*="IconButton-title"]',
  '[class*="ArrayField-addButton"]',
  '[class*="Puck-emptyState"]',
].join(',');

// `HTMLElement` y no `ParentNode`: los tipos de Cloudflare Workers definen su
// propio `ParentNode` (el de HTMLRewriter) y gana ese, que no tiene querySelector.
function traducir(raiz: HTMLElement) {
  for (const elemento of raiz.querySelectorAll(SELECTOR_TEXTOS)) {
    const traduccion = TEXTOS[elemento.textContent?.trim() ?? ''];
    // Solo se escribe cuando hay algo que cambiar: asi la pasada siguiente no
    // encuentra nada y el observador no se dispara a si mismo en un bucle.
    if (traduccion) elemento.textContent = traduccion;
  }

  for (const elemento of raiz.querySelectorAll('[title]')) {
    const traduccion = TITULOS[elemento.getAttribute('title') ?? ''];
    if (traduccion) elemento.setAttribute('title', traduccion);
  }
}

/**
 * Traduce lo que ya esta en pantalla y lo que aparezca despues.
 *
 * React vuelve a escribir sus textos cada vez que redibuja (al elegir un bloque,
 * al abrir un panel), asi que no alcanza con traducir una vez: hay que quedarse
 * escuchando. Devuelve la funcion para dejar de observar.
 */
export function traducirInterfaz(raiz: HTMLElement): () => void {
  traducir(raiz);

  let pendiente: ReturnType<typeof setTimeout> | null = null;
  const observador = new MutationObserver(() => {
    // Varias mutaciones seguidas (un redibujado entero) se juntan en una sola
    // pasada, en vez de recorrer el DOM por cada una. Con `setTimeout` y no con
    // `requestAnimationFrame`: este ultimo no corre mientras la pestana esta en
    // segundo plano, y al volver a ella el panel aparecia a medio traducir.
    if (pendiente) return;
    pendiente = setTimeout(() => {
      pendiente = null;
      traducir(raiz);
    }, 0);
  });

  observador.observe(raiz, { childList: true, subtree: true, characterData: true });

  return () => {
    if (pendiente) clearTimeout(pendiente);
    observador.disconnect();
  };
}
