import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TransactionPath } from 'src/config/api-path';
import { TransactionService } from './transaction.service';
import {
  CreatePaymentTokenDto,
  CreatePaymentTokenResponse,
} from './dto/create-token.dto';
import { ApiBody, ApiCreatedResponse } from '@nestjs/swagger';

@Controller({ version: '1', path: TransactionPath.Base })
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @ApiBody({ type: () => CreatePaymentTokenDto })
  @ApiCreatedResponse({ type: () => CreatePaymentTokenResponse })
  @Post(TransactionPath.CreatePaymentToken)
  async createPaymentToken(@Body() body: CreatePaymentTokenDto) {
    const paymentToken = await this.transactionService.createPaymentToken(body);
    return CreatePaymentTokenResponse.success(paymentToken);
  }
}
