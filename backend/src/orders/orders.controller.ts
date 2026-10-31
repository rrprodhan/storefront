import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard.js';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './create-order.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() input: CreateOrderDto) {
    return this.ordersService.create(request.user!.id, input);
  }
}
