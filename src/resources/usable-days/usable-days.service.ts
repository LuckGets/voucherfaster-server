import { Injectable } from '@nestjs/common';
import { UsableDaysAfterPurchasedRepository } from 'src/infrastructure/persistence/usable-days/usable-days.repository';
import { UsableDaysAfterPurchasedDomain } from './domain/usable-day.domain';
import { UpdateUsableDaysAfterPurchasedDayDto } from './dto/update-usable-day.dto';
import { UUIDService } from '@utils/services/uuid.service';

@Injectable()
export class UsableDaysService {
  constructor(
    private usableDaysRepository: UsableDaysAfterPurchasedRepository,
    private uuidService: UUIDService,
  ) {}
  // -------------------------------------------------------------------- //
  // ------------------------- VOUCHER USAGE DAY PART ------------------- //
  // -------------------------------------------------------------------- //

  async getCurrentUsableDaysAfterPurchased(): Promise<UsableDaysAfterPurchasedDomain> {
    return this.usableDaysRepository.findCurrent();
  }

  async updateUsableDaysAfterPurchased(
    data: UpdateUsableDaysAfterPurchasedDayDto,
  ): Promise<UsableDaysAfterPurchasedDomain> {
    return this.usableDaysRepository.update({
      ...data,
      id: String(this.uuidService.make()),
    });
  }
}
