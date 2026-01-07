/**
 * Note Entity - Core Domain Object
 * 
 * Represents a note in the UCAB Tasks application.
 * This is a pure TypeScript class with no framework dependencies.
 * 
 * @author UCAB Tasks Team
 */
export class Note {
    /**
     * Unique identifier for the note
     */
    readonly id: string;

    /**
     * Title of the note
     */
    title: string;

    /**
     * Content/body of the note
     */
    content: string;

    /**
     * Timestamp when the note was created
     */
    readonly createdAt: Date;

    /**
     * Timestamp when the note was last modified
     */
    updatedAt: Date;

    /**
     * Creates a new Note instance
     * @param props - The properties to initialize the note with
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
