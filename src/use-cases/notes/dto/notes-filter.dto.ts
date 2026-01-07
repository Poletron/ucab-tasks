import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

/**
 * Available fields for sorting notes
 */
export enum SortByField {
    TITLE = 'title',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}

/**
 * Sort order direction
 */
export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

/**
 * DTO for filtering and sorting notes list
 */
export class NotesFilterDto {
    /**
     * Field to sort by
     * @example "createdAt"
     */
    @ApiPropertyOptional({
        description: 'Field to sort notes by',
        enum: SortByField,
        example: SortByField.CREATED_AT,
    })
    @IsEnum(SortByField)
    @IsOptional()
    sortBy?: SortByField;

    /**
     * Sort order direction
     * @example "desc"
     */
    @ApiPropertyOptional({
        description: 'Sort order direction',
        enum: SortOrder,
        example: SortOrder.DESC,
    })
    @IsEnum(SortOrder)
    @IsOptional()
    order?: SortOrder;
}
