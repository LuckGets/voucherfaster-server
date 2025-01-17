import { Controller } from '@nestjs/common';
import { OrderItemPath } from 'src/config/api-path';

@Controller({ path: OrderItemPath.Base })
export class OrderItemController {}
