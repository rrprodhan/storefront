import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity.js';
import { OrderItem } from './order-item.entity.js';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), AuthModule],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}