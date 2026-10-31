import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return product;
  }

  async update(id: number, input: CreateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    product.name = input.name;
    product.priceCents = input.priceCents;
    product.stock = input.stock;

    return this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
}