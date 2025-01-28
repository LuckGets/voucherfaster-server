import { Module } from '@nestjs/common';
import { PrismaModule } from '../config/prisma.module';
import { CategoryRepository } from './category.repository';
import { CategoryRelationalPrismaORMRepository } from './prisma-relational/category.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: CategoryRepository,
      useClass: CategoryRelationalPrismaORMRepository,
    },
  ],
  exports: [CategoryRepository],
})
export class CategoryRelationalPersistenceModule {}
