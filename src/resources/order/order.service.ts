import { Injectable } from '@nestjs/common';
import { OrderRepository } from 'src/infrastructure/persistence/order/order.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDomain } from './domain/order.domain';
import { AccountDomain } from '@resources/account/domain/account.domain';
import { VoucherService } from '@resources/voucher/voucher.service';
import { PackageVoucherService } from '@resources/package/package.service';
import { VoucherDomain } from '@resources/voucher/domain/voucher.domain';
import { VoucherPromotionDomain } from '@resources/voucher/domain/voucher-promotion.domain';
import { PackageVoucherDomain } from '@resources/package/domain/package-voucher.domain';
import { ErrorApiResponse } from 'src/common/core-api-response';

type OrderItemsInfo = {
  vouchers: VoucherDomain[];
  promotions: VoucherPromotionDomain[];
  packages: PackageVoucherDomain[];
};

@Injectable()
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private voucherService: VoucherService,
    private packageVoucherService: PackageVoucherService,
  ) {}

  async createOrder(
    data: CreateOrderDto,
    accountId: AccountDomain['id'],
  ): Promise<OrderDomain> {
    const { items, totalPrice } = await this.findOrderItemInformation(data);
    if (Number(data.totalPrice) !== totalPrice) {
      throw ErrorApiResponse.conflictRequest(
        `The total price of all items: ${totalPrice} does not match with provided total price: ${data.totalPrice}`,
      );
    }
  }

  // Not promise.all but solid
  //   async findOrderItemInformation(data: CreateOrderDto): Promise<{
  //     items: OrderItemsInfo;
  //     totalPrice: number;
  //   }> {
  //     let totalPrice: number = 0;
  //     const allItemsInfo: OrderItemsInfo = {
  //       vouchers: [],
  //       promotions: [],
  //       packages: [],
  //     };
  //     try {
  //       for (const item of data.items) {
  //         switch (item.voucherType) {
  //           case 'voucher': {
  //             const voucher = await this.voucherService.getVoucherById(item.id);
  //             totalPrice += voucher.price;
  //             allItemsInfo.vouchers.push(voucher);
  //             break;
  //           }
  //           case 'promotion': {
  //             const promotion = await this.voucherService.getVoucherPromotionById(
  //               item.id,
  //             );
  //             totalPrice += promotion.promotionPrice;
  //             allItemsInfo.promotions.push(promotion);
  //             break;
  //           }
  //           case 'package': {
  //             const packageVoucher =
  //               await this.packageVoucherService.getPackageVoucherById(item.id);
  //             totalPrice += packageVoucher.price;
  //             allItemsInfo.packages.push(packageVoucher);
  //             break;
  //           }
  //           default:
  //             throw new Error(`Unknown voucher type: ${item.voucherType}`);
  //         }
  //       }

  //       return { items: allItemsInfo, totalPrice };
  //     } catch (err) {
  //       throw new Error(`Failed to process order items: ${err.message}`);
  //     }
  //   }
  // }

  // promise.all but untested.
  // There are going to have the
  // race condition in total price
  // but since it does not have to lock
  // or sequential
  // So, I guess it would be better if just using
  // power of worker
  async findOrderItemInformation(data: CreateOrderDto): Promise<
    Promise<{
      items: OrderItemsInfo;
      totalPrice: number;
    }>
  > {
    const allItemsInfo: OrderItemsInfo = {
      vouchers: [],
      promotions: [],
      packages: [],
    };

    const allItemsInfoPromisesArr = data.items.map(async (item) => {
      let itemPrice = 0;

      switch (item.voucherType) {
        case 'voucher': {
          const voucher = await this.voucherService.getVoucherById(item.id);
          if (!voucher) {
            throw new Error(`Voucher with ID ${item.id} not found.`);
          }
          itemPrice += voucher.price;
          allItemsInfo.vouchers.push(voucher);
          break;
        }
        case 'promotion': {
          const promotion = await this.voucherService.getVoucherPromotionById(
            item.id,
          );
          if (!promotion) {
            throw new Error(`Promotion with ID ${item.id} not found.`);
          }
          itemPrice += promotion.promotionPrice;
          allItemsInfo.promotions.push(promotion);
          break;
        }
        case 'package': {
          const packageVoucher =
            await this.packageVoucherService.getPackageVoucherById(item.id);
          if (!packageVoucher) {
            throw new Error(`Package Voucher with ID ${item.id} not found.`);
          }
          itemPrice += packageVoucher.price;
          allItemsInfo.packages.push(packageVoucher);
          break;
        }
        default:
          throw new Error(`Unknown voucher type: ${item.voucherType}`);
      }

      return itemPrice;
    });

    try {
      const allItemPricesArr = await Promise.all(allItemsInfoPromisesArr);
      const totalPrice = allItemPricesArr.reduce(
        (sum, price) => sum + price,
        0,
      );
      return { items: allItemsInfo, totalPrice };
    } catch (error) {
      throw new Error(`Error processing order items: ${error.message}`);
    }
  }
}
