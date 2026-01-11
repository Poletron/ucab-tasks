import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { NotesMapper } from './notes.mapper';
import {
    CreateNoteDto,
    UpdateNoteDto,
    NotesFilterDto,
    DeleteNotesDto,
    NoteListItemDto,
    NoteDetailDto,
    DeleteResultDto,
} from './dto';

/**
 * Controlador de Notas - Capa HTTP
 * 
 * Maneja peticiones HTTP para operaciones con notas.
 * Este controlador es "delgado" - solo parsea peticiones, valida DTOs,
 * llama al servicio y usa el mapper para transformar respuestas.
 */
@ApiTags('Notas')
@Controller('notes')
export class NotesController {
    constructor(private readonly notesService: NotesService) { }

    /**
     * Obtener todas las notas con filtros opcionales
     * Retorna lista de notas sin el campo de contenido
     */
    @Get()
    @ApiOperation({
        summary: 'Obtener todas las notas',
        description:
            'Recupera una lista de todas las notas con ordenamiento opcional. Retorna notas sin contenido.',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de notas recuperada exitosamente',
        type: [NoteListItemDto],
    })
    async findAll(@Query() filters: NotesFilterDto): Promise<NoteListItemDto[]> {
        const notes = await this.notesService.findAll({
            sortBy: filters.sortBy,
            order: filters.order,
        });
        return NotesMapper.toListItems(notes);
    }

    /**
     * Obtener una sola nota por ID
     * Retorna detalles completos incluyendo contenido
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Obtener nota por ID',
        description:
            'Recupera una sola nota por su identificador único. Retorna detalles completos incluyendo contenido.',
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único de la nota',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: 200,
        description: 'Nota recuperada exitosamente',
        type: NoteDetailDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Nota no encontrada',
    })
    async findById(@Param('id') id: string): Promise<NoteDetailDto> {
        const note = await this.notesService.findById(id);
        return NotesMapper.toDetail(note);
    }

    /**
     * Crear una nueva nota
     */
    @Post()
    @ApiOperation({
        summary: 'Crear una nueva nota',
        description: 'Crea una nueva nota con el título y contenido proporcionados.',
    })
    @ApiResponse({
        status: 201,
        description: 'Nota creada exitosamente',
        type: NoteDetailDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos',
    })
    async create(@Body() createNoteDto: CreateNoteDto): Promise<NoteDetailDto> {
        const note = await this.notesService.create(createNoteDto);
        return NotesMapper.toDetail(note);
    }

    /**
     * Actualizar una nota existente
     */
    @Patch(':id')
    @ApiOperation({
        summary: 'Actualizar una nota',
        description:
            'Actualiza una nota existente. Solo el título y el contenido pueden ser modificados.',
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único de la nota a actualizar',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: 200,
        description: 'Nota actualizada exitosamente',
        type: NoteDetailDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Nota no encontrada',
    })
    async update(
        @Param('id') id: string,
        @Body() updateNoteDto: UpdateNoteDto,
    ): Promise<NoteDetailDto> {
        const note = await this.notesService.update(id, updateNoteDto);
        return NotesMapper.toDetail(note);
    }

    /**
     * Eliminar una o más notas
     */
    @Delete()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Eliminar notas',
        description: 'Elimina una o más notas por sus IDs.',
    })
    @ApiResponse({
        status: 200,
        description: 'Notas eliminadas exitosamente',
        type: DeleteResultDto,
    })
    async delete(
        @Body() deleteNotesDto: DeleteNotesDto,
    ): Promise<DeleteResultDto> {
        const deletedCount = await this.notesService.delete(deleteNotesDto.ids);
        return { deletedCount };
    }
}
