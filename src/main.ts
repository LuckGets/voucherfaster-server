import { NestFactory, Reflector } from '@nestjs/core';
import 'reflect-metadata';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import globalPipeValidationOption from './utils/globalPipeValidationOption';
import { useContainer } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from './config/all-config.type';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { HTTPMethod } from './common/http.type';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AllConfigType>);

  const corsOption: CorsOptions = {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      configService.getOrThrow<ConfigService<AllConfigType>>('client.domain', {
        infer: true,
      }),
    ],
    methods: [
      HTTPMethod.Get,
      HTTPMethod.Post,
      HTTPMethod.Patch,
      HTTPMethod.Delete,
    ],
    credentials: true,
  };

  app.enableCors(corsOption);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  // Using global validation pipe
  app.useGlobalPipes(new ValidationPipe(globalPipeValidationOption));
  // Using Global interceptors
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  // Using cookie-parser for middleware
  app.use(cookieParser());
  // Set Global prefix
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
  );
  // Enable versioning
  app.enableVersioning({ type: VersioningType.URI });

  // Building documentation
  const options: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle(configService.getOrThrow('app.name', { infer: true }))
    .setVersion(configService.getOrThrow('app.desc', { infer: true }))
    .setDescription(configService.getOrThrow('app.apiVersion', { infer: true }))
    .addCookieAuth()
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  // Run the server
  const PORT = configService.getOrThrow('app.port', { infer: true });
  await app.listen(PORT, () =>
    Logger.log(
      `Server is starting on ${configService.getOrThrow('app.host', { infer: true })}:: ${PORT}`,
    ),
  );
}
bootstrap();
