import { ConfigService } from '@nestjs/config';
import { PaymentService } from '../payment.service';
import * as Omise from 'omise';
import { AllConfigType, AllConfigTypeEnum } from 'src/config/all-config.type';
import { TransactionDomain } from '@resources/transaction/domain/transaction.domain';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { Logger } from '@nestjs/common';

export class OmisePaymentService implements PaymentService {
  private omise: Omise.IOmise;
  private currency: string = 'THB';
  private amountMultiplierToSmallestCurrency: number = 100;
  private logger: Logger = new Logger(OmisePaymentService.name);
  constructor(private configService: ConfigService<AllConfigType>) {
    this.omise = Omise({
      secretKey: this.configService.getOrThrow(
        `${AllConfigTypeEnum.Payment}.paymentSecretKey`,
        { infer: true },
      ),
    });
  }

  async makePayment(
    token: string,
    amount: number,
    description: string,
  ): Promise<Omise.Charges.ICharge> {
    const chargeParams: Omise.Charges.IRequest = {
      amount: amount * this.amountMultiplierToSmallestCurrency,
      currency: this.currency,
      card: token,
      description,
    };

    try {
      return this.omise.charges.create(chargeParams, (err, response) => {
        if (err) {
          this.logger.error(err);
          throw ErrorApiResponse.conflictRequest('Payment failed');
        } else {
          return {
            id: response.id,
            status: response.status,
          };
        }
      });
    } catch (error) {
      throw ErrorApiResponse.conflictRequest(error.message);
    }
  }
}
