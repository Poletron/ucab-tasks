import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

/**
 * DTO para eliminar múltiples notas
 */
export class DeleteNotesDto {
    /**
     * Arreglo de IDs de notas para eliminar
     * @example ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
     */
    @ApiProperty({
        description: 'Arreglo de IDs de notas para eliminar',
        type: [String],
        example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    })
    @IsArray()
    @ArrayNotEmpty({ message: 'Debe proporcionar al menos un ID' })
    @IsString({ each: true })
    ids: string[];
}
