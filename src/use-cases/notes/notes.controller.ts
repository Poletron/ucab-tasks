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
 * Notes Controller - HTTP Layer
 * 
 * Handles HTTP requests for note operations.
 * This controller is "thin" - it only parses requests, validates DTOs,
 * calls the service, and returns responses.
 */
@ApiTags('Notes')
@Controller('notes')
export class NotesController {
    constructor(private readonly notesService: NotesService) { }

    /**
     * Get all notes with optional filters
     * Returns note list without content field
     */
    @Get()
    @ApiOperation({
        summary: 'Get all notes',
        description: 'Retrieves a list of all notes with optional sorting. Returns notes without content.',
    })
    @ApiResponse({
        status: 200,
        description: 'List of notes retrieved successfully',
        type: [NoteListItemDto],
    })
    async findAll(@Query() filters: NotesFilterDto): Promise<NoteListItemDto[]> {
        const notes = await this.notesService.findAll({
            sortBy: filters.sortBy,
            order: filters.order,
        });
        // Map to list items (without content)
        return notes.map((note) => ({
            id: note.id,
            title: note.title,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
        }));
    }

    /**
     * Get a single note by ID
     * Returns full note details including content
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Get note by ID',
        description: 'Retrieves a single note by its unique identifier. Returns full details including content.',
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the note',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: 200,
        description: 'Note retrieved successfully',
        type: NoteDetailDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Note not found',
    })
    async findById(@Param('id') id: string): Promise<NoteDetailDto> {
        const note = await this.notesService.findById(id);
        return {
            id: note.id,
            title: note.title,
            content: note.content,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
        };
    }

    /**
     * Create a new note
     */
    @Post()
    @ApiOperation({
        summary: 'Create a new note',
        description: 'Creates a new note with the provided title and content.',
    })
    @ApiResponse({
        status: 201,
        description: 'Note created successfully',
        type: NoteDetailDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data',
    })
    async create(@Body() createNoteDto: CreateNoteDto): Promise<NoteDetailDto> {
        const note = await this.notesService.create(createNoteDto);
        return {
            id: note.id,
            title: note.title,
            content: note.content,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
        };
    }

    /**
     * Update an existing note
     */
    @Patch(':id')
    @ApiOperation({
        summary: 'Update a note',
        description: 'Updates an existing note. Only title and content can be modified.',
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the note to update',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: 200,
        description: 'Note updated successfully',
        type: NoteDetailDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Note not found',
    })
    async update(
        @Param('id') id: string,
        @Body() updateNoteDto: UpdateNoteDto,
    ): Promise<NoteDetailDto> {
        const note = await this.notesService.update(id, updateNoteDto);
        return {
            id: note.id,
            title: note.title,
            content: note.content,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
        };
    }

    /**
     * Delete one or more notes
     */
    @Delete()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Delete notes',
        description: 'Deletes one or more notes by their IDs.',
    })
    @ApiResponse({
        status: 200,
        description: 'Notes deleted successfully',
        type: DeleteResultDto,
    })
    async delete(@Body() deleteNotesDto: DeleteNotesDto): Promise<DeleteResultDto> {
        const deletedCount = await this.notesService.delete(deleteNotesDto.ids);
        return { deletedCount };
    }
}
