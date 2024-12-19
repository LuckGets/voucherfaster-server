import { Injectable } from '@nestjs/common';
import { AccountDomain } from '@resources/account/domain/account.domain';
import { PrismaService } from '../../config/prisma.service';
import { AccountMapper } from './account.mapper';
import { Prisma } from '@prisma/client';
import { NullAble } from '@utils/types/common.type';
import { AccountRepository } from '../account.repository';

@Injectable()
export class AccountRelationalPrismaORMRepository implements AccountRepository {
  constructor(private prismaService: PrismaService) {}
  async create(data: Prisma.AccountCreateInput): Promise<AccountDomain> {
    const account = await this.prismaService.account.create({
      data,
    });
    return AccountMapper.toDomain(account);
  }

  async findById(id: AccountDomain['id']): Promise<NullAble<AccountDomain>> {
    const account = await this.prismaService.account.findUnique({
      where: {
        id: id as string,
      },
    });
    return AccountMapper.toDomain(account);
  }

  async findBySocialIdAndProvider(
    socialId: AccountDomain['socialId'],
    accountProvider: AccountDomain['accountProvider'],
  ): Promise<NullAble<AccountDomain>> {
    const account = await this.prismaService.account.findFirst({
      where: {
        AND: [
          {
            accountProvider,
          },
          { socialId },
        ],
      },
    });
    return account ? AccountMapper.toDomain(account) : null;
  }

  async findByEmail(
    email: AccountDomain['email'],
  ): Promise<NullAble<AccountDomain>> {
    const account = await this.prismaService.account.findUnique({
      where: {
        email,
      },
    });
    return account ? AccountMapper.toDomain(account) : null;
  }

  async findByPhoneNumber(
    phone: AccountDomain['phone'],
  ): Promise<NullAble<AccountDomain>> {
    const account = await this.prismaService.account.findUnique({
      where: {
        phone,
      },
    });
    return account ? AccountMapper.toDomain(account) : null;
  }
  async update(
    id: AccountDomain['id'],
    data: Partial<AccountDomain>,
  ): Promise<NullAble<AccountDomain>> {
    const account = await this.prismaService.account.update({
      where: {
        id,
      },
      data,
    });
    return AccountMapper.toDomain(account);
  }
}
