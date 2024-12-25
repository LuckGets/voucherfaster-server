import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { utcToTimeZoneMiddleware } from '@utils/prisma/service';

export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    /**
     * Install UTC to timezone
     * Prisma middleware
     */
    this.$use(utcToTimeZoneMiddleware);
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
