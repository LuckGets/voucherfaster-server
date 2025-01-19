import { Injectable } from '@nestjs/common';
import { UsableDaysAfterPurchasedRepository } from 'src/infrastructure/persistence/usable-days/usable-days.repository';
import { UsableDaysAfterPurchasedDomain } from './domain/usable-day.domain';
import { UpdateUsableDaysAfterPurchasedDayDto } from './dto/update-usable-day.dto';
import { UUIDService } from '@utils/services/uuid.service';
import { ErrorApiResponse } from 'src/common/core-api-response';

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
    const currentUsableDaysAfterPurchased =
      await this.usableDaysRepository.findManyAvailable();
    if (
      !currentUsableDaysAfterPurchased ||
      currentUsableDaysAfterPurchased.length < 1
    ) {
      throw ErrorApiResponse.notFoundRequest(
        'Usable days after purchased not found. Please update a new one.',
      );
    }

    if (currentUsableDaysAfterPurchased.length > 1) {
      throw ErrorApiResponse.conflictRequest(
        `There is more than 1 currently available usable days after purchased. Please update and use only one. \n usable-days after purchased list: ${currentUsableDaysAfterPurchased}`,
      );
    }

    return currentUsableDaysAfterPurchased[0];
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
