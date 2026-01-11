import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para crear una nueva nota
 */
export class CreateNoteDto {
    /**
     * Título de la nota
     * @example "Mi primera nota"
     */
    @ApiProperty({
        description: 'Título de la nota',
        example: 'Mi primera nota',
    })
    @IsString()
    @IsNotEmpty({ message: 'El título es obligatorio' })
    title: string;

    /**
     * Contenido/cuerpo de la nota
     * @example "Este es el contenido de mi nota..."
     */
    @ApiProperty({
        description: 'Contenido/cuerpo de la nota',
        example: 'Este es el contenido de mi nota...',
    })
    @IsString()
    @IsNotEmpty({ message: 'El contenido es obligatorio' })
    content: string;
}
