import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity.js';
import { CreateProductDto } from './create-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productsRepository.find({ order: { id: 'ASC' } });
  }

  create(input: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(input);
    return this.productsRepository.save(product);
  }
}