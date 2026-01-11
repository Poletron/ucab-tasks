import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

/**
 * Campos disponibles para ordenar notas
 */
export enum SortByField {
    TITLE = 'title',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}

/**
 * Dirección del ordenamiento
 */
export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

/**
 * DTO para filtrar y ordenar la lista de notas
 */
export class NotesFilterDto {
    /**
     * Campo por el cual ordenar las notas
     * @example "createdAt"
     */
    @ApiPropertyOptional({
        description: 'Campo por el cual ordenar las notas',
        enum: SortByField,
        example: SortByField.CREATED_AT,
    })
    @IsEnum(SortByField)
    @IsOptional()
    sortBy?: SortByField;

    /**
     * Dirección del ordenamiento
     * @example "desc"
     */
    @ApiPropertyOptional({
        description: 'Dirección del ordenamiento',
        enum: SortOrder,
        example: SortOrder.DESC,
    })
    @IsEnum(SortOrder)
    @IsOptional()
    order?: SortOrder;
}
