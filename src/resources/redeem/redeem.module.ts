import { Module } from '@nestjs/common';
import { RedeemItemController } from './redeem.controller';
import { RedeemService } from './redeem.service';
import { RedeemRelationalPersistenceModule } from 'src/infrastructure/persistence/redeem/redeem-relational.module';
import { OrderItemModule } from '@resources/order-item/order-item.module';
import { OwnerModule } from '@resources/owner/owner.module';
import { UUIDService } from '@utils/services/uuid.service';

@Module({
  imports: [RedeemRelationalPersistenceModule, OrderItemModule, OwnerModule],
  controllers: [RedeemItemController],
  providers: [RedeemService, UUIDService],
})
export class RedeemModule {}
