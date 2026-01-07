import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { Note } from '../../core/entities/note.entity';
import {
    INotesRepository,
    NotesFilterOptions,
    CreateNoteData,
    UpdateNoteData,
} from '../../core/interfaces/notes-repository.interface';
import { NoteSchema, NoteDocument } from '../persistence/note.schema';

/**
 * MongoDB implementation of the Notes Repository
 * 
 * This class extends the INotesRepository abstract class using Mongoose.
 * It handles all MongoDB-specific operations and maps between
 * Mongoose documents and domain entities.
 * 
 * @extends {INotesRepository}
 */
@Injectable()
export class MongoNotesRepository extends INotesRepository {
    constructor(
        @InjectModel(NoteSchema.name)
        private readonly noteModel: Model<NoteDocument>,
    ) {
        super();
    }

    /**
     * Maps a Mongoose document to a domain Note entity
     * @param doc - The Mongoose document to map
     * @returns The mapped Note entity
     */
    private mapToEntity(doc: NoteDocument): Note {
        return new Note({
            id: doc._id.toString(),
            title: doc.title,
            content: doc.content,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    /**
     * Retrieves all notes with optional filtering and sorting
     * @param filters - Optional filter and sort options
     * @returns Promise resolving to array of Note entities
     */
    async findAll(filters?: NotesFilterOptions): Promise<Note[]> {
        const sortField = filters?.sortBy ?? 'createdAt';
        const sortOrder: SortOrder = filters?.order === 'asc' ? 1 : -1;

        const docs = await this.noteModel
            .find()
            .sort({ [sortField]: sortOrder })
            .exec();

        return docs.map((doc) => this.mapToEntity(doc));
    }

    /**
     * Retrieves a single note by its unique identifier
     * @param id - The unique identifier of the note
     * @returns Promise resolving to Note entity or null if not found
     */
    async findById(id: string): Promise<Note | null> {
        const doc = await this.noteModel.findById(id).exec();
        return doc ? this.mapToEntity(doc) : null;
    }

    /**
     * Creates a new note in the repository
     * @param data - The data for creating the note
     * @returns Promise resolving to the created Note entity
     */
    async create(data: CreateNoteData): Promise<Note> {
        const doc = await this.noteModel.create({
            title: data.title,
            content: data.content,
        });
        return this.mapToEntity(doc);
    }

    /**
     * Updates an existing note
     * @param id - The unique identifier of the note to update
     * @param data - The data to update
     * @returns Promise resolving to updated Note entity or null if not found
     */
    async update(id: string, data: UpdateNoteData): Promise<Note | null> {
        const doc = await this.noteModel
            .findByIdAndUpdate(id, { $set: data }, { new: true })
            .exec();
        return doc ? this.mapToEntity(doc) : null;
    }

    /**
     * Deletes one or more notes by their identifiers
     * @param ids - Array of note identifiers to delete
     * @returns Promise resolving to the number of deleted notes
     */
    async delete(ids: string[]): Promise<number> {
        const result = await this.noteModel.deleteMany({ _id: { $in: ids } }).exec();
        return result.deletedCount;
    }
}
