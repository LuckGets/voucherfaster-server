import { Inject, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { AllConfigType } from 'src/config/all-config.type';
import { AppConfig } from 'src/config/app-config.type';
// import { utcToTimeZoneMiddleware } from '@utils/prisma/service';

export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(@Inject(ConfigService) private configService: ConfigService) {
    super();
    const databaseUrl = configService.get<string>('DATABASE_URL');
  }

  async onModuleInit() {
    /**
     * Install UTC to timezone
     * Prisma middleware
     */
    // this.$use(utcToTimeZoneMiddleware);
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
