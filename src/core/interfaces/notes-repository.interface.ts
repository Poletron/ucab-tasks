import { Note } from '../entities/note.entity';

/**
 * Opciones de filtrado para consultar notas
 */
export interface NotesFilterOptions {
    /**
     * Campo por el cual ordenar los resultados
     */
    sortBy?: 'title' | 'createdAt' | 'updatedAt';

    /**
     * Dirección del ordenamiento
     */
    order?: 'asc' | 'desc';
}

/**
 * Datos requeridos para crear una nueva nota
 */
export interface CreateNoteData {
    title: string;
    content: string;
}

/**
 * Datos para actualizar una nota existente
 */
export interface UpdateNoteData {
    title?: string;
    content?: string;
}

/**
 * Notes Repository Abstract Class
 * 
 * Defines the contract for note persistence operations.
 * Using abstract class instead of interface to support dependency injection
 * with emitDecoratorMetadata in TypeScript strict mode.
 * 
 * Implementations can use MongoDB, PostgreSQL, file system, or any other storage.
 * The business logic layer depends only on this abstraction, not on concrete implementations.
 * 
 * @example
 * ```typescript
 * // In the module
 * providers: [
 *   { provide: INotesRepository, useClass: MongoNotesRepository }
 * ]
 * 
 * // In the service
 * constructor(private readonly notesRepository: INotesRepository)
 * ```
 */
export abstract class INotesRepository {
    /**
     * Recupera todas las notas con filtrado y ordenamiento opcional
     * @param filters - Opciones opcionales de filtro y ordenamiento
     * @returns Promesa que resuelve a un arreglo de entidades de Nota
     */
    abstract findAll(filters?: NotesFilterOptions): Promise<Note[]>;

    /**
     * Recupera una sola nota por su identificador único
     * @param id - El identificador único de la nota
     * @returns Promesa que resuelve a la entidad de Nota o null si no se encuentra
     */
    abstract findById(id: string): Promise<Note | null>;

    /**
     * Crea una nueva nota en el repositorio
     * @param data - Los datos para crear la nota (título y contenido)
     * @returns Promesa que resuelve a la entidad de Nota creada con id y marcas de tiempo generados
     */
    abstract create(data: CreateNoteData): Promise<Note>;

    /**
     * Actualiza una nota existente
     * @param id - El identificador único de la nota a actualizar
     * @param data - Los datos para actualizar (título y/o contenido)
     * @returns Promesa que resuelve a la entidad de Nota actualizada o null si no se encuentra
     */
    abstract update(id: string, data: UpdateNoteData): Promise<Note | null>;

    /**
     * Elimina una o más notas por sus identificadores
     * @param ids - Arreglo de identificadores de notas a eliminar
     * @returns Promesa que resuelve al número de notas eliminadas
     */
    abstract delete(ids: string[]): Promise<number>;
}
