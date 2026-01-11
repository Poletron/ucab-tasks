import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta para elementos de la lista de notas (sin contenido)
 */
export class NoteListItemDto {
    @ApiProperty({
        description: 'Identificador único de la nota',
        example: '507f1f77bcf86cd799439011',
    })
    id: string;

    @ApiProperty({
        description: 'Título de la nota',
        example: 'Mi primera nota',
    })
    title: string;

    @ApiProperty({
        description: 'Marca de tiempo de creación',
        example: '2024-01-15T10:30:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Marca de tiempo de última actualización',
        example: '2024-01-15T12:45:00.000Z',
    })
    updatedAt: Date;
}

/**
 * DTO de respuesta para detalles completos de la nota (incluyendo contenido)
 */
export class NoteDetailDto extends NoteListItemDto {
    @ApiProperty({
        description: 'Contenido/cuerpo de la nota',
        example: 'Este es el contenido de mi nota...',
    })
    content: string;
}

/**
 * DTO de respuesta para la operación de eliminación
 */
export class DeleteResultDto {
    @ApiProperty({
        description: 'Número de notas eliminadas',
        example: 2,
    })
    deletedCount: number;
}
