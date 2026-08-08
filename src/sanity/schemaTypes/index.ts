import type { SchemaTypeDefinition } from 'sanity';
import { bloques } from './bloques';
import { pagina, ajustes } from './documentos';

export const schemaTypes: SchemaTypeDefinition[] = [pagina, ajustes, ...bloques];
