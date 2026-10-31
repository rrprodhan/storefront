import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../products/product.entity.js';
import { Order } from './order.entity.js';

@Entity('order_items')
@Check('"quantity" > 0')
@Check('"unit_price_cents" >= 0')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, { nullable: false })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ name: 'unit_price_cents', type: 'integer' })
  unitPriceCents: number;
}