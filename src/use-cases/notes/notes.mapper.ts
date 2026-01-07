import { Note } from '../../core/entities/note.entity';
import { NoteListItemDto, NoteDetailDto } from './dto';

/**
 * Notes Mapper
 * 
 * Transforms domain entities to DTOs for the HTTP layer.
 * This separates the presentation logic from the controller,
 * keeping the controller "thin" and focused on HTTP concerns.
 */
export class NotesMapper {
    /**
     * Maps a Note entity to a list item DTO (without content)
     * Used for GET /notes endpoint
     * @param note - The domain entity
     * @returns The list item DTO
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
     * Maps multiple Note entities to list item DTOs
     * @param notes - Array of domain entities
     * @returns Array of list item DTOs
     */
    static toListItems(notes: Note[]): NoteListItemDto[] {
        return notes.map((note) => this.toListItem(note));
    }

    /**
     * Maps a Note entity to a detail DTO (with content)
     * Used for GET /notes/:id, POST /notes, PATCH /notes/:id
     * @param note - The domain entity
     * @returns The detail DTO
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
