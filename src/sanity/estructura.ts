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

      S.divider(),

      S.listItem()
        .title('Solicitudes de visita')
        .schemaType('solicitud')
        .child(
          S.documentTypeList('solicitud')
            .title('Solicitudes de visita')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }]),
        ),
    ]);
