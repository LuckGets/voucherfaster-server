import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { RoleEnum } from '@resources/account/types/account.type';
import { OrderService } from '@resources/order/order.service';
import { isUUID } from 'class-validator';
import { ErrorApiResponse } from 'src/common/core-api-response';
import { HttpRequestWithUser } from 'src/common/http.type';
import { OrderPath } from 'src/config/api-path';

@Injectable()
export class OrderOwnerGuard implements CanActivate {
  private readonly logger = new Logger(OrderOwnerGuard.name);
  constructor(private orderService: OrderService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: HttpRequestWithUser = context.switchToHttp().getRequest();
    const { params, user } = req;
    try {
      if (
        !params[OrderPath.OrderIdParam] ||
        !isUUID(params[OrderPath.OrderIdParam])
      )
        return false;
      const orderId = params[OrderPath.OrderIdParam];
      const order = await this.orderService.getOrderById(orderId);
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
