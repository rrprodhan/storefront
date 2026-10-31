import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity.js';
import { ProductsService } from './products.service.js';
import { ProductsController } from './products.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), AuthModule],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}