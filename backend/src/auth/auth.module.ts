import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { AdminGuard } from './admin.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: 3600 },
      }),
    }),
  ],
  providers: [AuthService, JwtAuthGuard, AdminGuard],
  controllers: [AuthController],
  exports: [JwtModule, JwtAuthGuard, AdminGuard],
})
export class AuthModule {}