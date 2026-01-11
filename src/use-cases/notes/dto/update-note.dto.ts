import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO para actualizar una nota existente
 */
export class UpdateNoteDto {
    /**
     * Título actualizado de la nota
     * @example "Título actualizado"
     */
    @ApiPropertyOptional({
        description: 'Título actualizado de la nota',
        example: 'Título actualizado',
    })
    @IsString()
    @IsOptional()
    title?: string;

    /**
     * Contenido/cuerpo actualizado de la nota
     * @example "Contenido actualizado de la nota..."
     */
    @ApiPropertyOptional({
        description: 'Contenido/cuerpo actualizado de la nota',
        example: 'Contenido actualizado de la nota...',
    })
    @IsString()
    @IsOptional()
    content?: string;
}
