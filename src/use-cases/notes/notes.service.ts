import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Note } from '../../core/entities/note.entity';
import {
    INotesRepository,
    NotesFilterOptions,
} from '../../core/interfaces/notes-repository.interface';
import { CreateNoteDto, UpdateNoteDto } from './dto';

/**
 * Notes Service - Business Logic Layer
 * 
 * Handles all business logic for note operations.
 * This service is database-agnostic and depends only on the INotesRepository abstraction.
 * 
 * @example
 * ```typescript
 * const notes = await notesService.findAll({ sortBy: 'title', order: 'asc' });
 * ```
 */
@Injectable()
export class NotesService {
    constructor(
        @Inject(INotesRepository)
        private readonly notesRepository: INotesRepository,
    ) { }

    /**
     * Retrieves all notes with optional filtering
     * @param filters - Optional filter and sort options
     * @returns Promise resolving to array of Note entities
     */
    async findAll(filters?: NotesFilterOptions): Promise<Note[]> {
        return this.notesRepository.findAll(filters);
    }

    /**
     * Retrieves a single note by ID
     * @param id - The unique identifier of the note
     * @returns Promise resolving to the Note entity
     * @throws NotFoundException if note is not found
     */
    async findById(id: string): Promise<Note> {
        const note = await this.notesRepository.findById(id);
        if (!note) {
            throw new NotFoundException(`Nota con ID "${id}" no encontrada`);
        }
        return note;
    }

    /**
     * Creates a new note
     * @param createNoteDto - The data for creating the note
     * @returns Promise resolving to the created Note entity
     */
    async create(createNoteDto: CreateNoteDto): Promise<Note> {
        return this.notesRepository.create({
            title: createNoteDto.title,
            content: createNoteDto.content,
        });
    }

    /**
     * Updates an existing note
     * @param id - The unique identifier of the note to update
     * @param updateNoteDto - The data to update
     * @returns Promise resolving to the updated Note entity
     * @throws NotFoundException if note is not found
     */
    async update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
        const note = await this.notesRepository.update(id, {
            title: updateNoteDto.title,
            content: updateNoteDto.content,
        });
        if (!note) {
            throw new NotFoundException(`Nota con ID "${id}" no encontrada`);
        }
        return note;
    }

    /**
     * Deletes one or more notes
     * @param ids - Array of note IDs to delete
     * @returns Promise resolving to the number of deleted notes
     */
    async delete(ids: string[]): Promise<number> {
        return this.notesRepository.delete(ids);
    }
}
