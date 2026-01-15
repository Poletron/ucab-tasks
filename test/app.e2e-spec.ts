import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NotesModule } from '../src/use-cases/notes/notes.module';
import { ConfigModule } from '@nestjs/config';

/**
 * Pruebas End-to-End para la API de Notas
 * 
 * Estas pruebas verifican el ciclo completo de petición/respuesta HTTP
 * usando una instancia de MongoDB en memoria.
 */
describe('Controlador de Notas (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let createdNoteId: string;

  beforeAll(async () => {
    // Iniciar MongoDB en memoria
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

    // Aplicar los mismos pipes que en main.ts
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
    it('debería crear una nueva nota', async () => {
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

      // Guardar ID para pruebas posteriores
      createdNoteId = response.body.id;
    });

    it('debería retornar 400 cuando falta el título', async () => {
      const invalidDto = {
        content: 'Content without title',
      };

      await request(app.getHttpServer())
        .post('/notes')
        .send(invalidDto)
        .expect(400);
    });

    it('debería retornar 400 cuando falta el contenido', async () => {
      const invalidDto = {
        title: 'Title without content',
      };

      await request(app.getHttpServer())
        .post('/notes')
        .send(invalidDto)
        .expect(400);
    });

    it('debería retornar 400 cuando el cuerpo está vacío', async () => {
      await request(app.getHttpServer())
        .post('/notes')
        .send({})
        .expect(400);
    });
  });

  describe('GET /notes', () => {
    it('debería retornar todas las notas sin contenido', async () => {
      const response = await request(app.getHttpServer())
        .get('/notes')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Verificar estructura de nota (sin campo de contenido en lista)
      const note = response.body[0];
      expect(note).toHaveProperty('id');
      expect(note).toHaveProperty('title');
      expect(note).toHaveProperty('createdAt');
      expect(note).toHaveProperty('updatedAt');
      expect(note).not.toHaveProperty('content');
    });

    it('debería soportar ordenamiento por título ascendente', async () => {
      // Crear otra nota para prueba de ordenamiento
      await request(app.getHttpServer())
        .post('/notes')
        .send({ title: 'AAA First Note', content: 'Content' });

      const response = await request(app.getHttpServer())
        .get('/notes?sortBy=title&order=asc')
        .expect(200);

      expect(response.body[0].title).toBe('AAA First Note');
    });

    it('debería soportar ordenamiento por fecha de creación descendente', async () => {
      const response = await request(app.getHttpServer())
        .get('/notes?sortBy=createdAt&order=desc')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /notes/:id', () => {
    it('debería retornar una nota con contenido por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/notes/${createdNoteId}`)
        .expect(200);

      expect(response.body.id).toBe(createdNoteId);
      expect(response.body).toHaveProperty('content'); // Contenido incluido en vista detallada
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('debería retornar 404 para nota inexistente', async () => {
      await request(app.getHttpServer())
        .get('/notes/507f1f77bcf86cd799439999')
        .expect(404);
    });
  });

  describe('PATCH /notes/:id', () => {
    it('debería actualizar el título de la nota', async () => {
      const updateDto = { title: 'Updated E2E Title' };

      const response = await request(app.getHttpServer())
        .patch(`/notes/${createdNoteId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.title).toBe('Updated E2E Title');
    });

    it('debería actualizar el contenido de la nota', async () => {
      const updateDto = { content: 'Updated content via e2e test' };

      const response = await request(app.getHttpServer())
        .patch(`/notes/${createdNoteId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.content).toBe('Updated content via e2e test');
    });

    it('debería actualizar tanto título como contenido', async () => {
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

    it('debería retornar 404 para nota inexistente', async () => {
      await request(app.getHttpServer())
        .patch('/notes/507f1f77bcf86cd799439999')
        .send({ title: 'Test' })
        .expect(404);
    });

    it('debería actualizar la marca de tiempo de actualización', async () => {
      // Obtener nota actual
      const before = await request(app.getHttpServer())
        .get(`/notes/${createdNoteId}`)
        .expect(200);

      // Esperar un poco para asegurar diferente marca de tiempo
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Actualizar nota
      await request(app.getHttpServer())
        .patch(`/notes/${createdNoteId}`)
        .send({ title: 'Timestamp Test' })
        .expect(200);

      // Obtener nota actualizada
      const after = await request(app.getHttpServer())
        .get(`/notes/${createdNoteId}`)
        .expect(200);

      expect(new Date(after.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.body.updatedAt).getTime(),
      );
    });
  });

  describe('DELETE /notes', () => {
    it('debería eliminar notas por IDs', async () => {
      // Crear una nota para eliminar
      const createResponse = await request(app.getHttpServer())
        .post('/notes')
        .send({ title: 'To Delete', content: 'Will be deleted' });

      const noteToDeleteId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete('/notes')
        .send({ ids: [noteToDeleteId] })
        .expect(200);

      expect(response.body.deletedCount).toBe(1);

      // Verificar eliminación
      await request(app.getHttpServer())
        .get(`/notes/${noteToDeleteId}`)
        .expect(404);
    });

    it('debería eliminar múltiples notas a la vez', async () => {
      // Crear múltiples notas
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

    it('debería retornar 400 cuando el arreglo de ids está vacío', async () => {
      await request(app.getHttpServer())
        .delete('/notes')
        .send({ ids: [] })
        .expect(400);
    });

    it('debería retornar deletedCount en 0 para IDs inexistentes', async () => {
      const response = await request(app.getHttpServer())
        .delete('/notes')
        .send({ ids: ['507f1f77bcf86cd799439999'] })
        .expect(200);

      expect(response.body.deletedCount).toBe(0);
    });
  });
});
