import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

/**
 * DTO for deleting multiple notes
 */
export class DeleteNotesDto {
    /**
     * Array of note IDs to delete
     * @example ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
     */
    @ApiProperty({
        description: 'Array of note IDs to delete',
        type: [String],
        example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    })
    @IsArray()
    @ArrayNotEmpty({ message: 'Debe proporcionar al menos un ID' })
    @IsString({ each: true })
    ids: string[];
}
