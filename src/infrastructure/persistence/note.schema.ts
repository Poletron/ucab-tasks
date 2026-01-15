import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * Tipo de documento Mongoose para Nota
 */
export type NoteDocument = HydratedDocument<NoteSchema>;

/**
 * Esquema de Nota - Definición de Esquema Mongoose
 * 
 * Define la estructura del documento MongoDB para las notas.
 * Esta es una preocupación de infraestructura y no debe importarse en la capa central.
 * 
 * @collection notes
 */
@Schema({
    collection: 'notes',
    timestamps: true, // Automatically manages createdAt and updatedAt
})
export class NoteSchema {
    /**
     * Título de la nota
     */
    @Prop({ required: true, type: String })
    title: string;

    /**
     * Contenido/cuerpo de la nota
     */
    @Prop({ required: true, type: String })
    content: string;

    /**
     * Marca de tiempo de creación generada automáticamente
     */
    createdAt: Date;

    /**
     * Marca de tiempo de actualización generada automáticamente
     */
    updatedAt: Date;
}

export const NoteSchemaDefinition = SchemaFactory.createForClass(NoteSchema);
