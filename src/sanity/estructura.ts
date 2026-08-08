import type { StructureResolver } from 'sanity/structure';

/**
 * Menu lateral del panel.
 *
 * "Ajustes del negocio" se abre como documento unico (singleton): no hay boton
 * de "crear nuevo", asi nadie termina con dos telefonos distintos sin darse cuenta.
 */
export const estructura: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.listItem()
        .title('Ajustes del negocio')
        .id('ajustes')
        .child(S.document().schemaType('ajustes').documentId('ajustes').title('Ajustes del negocio')),

      S.divider(),

      S.listItem()
        .title('Paginas')
        .schemaType('pagina')
        .child(S.documentTypeList('pagina').title('Paginas')),
    ]);

// Las solicitudes de visita NO estan en este panel. Viven en Cloudflare D1 y se
// administran en /solicitudes, detras de Cloudflare Access.
//
// El motivo: el plan gratuito de Sanity solo permite datasets publicos, y el
// project ID va embebido en el HTML del sitio. Cualquiera podria leer los
// nombres, telefonos y direcciones de los clientes.
