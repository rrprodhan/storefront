import { Body, Controller, Get, Post } from '@nestjs/common';
import { Product } from './product.entity.js';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './create-product.dto.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Post()
  create(@Body() input: CreateProductDto): Promise<Product> {
    return this.productsService.create(input);
  }
}