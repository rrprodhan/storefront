import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type UserRole = 'customer' | 'admin';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    select: false,
  })
  passwordHash: string;

  @Column({ type: 'varchar', length: 20, default: 'customer' })
  role: UserRole;
}