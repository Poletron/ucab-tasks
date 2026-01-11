import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Note } from '../../core/entities/note.entity';
import {
    INotesRepository,
    NotesFilterOptions,
} from '../../core/interfaces/notes-repository.interface';
import { CreateNoteDto, UpdateNoteDto } from './dto';

/**
 * Servicio de Notas - Capa de Lógica de Negocio
 * 
 * Maneja toda la lógica de negocio para operaciones con notas.
 * Este servicio es agnóstico a la base de datos y depende solo de la abstracción INotesRepository.
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
     * Recupera todas las notas con filtrado opcional
     * @param filters - Opciones opcionales de filtro y ordenamiento
     * @returns Promesa que resuelve a un arreglo de entidades de Nota
     */
    async findAll(filters?: NotesFilterOptions): Promise<Note[]> {
        return this.notesRepository.findAll(filters);
    }

    /**
     * Recupera una sola nota por ID
     * @param id - El identificador único de la nota
     * @returns Promesa que resuelve a la entidad de Nota
     * @throws NotFoundException si la nota no es encontrada
     */
    async findById(id: string): Promise<Note> {
        const note = await this.notesRepository.findById(id);
        if (!note) {
            throw new NotFoundException(`Nota con ID "${id}" no encontrada`);
        }
        return note;
    }

    /**
     * Crea una nueva nota
     * @param createNoteDto - Los datos para crear la nota
     * @returns Promesa que resuelve a la entidad de Nota creada
     */
    async create(createNoteDto: CreateNoteDto): Promise<Note> {
        return this.notesRepository.create({
            title: createNoteDto.title,
            content: createNoteDto.content,
        });
    }

    /**
     * Actualiza una nota existente
     * @param id - El identificador único de la nota a actualizar
     * @param updateNoteDto - Los datos para actualizar
     * @returns Promesa que resuelve a la entidad de Nota actualizada
     * @throws NotFoundException si la nota no es encontrada
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
     * Elimina una o más notas
     * @param ids - Arreglo de IDs de notas a eliminar
     * @returns Promesa que resuelve al número de notas eliminadas
     */
    async delete(ids: string[]): Promise<number> {
        return this.notesRepository.delete(ids);
    }
}
