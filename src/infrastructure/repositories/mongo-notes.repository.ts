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
 * Implementación MongoDB del Repositorio de Notas
 * 
 * Esta clase extiende la clase abstracta INotesRepository usando Mongoose.
 * Maneja todas las operaciones específicas de MongoDB y mapea entre
 * documentos de Mongoose y entidades de dominio.
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
     * Mapea un documento de Mongoose a una entidad de dominio Nota
     * @param doc - El documento de Mongoose a mapear
     * @returns La entidad Nota mapeada
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
     * Recupera todas las notas con filtrado y ordenamiento opcional
     * @param filters - Opciones opcionales de filtro y ordenamiento
     * @returns Promesa que resuelve a un arreglo de entidades de Nota
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
     * Recupera una sola nota por su identificador único
     * @param id - El identificador único de la nota
     * @returns Promesa que resuelve a la entidad de Nota o null si no se encuentra
     */
    async findById(id: string): Promise<Note | null> {
        const doc = await this.noteModel.findById(id).exec();
        return doc ? this.mapToEntity(doc) : null;
    }

    /**
     * Crea una nueva nota en el repositorio
     * @param data - Los datos para crear la nota
     * @returns Promesa que resuelve a la entidad de Nota creada
     */
    async create(data: CreateNoteData): Promise<Note> {
        const doc = await this.noteModel.create({
            title: data.title,
            content: data.content,
        });
        return this.mapToEntity(doc);
    }

    /**
     * Actualiza una nota existente
     * @param id - El identificador único de la nota a actualizar
     * @param data - Los datos a actualizar
     * @returns Promesa que resuelve a la entidad de Nota actualizada o null si no se encuentra
     */
    async update(id: string, data: UpdateNoteData): Promise<Note | null> {
        const doc = await this.noteModel
            .findByIdAndUpdate(id, { $set: data }, { new: true })
            .exec();
        return doc ? this.mapToEntity(doc) : null;
    }

    /**
     * Elimina una o más notas por sus identificadores
     * @param ids - Arreglo de identificadores de notas a eliminar
     * @returns Promesa que resuelve al número de notas eliminadas
     */
    async delete(ids: string[]): Promise<number> {
        const result = await this.noteModel.deleteMany({ _id: { $in: ids } }).exec();
        return result.deletedCount;
    }
}
