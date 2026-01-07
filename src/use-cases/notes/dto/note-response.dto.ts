import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for note list items (without content)
 */
export class NoteListItemDto {
    @ApiProperty({
        description: 'Unique identifier of the note',
        example: '507f1f77bcf86cd799439011',
    })
    id: string;

    @ApiProperty({
        description: 'Title of the note',
        example: 'Mi primera nota',
    })
    title: string;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-15T10:30:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-01-15T12:45:00.000Z',
    })
    updatedAt: Date;
}

/**
 * Response DTO for full note details (including content)
 */
export class NoteDetailDto extends NoteListItemDto {
    @ApiProperty({
        description: 'Content/body of the note',
        example: 'Este es el contenido de mi nota...',
    })
    content: string;
}

/**
 * Response DTO for delete operation
 */
export class DeleteResultDto {
    @ApiProperty({
        description: 'Number of notes deleted',
        example: 2,
    })
    deletedCount: number;
}
