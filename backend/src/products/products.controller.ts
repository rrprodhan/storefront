import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Product } from './product.entity.js';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './create-product.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminGuard } from '../auth/admin.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() input: CreateProductDto): Promise<Product> {
    return this.productsService.create(input);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @UseGuards(AdminGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: CreateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, input);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productsService.remove(id);
  }
}
