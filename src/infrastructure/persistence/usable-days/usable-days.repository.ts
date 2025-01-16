import { UsableDaysAfterPurchasedDomain } from '@resources/usable-days/domain/usable-day.domain';
import { UpdateUsableDaysAfterPurchasedDayDto } from '@resources/usable-days/dto/update-usable-day.dto';

export abstract class UsableDaysAfterPurchasedRepository {
  abstract findCurrent(): Promise<UsableDaysAfterPurchasedDomain>;

  abstract update(
    payload: UpdateUsableDaysAfterPurchasedDayDto,
  ): Promise<UsableDaysAfterPurchasedDomain>;
}
