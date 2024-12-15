import { Injectable } from '@nestjs/common';
import { AccountRepository } from '../account.repository';
import { PrismaService } from '../../config/prisma.service';
import { AccountDomain } from '../../../../resources/account/domain/account.domain';
import { CreateAccountDto } from '../../../../resources/account/dto/create-account.dto';
import { NullAble } from '../../../../utils/types/NullAble.type';
import { UUID } from 'crypto';

@Injectable()
export class AccountRelationalPrismaORMRepository implements AccountRepository {
  constructor(private prismaService: PrismaService) {}
  async create(
    data: Omit<AccountDomain, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<AccountDomain> {}
  async findById(id: AccountDomain['id']): Promise<NullAble<AccountDomain>> {
    return this.prismaService.account.findUnique({
      where: {
        id: id as UUID,
      },
    });
  }
}
