import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { NotesModule } from './use-cases/notes/notes.module';

/**
 * Root Application Module
 * 
 * Configures the application with:
 * - Environment variables via ConfigModule
 * - MongoDB connection via MongooseModule
 * - Static file serving via ServeStaticModule
 * - Feature modules (NotesModule)
 */
@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Serve static files from public folder
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/(.*)'],
    }),
    // MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI', 'mongodb://localhost:27017/ucab-tasks'),
      }),
    }),
    // Feature modules
    NotesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
