import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for creating a new note
 */
export class CreateNoteDto {
    /**
     * Title of the note
     * @example "Mi primera nota"
     */
    @ApiProperty({
        description: 'Title of the note',
        example: 'Mi primera nota',
    })
    @IsString()
    @IsNotEmpty({ message: 'El título es obligatorio' })
    title: string;

    /**
     * Content/body of the note
     * @example "Este es el contenido de mi nota..."
     */
    @ApiProperty({
        description: 'Content/body of the note',
        example: 'Este es el contenido de mi nota...',
    })
    @IsString()
    @IsNotEmpty({ message: 'El contenido es obligatorio' })
    content: string;
}
