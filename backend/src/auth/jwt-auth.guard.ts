import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { UserRole } from './user.entity.js';

export type CurrentUser = { id: number; role: UserRole };

export type AuthenticatedRequest = {
  headers: { authorization?: string };
  user?: CurrentUser;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    let payload: { sub: string; role: UserRole };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const id = Number(payload.sub);
    if (!Number.isInteger(id) || id < 1) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = { id, role: payload.role };
    return true;
  }
}