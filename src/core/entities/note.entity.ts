/**
 * Entidad Nota - Objeto de Dominio Central
 * 
 * Representa una nota en la aplicación UCAB Tasks.
 * Esta es una clase TypeScript pura sin dependencias del framework.
 * 
 * @author UCAB Tasks Team
 */
export class Note {
    /**
     * Identificador único para la nota
     */
    readonly id: string;

    /**
     * Título de la nota
     */
    title: string;

    /**
     * Contenido/cuerpo de la nota
     */
    content: string;

    /**
     * Marca de tiempo de cuando la nota fue creada
     */
    readonly createdAt: Date;

    /**
     * Marca de tiempo de cuando la nota fue modificada por última vez
     */
    updatedAt: Date;

    /**
     * Crea una nueva instancia de Nota
     * @param props - Las propiedades para inicializar la nota
     */
    constructor(props: {
        id: string;
        title: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
    }) {
        this.id = props.id;
        this.title = props.title;
        this.content = props.content;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}
