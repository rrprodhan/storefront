import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
@Check('"price_cents" >= 0')
@Check('"stock" >= 0')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ name: 'price_cents', type: 'integer' })
  priceCents: number;

  @Column({ type: 'integer', default: 0 })
  stock: number;
}
