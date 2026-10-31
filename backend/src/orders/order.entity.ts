import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../auth/user.entity.js';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('idx_orders_customer_id')
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}