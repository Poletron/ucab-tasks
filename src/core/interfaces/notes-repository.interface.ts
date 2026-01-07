import { Note } from '../entities/note.entity';

/**
 * Filter options for querying notes
 */
export interface NotesFilterOptions {
    /**
     * Field to sort results by
     */
    sortBy?: 'title' | 'createdAt' | 'updatedAt';

    /**
     * Sort order direction
     */
    order?: 'asc' | 'desc';
}

/**
 * Data required to create a new note
 */
export interface CreateNoteData {
    title: string;
    content: string;
}

/**
 * Data for updating an existing note
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
     * Retrieves all notes with optional filtering and sorting
     * @param filters - Optional filter and sort options
     * @returns Promise resolving to array of Note entities
     */
    abstract findAll(filters?: NotesFilterOptions): Promise<Note[]>;

    /**
     * Retrieves a single note by its unique identifier
     * @param id - The unique identifier of the note
     * @returns Promise resolving to Note entity or null if not found
     */
    abstract findById(id: string): Promise<Note | null>;

    /**
     * Creates a new note in the repository
     * @param data - The data for creating the note (title and content)
     * @returns Promise resolving to the created Note entity with generated id and timestamps
     */
    abstract create(data: CreateNoteData): Promise<Note>;

    /**
     * Updates an existing note
     * @param id - The unique identifier of the note to update
     * @param data - The data to update (title and/or content)
     * @returns Promise resolving to updated Note entity or null if not found
     */
    abstract update(id: string, data: UpdateNoteData): Promise<Note | null>;

    /**
     * Deletes one or more notes by their identifiers
     * @param ids - Array of note identifiers to delete
     * @returns Promise resolving to the number of deleted notes
     */
    abstract delete(ids: string[]): Promise<number>;
}
