import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { INotesRepository } from '../../core/interfaces/notes-repository.interface';
import { Note } from '../../core/entities/note.entity';

/**
 * Pruebas unitarias para NotesService
 * 
 * Estas pruebas verifican la capa de lógica de negocio en aislamiento
 * simulando la dependencia del repositorio.
 */
describe('NotesService', () => {
    let service: NotesService;
    let mockRepository: jest.Mocked<INotesRepository>;

    // Datos de prueba de muestra
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
        // Crear repositorio simulado
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
        it('debería retornar todas las notas', async () => {
            mockRepository.findAll.mockResolvedValue(mockNotes);

            const result = await service.findAll();

            expect(result).toEqual(mockNotes);
            expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
        });

        it('debería aplicar filtros cuando se proporcionan', async () => {
            const filters = { sortBy: 'title' as const, order: 'asc' as const };
            mockRepository.findAll.mockResolvedValue(mockNotes);

            await service.findAll(filters);

            expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
        });

        it('debería retornar un arreglo vacío cuando no existen notas', async () => {
            mockRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('debería retornar una nota cuando se encuentra', async () => {
            mockRepository.findById.mockResolvedValue(mockNote);

            const result = await service.findById(mockNote.id);

            expect(result).toEqual(mockNote);
            expect(mockRepository.findById).toHaveBeenCalledWith(mockNote.id);
        });

        it('debería lanzar NotFoundException cuando la nota no se encuentra', async () => {
            mockRepository.findById.mockResolvedValue(null);

            await expect(service.findById('nonexistent-id')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('debería incluir el mensaje de error correcto cuando no se encuentra', async () => {
            mockRepository.findById.mockResolvedValue(null);
            const id = 'nonexistent-id';

            await expect(service.findById(id)).rejects.toThrow(
                `Nota con ID "${id}" no encontrada`,
            );
        });
    });

    describe('create', () => {
        it('debería crear una nueva nota', async () => {
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
        it('debería actualizar una nota existente', async () => {
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

        it('debería lanzar NotFoundException cuando la nota no se encuentra', async () => {
            mockRepository.update.mockResolvedValue(null);

            await expect(
                service.update('nonexistent-id', { title: 'Test' }),
            ).rejects.toThrow(NotFoundException);
        });

        it('debería permitir actualizaciones parciales', async () => {
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
        it('debería eliminar notas por ids', async () => {
            const ids = ['id1', 'id2'];
            mockRepository.delete.mockResolvedValue(2);

            const result = await service.delete(ids);

            expect(result).toBe(2);
            expect(mockRepository.delete).toHaveBeenCalledWith(ids);
        });

        it('debería retornar 0 cuando no se eliminaron notas', async () => {
            mockRepository.delete.mockResolvedValue(0);

            const result = await service.delete(['nonexistent-id']);

            expect(result).toBe(0);
        });
    });
});
