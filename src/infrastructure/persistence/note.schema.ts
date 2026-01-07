import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * Mongoose document type for Note
 */
export type NoteDocument = HydratedDocument<NoteSchema>;

/**
 * Note Schema - Mongoose Schema Definition
 * 
 * Defines the MongoDB document structure for notes.
 * This is an infrastructure concern and should not be imported in the core layer.
 * 
 * @collection notes
 */
@Schema({
    collection: 'notes',
    timestamps: true, // Automatically manages createdAt and updatedAt
})
export class NoteSchema {
    /**
     * Title of the note
     */
    @Prop({ required: true, type: String })
    title: string;

    /**
     * Content/body of the note
     */
    @Prop({ required: true, type: String })
    content: string;

    /**
     * Auto-generated creation timestamp
     */
    createdAt: Date;

    /**
     * Auto-generated update timestamp
     */
    updatedAt: Date;
}

export const NoteSchemaDefinition = SchemaFactory.createForClass(NoteSchema);
