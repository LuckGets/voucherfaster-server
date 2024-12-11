import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './application//auth/auth.module';
import { AccountModule } from './resources/account/account.module';
import appConfig from './config/app.config';
import { PrismaModule } from './infrastructure/persistence/config/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? './env.production'
          : './env.development',
      load: [appConfig],
    }),
    AuthModule,
    AccountModule,
    PrismaModule,
  ],
})
export class AppModule {}
