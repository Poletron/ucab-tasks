import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NotesModule } from '../src/use-cases/notes/notes.module';
import { ConfigModule } from '@nestjs/config';

/**
 * End-to-End tests for Notes API
 * 
 * These tests verify the complete HTTP request/response cycle
 * using an in-memory MongoDB instance.
 */
describe('NotesController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let createdNoteId: string;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRoot(mongoUri),
        NotesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same pipes as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('POST /notes', () => {
    it('should create a new note', async () => {
      const createDto = {
        title: 'E2E Test Note',
        content: 'This is a test note created during e2e testing',
      };

      const response = await request(app.getHttpServer())
        .post('/notes')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(createDto.title);
      expect(response.body.content).toBe(createDto.content);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      // Save ID for later tests
      createdNoteId = response.body.id;
    });

    it('should return 400 when title is missing', async () => {
      const invalidDto = {
        content: 'Content without title',
      };

      await request(app.getHttpServer())
        .post('/notes')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when content is missing', async () => {
      const invalidDto = {
        title: 'Title without content',
      };

      await request(app.getHttpServer())
        .post('/notes')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when body is empty', async () => {
      await request(app.getHttpServer())
        .post('/notes')
        .send({})
        .expect(400);
    });
  });

  describe('GET /notes', () => {
    it('should return all notes without content', async () => {
      const response = await request(app.getHttpServer())
        .get('/notes')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Verify note structure (no content field in list)
      const note = response.body[0];
      expect(note).toHaveProperty('id');
      expect(note).toHaveProperty('title');
      expect(note).toHaveProperty('createdAt');
      expect(note).toHaveProperty('updatedAt');
      expect(note).not.toHaveProperty('content');
    });

    it('should support sorting by title ascending', async () => {
      // Create another note for sorting test
      await request(app.getHttpServer())
        .post('/notes')
        .send({ title: 'AAA First Note', content: 'Content' });

      const response = await request(app.getHttpServer())
        .get('/notes?sortBy=title&order=asc')
        .expect(200);

      expect(response.body[0].title).toBe('AAA First Note');
    });

    it('should support sorting by createdAt descending', async () => {
      const response = await request(app.getHttpServer())
        .get('/notes?sortBy=createdAt&order=desc')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /notes/:id', () => {
    it('should return a note with content by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/notes/${createdNoteId}`)
        .expect(200);

      expect(response.body.id).toBe(createdNoteId);
      expect(response.body).toHaveProperty('content'); // Content included in detail view
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 404 for non-existent note', async () => {
      await request(app.getHttpServer())
        .get('/notes/507f1f77bcf86cd799439999')
        .expect(404);
    });
  });

  describe('PATCH /notes/:id', () => {
    it('should update note title', async () => {
      const updateDto = { title: 'Updated E2E Title' };

      const response = await request(app.getHttpServer())
        .patch(`/notes/${createdNoteId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.title).toBe('Updated E2E Title');
    });

    it('should update note content', async () => {
      const updateDto = { content: 'Updated content via e2e test' };

      const response = await request(app.getHttpServer())
        .patch(`/notes/${createdNoteId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.content).toBe('Updated content via e2e test');
    });

    it('should update both title and content', async () => {
      const updateDto = {
        title: 'Both Updated',
        content: 'Both fields updated',
      };

      const response = await request(app.getHttpServer())
        .patch(`/notes/${createdNoteId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.title).toBe('Both Updated');
      expect(response.body.content).toBe('Both fields updated');
    });

    it('should return 404 for non-existent note', async () => {
      await request(app.getHttpServer())
        .patch('/notes/507f1f77bcf86cd799439999')
        .send({ title: 'Test' })
        .expect(404);
    });

    it('should update updatedAt timestamp', async () => {
      // Get current note
      const before = await request(app.getHttpServer())
        .get(`/notes/${createdNoteId}`)
        .expect(200);

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Update note
      await request(app.getHttpServer())
        .patch(`/notes/${createdNoteId}`)
        .send({ title: 'Timestamp Test' })
        .expect(200);

      // Get updated note
      const after = await request(app.getHttpServer())
        .get(`/notes/${createdNoteId}`)
        .expect(200);

      expect(new Date(after.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.body.updatedAt).getTime(),
      );
    });
  });

  describe('DELETE /notes', () => {
    it('should delete notes by IDs', async () => {
      // Create a note to delete
      const createResponse = await request(app.getHttpServer())
        .post('/notes')
        .send({ title: 'To Delete', content: 'Will be deleted' });

      const noteToDeleteId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete('/notes')
        .send({ ids: [noteToDeleteId] })
        .expect(200);

      expect(response.body.deletedCount).toBe(1);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/notes/${noteToDeleteId}`)
        .expect(404);
    });

    it('should delete multiple notes at once', async () => {
      // Create multiple notes
      const note1 = await request(app.getHttpServer())
        .post('/notes')
        .send({ title: 'Delete 1', content: 'Content 1' });

      const note2 = await request(app.getHttpServer())
        .post('/notes')
        .send({ title: 'Delete 2', content: 'Content 2' });

      const response = await request(app.getHttpServer())
        .delete('/notes')
        .send({ ids: [note1.body.id, note2.body.id] })
        .expect(200);

      expect(response.body.deletedCount).toBe(2);
    });

    it('should return 400 when ids array is empty', async () => {
      await request(app.getHttpServer())
        .delete('/notes')
        .send({ ids: [] })
        .expect(400);
    });

    it('should return 0 deletedCount for non-existent IDs', async () => {
      const response = await request(app.getHttpServer())
        .delete('/notes')
        .send({ ids: ['507f1f77bcf86cd799439999'] })
        .expect(200);

      expect(response.body.deletedCount).toBe(0);
    });
  });
});
