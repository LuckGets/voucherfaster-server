import { ConfigService } from '@nestjs/config';
import { PaymentService } from '../payment.service';
import * as Omise from 'omise';
import { AllConfigType, AllConfigTypeEnum } from 'src/config/all-config.type';
import { TransactionDomain } from '@resources/transaction/domain/transaction.domain';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { Inject, Logger } from '@nestjs/common';
import { PAYMENT_CONFIG } from '../config/payment-config.type';
import { CreatePaymentTokenDto } from '@resources/transaction/dto/create-token.dto';

export class OmisePaymentService implements PaymentService {
  private omise: Omise.IOmise;
  private currency: string = 'THB';
  private amountMultiplierToSmallestCurrency: number = 100;
  private logger: Logger = new Logger(OmisePaymentService.name);
  constructor(
    @Inject(ConfigService) private configService: ConfigService<AllConfigType>,
  ) {
    this.omise = Omise({
      secretKey: this.configService.getOrThrow(
        `${AllConfigTypeEnum.Payment}.${PAYMENT_CONFIG.SECRET_KEY}`,
        { infer: true },
      ),
      publicKey: this.configService.getOrThrow(
        `${AllConfigTypeEnum.Payment}.${PAYMENT_CONFIG.PUBLIC_KEY}`,
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
      return this.omise.charges.create(chargeParams);
    } catch (error) {
      throw ErrorApiResponse.conflictRequest(error.message);
    }
  }

  async createPaymentToken(payload: CreatePaymentTokenDto): Promise<string> {
    try {
      const card: Omise.Tokens.IRequest = {
        card: {
          name: payload.name,
          number: payload.number,
          city: payload.city,
          postal_code: payload.postalCode,
          expiration_month: payload.expirationMonth,
          expiration_year: payload.expirationYear,
          security_code: payload.securityCode,
        },
      };
      const token = await this.omise.tokens.create({ ...card });
      return token.id;
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }
}
