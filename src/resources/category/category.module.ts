import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { VoucherTagService } from './tag/voucher-tag.service';
import { CompactService } from 'src/common/service/compact.service';
import { CategoryRelationalPersistenceModule } from 'src/infrastructure/persistence/category/category-relational.module';
import { UUIDService } from '@utils/services/uuid.service';
import { VoucherTagRelationalPersistenceModule } from 'src/infrastructure/persistence/voucher-tag/voucher-relational.module';

@Module({
  imports: [
    CategoryRelationalPersistenceModule,
    VoucherTagRelationalPersistenceModule,
  ],
  providers: [CategoryService, VoucherTagService, CompactService, UUIDService],
  controllers: [CategoryController],
  exports: [CategoryService, VoucherTagService],
})
export class CategoryModule {}
