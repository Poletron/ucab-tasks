import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { NotesModule } from './use-cases/notes/notes.module';

/**
 * Módulo Raíz de la Aplicación
 * 
 * Configura la aplicación con:
 * - Variables de entorno vía ConfigModule
 * - Conexión MongoDB vía MongooseModule
 * - Servicio de archivos estáticos vía ServeStaticModule
 * - Módulos de características (NotesModule)
 */
@Module({
  imports: [
    // Cargar variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Servir archivos estáticos desde la carpeta public
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/(.*)'],
    }),
    // Conexión MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI', 'mongodb://localhost:27017/ucab-tasks'),
      }),
    }),
    // Módulos de características
    NotesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
