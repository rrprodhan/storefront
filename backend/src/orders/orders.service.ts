import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Product } from '../products/product.entity.js';
import { User } from '../auth/user.entity.js';
import { CreateOrderDto } from './create-order.dto.js';
import { Order } from './order.entity.js';
import { OrderItem } from './order-item.entity.js';

@Injectable()
export class OrdersService {
  constructor(private readonly dataSource: DataSource) {}

  create(customerId: number, input: CreateOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.save(
        Order,
        manager.create(Order, {
          customer: { id: customerId } as User,
        }),
      );

      const items = [];

      for (const line of [...input.items].sort((a, b) => a.productId - b.productId)) {
        const product = await manager.getRepository(Product).findOne({
          where: { id: line.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new NotFoundException(`Product ${line.productId} not found`);
        }

        if (product.stock < line.quantity) {
          throw new BadRequestException(`Not enough stock for ${product.name}`);
        }

        product.stock -= line.quantity;
        await manager.save(Product, product);

        const item = await manager.save(
          OrderItem,
          manager.create(OrderItem, {
            order,
            product,
            quantity: line.quantity,
            unitPriceCents: product.priceCents,
          }),
        );

        items.push({
          productId: product.id,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
        });
      }

      return {
        id: order.id,
        customerId,
        createdAt: order.createdAt,
        items,
      };
    });
  }
}