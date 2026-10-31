import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Interval } from '@nestjs/schedule';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Product } from './product.entity.js';

@Injectable()
export class LowStockMonitor {
  private readonly logger = new Logger(LowStockMonitor.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  @Interval(60_000)
  async reportLowStock(): Promise<void> {
    const products = await this.productsRepository.find({
      where: { stock: LessThanOrEqual(4) },
      order: { stock: 'ASC' },
    });

    if (products.length === 0) return;

    this.logger.warn(
      `Low stock: ${products.map((product) => `${product.name} (${product.stock})`).join(', ')}`,
    );
  }
}