import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { INotesRepository } from '../../core/interfaces/notes-repository.interface';
import { Note } from '../../core/entities/note.entity';

/**
 * Unit tests for NotesService
 * 
 * These tests verify the business logic layer in isolation
 * by mocking the repository dependency.
 */
describe('NotesService', () => {
    let service: NotesService;
    let mockRepository: jest.Mocked<INotesRepository>;

    // Sample test data
    const mockNote = new Note({
        id: '507f1f77bcf86cd799439011',
        title: 'Test Note',
        content: 'Test content',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
    });

    const mockNotes = [
        mockNote,
        new Note({
            id: '507f1f77bcf86cd799439012',
            title: 'Another Note',
            content: 'Another content',
            createdAt: new Date('2024-01-16T10:00:00Z'),
            updatedAt: new Date('2024-01-16T10:00:00Z'),
        }),
    ];

    beforeEach(async () => {
        // Create mock repository
        mockRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as jest.Mocked<INotesRepository>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotesService,
                {
                    provide: INotesRepository,
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<NotesService>(NotesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all notes', async () => {
            mockRepository.findAll.mockResolvedValue(mockNotes);

            const result = await service.findAll();

            expect(result).toEqual(mockNotes);
            expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
        });

        it('should apply filters when provided', async () => {
            const filters = { sortBy: 'title' as const, order: 'asc' as const };
            mockRepository.findAll.mockResolvedValue(mockNotes);

            await service.findAll(filters);

            expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
        });

        it('should return empty array when no notes exist', async () => {
            mockRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should return a note when found', async () => {
            mockRepository.findById.mockResolvedValue(mockNote);

            const result = await service.findById(mockNote.id);

            expect(result).toEqual(mockNote);
            expect(mockRepository.findById).toHaveBeenCalledWith(mockNote.id);
        });

        it('should throw NotFoundException when note not found', async () => {
            mockRepository.findById.mockResolvedValue(null);

            await expect(service.findById('nonexistent-id')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should include correct error message when not found', async () => {
            mockRepository.findById.mockResolvedValue(null);
            const id = 'nonexistent-id';

            await expect(service.findById(id)).rejects.toThrow(
                `Nota con ID "${id}" no encontrada`,
            );
        });
    });

    describe('create', () => {
        it('should create a new note', async () => {
            const createDto = { title: 'New Note', content: 'New content' };
            mockRepository.create.mockResolvedValue(mockNote);

            const result = await service.create(createDto);

            expect(result).toEqual(mockNote);
            expect(mockRepository.create).toHaveBeenCalledWith({
                title: createDto.title,
                content: createDto.content,
            });
        });
    });

    describe('update', () => {
        it('should update an existing note', async () => {
            const updateDto = { title: 'Updated Title' };
            const updatedNote = new Note({
                ...mockNote,
                title: 'Updated Title',
                updatedAt: new Date(),
            });
            mockRepository.update.mockResolvedValue(updatedNote);

            const result = await service.update(mockNote.id, updateDto);

            expect(result.title).toBe('Updated Title');
            expect(mockRepository.update).toHaveBeenCalledWith(mockNote.id, {
                title: updateDto.title,
                content: undefined,
            });
        });

        it('should throw NotFoundException when note not found', async () => {
            mockRepository.update.mockResolvedValue(null);

            await expect(
                service.update('nonexistent-id', { title: 'Test' }),
            ).rejects.toThrow(NotFoundException);
        });

        it('should allow partial updates', async () => {
            const updateDto = { content: 'Updated content only' };
            mockRepository.update.mockResolvedValue(mockNote);

            await service.update(mockNote.id, updateDto);

            expect(mockRepository.update).toHaveBeenCalledWith(mockNote.id, {
                title: undefined,
                content: 'Updated content only',
            });
        });
    });

    describe('delete', () => {
        it('should delete notes by ids', async () => {
            const ids = ['id1', 'id2'];
            mockRepository.delete.mockResolvedValue(2);

            const result = await service.delete(ids);

            expect(result).toBe(2);
            expect(mockRepository.delete).toHaveBeenCalledWith(ids);
        });

        it('should return 0 when no notes were deleted', async () => {
            mockRepository.delete.mockResolvedValue(0);

            const result = await service.delete(['nonexistent-id']);

            expect(result).toBe(0);
        });
    });
});
