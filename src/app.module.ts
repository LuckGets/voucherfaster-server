import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./.env.development', './.env.production'],
      load: [appConfig],
    }),
  ],
})
export class AppModule {}
