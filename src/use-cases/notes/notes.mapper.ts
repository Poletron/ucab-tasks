import { Note } from '../../core/entities/note.entity';
import { NoteListItemDto, NoteDetailDto } from './dto';

/**
 * Mapper de Notas
 * 
 * Transforma entidades de dominio a DTOs para la capa HTTP.
 * Esto separa la lógica de presentación del controlador,
 * manteniendo el controlador "delgado" y enfocado en preocupaciones HTTP.
 */
export class NotesMapper {
    /**
     * Mapea una entidad Nota a un DTO de elemento de lista (sin contenido)
     * Usado para el endpoint GET /notes
     * @param note - La entidad de dominio
     * @returns El DTO de elemento de lista
     */
    static toListItem(note: Note): NoteListItemDto {
        return {
            id: note.id,
            title: note.title,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
        };
    }

    /**
     * Mapea múltiples entidades Nota a DTOs de elementos de lista
     * @param notes - Arreglo de entidades de dominio
     * @returns Arreglo de DTOs de elementos de lista
     */
    static toListItems(notes: Note[]): NoteListItemDto[] {
        return notes.map((note) => this.toListItem(note));
    }

    /**
     * Mapea una entidad Nota a un DTO de detalle (con contenido)
     * Usado para endpoints GET /notes/:id, POST /notes, PATCH /notes/:id
     * @param note - La entidad de dominio
     * @returns El DTO de detalle
     */
    static toDetail(note: Note): NoteDetailDto {
        return {
            id: note.id,
            title: note.title,
            content: note.content,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
        };
    }
}
