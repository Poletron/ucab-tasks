import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { INotesRepository } from '../../core/interfaces/notes-repository.interface';
import { MongoNotesRepository } from '../../infrastructure/repositories/mongo-notes.repository';
import {
    NoteSchema,
    NoteSchemaDefinition,
} from '../../infrastructure/persistence/note.schema';

/**
 * Notes Module
 * 
 * Configures the Notes feature module with:
 * - Mongoose schema registration
 * - Dependency injection for INotesRepository
 * - Controller and Service registration
 * 
 * The key pattern here is the custom provider that maps
 * the INotesRepository abstract class to the MongoNotesRepository implementation.
 * This allows swapping the repository implementation without changing business logic.
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: NoteSchema.name, schema: NoteSchemaDefinition },
        ]),
    ],
    controllers: [NotesController],
    providers: [
        NotesService,
        {
            provide: INotesRepository,
            useClass: MongoNotesRepository,
        },
    ],
    exports: [NotesService],
})
export class NotesModule { }
