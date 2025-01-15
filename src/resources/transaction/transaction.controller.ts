import { Controller } from '@nestjs/common';
import { TransactionPath } from 'src/config/api-path';
import { TransactionService } from './transaction.service';

@Controller({ version: '1', path: TransactionPath.Base })
export class TransactionController {
  constructor(private transactionService: TransactionService) {}
}
