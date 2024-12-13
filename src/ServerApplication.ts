import {
  INestApplication,
  VersioningType,
  ValidationPipe,
  Logger,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ConfigService, PathImpl2 } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { OpenAPIObject, DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import globalPipeValidationOption from './utils/globalPipeValidationOption';

export class ServerApplication {
  public async run(): Promise<void> {
    const app = await NestFactory.create(AppModule, {
      logger: new Logger(),
      cors: true,
    });
    useContainer(app.select(AppModule), { fallback: true });
    this.enableVersioning(app);
    this.setGlobalPrefix(app);
    app.useGlobalPipes(new ValidationPipe(globalPipeValidationOption));
    // this.useGlobalPipes(app);
    this.useGlobalSerializeInterceptor(app);
    this.useCookieParser(app);
    this.buildAPIDocumentation(app);

    this.listen(app);
  }

  private useContainer(app: INestApplication): void {
    useContainer(app.select(AppModule), { fallback: true });
  }

  public getConfigOrThrow<AppConfig>(
    app: INestApplication,
    prop: PathImpl2<AppConfig>,
  ) {
    const configService = app.get(ConfigService<AppConfig>);
    return configService.getOrThrow<AppConfig>(prop, { infer: true });
  }

  private enableVersioning(app: INestApplication): void {
    app.enableVersioning({ type: VersioningType.URI });
  }

  private useGlobalPipes(app: INestApplication): void {
    app.useGlobalPipes(new ValidationPipe());
  }

  private setGlobalPrefix(app: INestApplication): void {
    const apiPrefix = this.getConfigOrThrow(app, 'app.apiPrefix');
    app.setGlobalPrefix(apiPrefix, { exclude: ['/'] });
  }

  private buildAPIDocumentation(app: INestApplication): void {
    const title: string = this.getConfigOrThrow(app, 'app.name');
    const description: string = this.getConfigOrThrow(app, 'app.desc');

    const version: string = this.getConfigOrThrow(app, 'app.apiVersion');

    const options: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
      .setTitle(title)
      .setVersion(version)
      .setDescription(description)
      .addCookieAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('docs', app, document);
  }

  private useGlobalSerializeInterceptor(app: INestApplication): void {
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
  }

  private listen(app: INestApplication) {
    const port = this.getConfigOrThrow(app, 'app.port');
    const host = this.getConfigOrThrow(app, 'app.host');
    const name = this.getConfigOrThrow(app, 'app.name');
    const log = () =>
      Logger.log(`Server is starting on: ${host}:: ${port}`, name);
    app.listen(port, host, log);
  }

  private useCookieParser(app: INestApplication): void {
    app.use(cookieParser());
  }

  public static new(): ServerApplication {
    return new ServerApplication();
  }
}
