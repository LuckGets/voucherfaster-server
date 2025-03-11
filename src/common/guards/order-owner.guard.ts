import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { RoleEnum } from '@resources/account/types/account.type';
import { OrderService } from '@resources/order/order.service';
import { ObjectHelper } from '@utils/services/object.helper';
import { isUUID } from 'class-validator';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { HttpRequestWithUser } from 'src/common/http.type';
import { OrderPath } from 'src/config/api-path';
import {
  defaultPaginationOption,
  QUERY_FIELD_NAME,
} from '../types/pagination.type';
import { OrderItemDomain } from '@resources/order-item/domain/order-item.domain';

@Injectable()
export class OrderOwnerGuard implements CanActivate {
  private readonly logger = new Logger(OrderOwnerGuard.name);
  constructor(private orderService: OrderService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: HttpRequestWithUser = context.switchToHttp().getRequest();
    const { params, user, query } = req;
    try {
      if (
        !params[OrderPath.OrderIdParam] ||
        !isUUID(params[OrderPath.OrderIdParam])
      )
        return false;

      let take = 1;
      let cursor: OrderItemDomain['id'] = null;

      if (!ObjectHelper.isObjectEmpty(query)) {
        const takeVal = Number(query[QUERY_FIELD_NAME.LIMIT]);
        take = isNaN(takeVal) ? 1 : takeVal;
        const cursorVal = String(query[QUERY_FIELD_NAME.CURSOR]);
        cursor = isUUID(cursorVal) ? cursorVal : null;
      }

      const orderId = params[OrderPath.OrderIdParam];
      const order = await this.orderService.getOrderById(orderId, {
        take,
        cursor,
      });
      if (!order)
        throw ErrorApiResponse.notFoundRequest(
          `This order ID could not be found on this server.`,
        );
      if (order.deletedAt)
        throw ErrorApiResponse.conflictRequest(
          `Order ID: ${order.id} has been deleted at ${order.deletedAt.toLocaleString()}.`,
        );
      if (order.account.id !== user?.accountId && user?.role !== RoleEnum.Admin)
        throw ErrorApiResponse.unauthorizedRequest();

      req['order'] = order;
      return true;
    } catch (err) {
      console.error(err);
      this.logger.error(
        `Request could not be proceed due to the Error : ${err.message}`,
      );
      throw ErrorApiResponse.unauthorizedRequest(err.message);
    }
  }
}
