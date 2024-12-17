import { Injectable } from '@nestjs/common';
import { AccountDomain } from '@resources/account/domain/account.domain';
import { PrismaService } from '../../config/prisma.service';
import { NullAble } from '@utils/types/NullAble.type';
import { AccountMapper } from './account.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccountRelationalPrismaORMRepository {
  constructor(private prismaService: PrismaService) {}
  async create(data: Prisma.AccountCreateInput): Promise<AccountDomain> {
    const user = await this.prismaService.account.create({
      data,
    });
    return AccountMapper.toDomain(user);
  }

  async findById(id: AccountDomain['id']): Promise<NullAble<AccountDomain>> {
    const user = await this.prismaService.account.findUnique({
      where: {
        id: id as string,
      },
    });
    return AccountMapper.toDomain(user);
  }
  async findByEmail(
    email: AccountDomain['email'],
  ): Promise<NullAble<AccountDomain>> {
    const user = await this.prismaService.account.findUnique({
      where: {
        email,
      },
    });
    return user ? AccountMapper.toDomain(user) : null;
  }

  async findByPhoneNumber(
    phone: AccountDomain['phone'],
  ): Promise<NullAble<AccountDomain>> {
    const user = await this.prismaService.account.findUnique({
      where: {
        phone,
      },
    });
    return user ? AccountMapper.toDomain(user) : null;
  }
}
