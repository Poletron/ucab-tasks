import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for updating an existing note
 */
export class UpdateNoteDto {
    /**
     * Updated title of the note
     * @example "Título actualizado"
     */
    @ApiPropertyOptional({
        description: 'Updated title of the note',
        example: 'Título actualizado',
    })
    @IsString()
    @IsOptional()
    title?: string;

    /**
     * Updated content/body of the note
     * @example "Contenido actualizado de la nota..."
     */
    @ApiPropertyOptional({
        description: 'Updated content/body of the note',
        example: 'Contenido actualizado de la nota...',
    })
    @IsString()
    @IsOptional()
    content?: string;
}
