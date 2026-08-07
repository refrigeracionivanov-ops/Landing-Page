import type { SchemaTypeDefinition } from 'sanity';
import { bloques } from './bloques';
import { pagina, ajustes, solicitud } from './documentos';

export const schemaTypes: SchemaTypeDefinition[] = [pagina, ajustes, solicitud, ...bloques];
