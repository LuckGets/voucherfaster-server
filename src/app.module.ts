import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './resources/auth/auth.module';
import { UserModule } from './resources/user/user.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./.env.development', './.env.production'],
      load: [appConfig],
    }),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
