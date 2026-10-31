import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RegisterDto } from './register.dto.js';
import { User } from './user.entity.js';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterDto) {
    const email = input.email.toLowerCase();

    if (Buffer.byteLength(input.password, 'utf8') > 72) {
      throw new BadRequestException('Password is too long');
    }

    const existing = await this.usersRepository.findOneBy({ email });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = this.usersRepository.create({
      email,
      passwordHash,
      role: 'customer',
    });
    const saved = await this.usersRepository.save(user);

    return { id: saved.id, email: saved.email, role: saved.role };
  }

  async login(input: LoginDto) {
    if (Buffer.byteLength(input.password, 'utf8') > 72) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const email = input.email.toLowerCase();
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();

    const valid = user
      ? await bcrypt.compare(input.password, user.passwordHash)
      : false;

    if (!user || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: String(user.id),
      role: user.role,
    });

    return {
      accessToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}