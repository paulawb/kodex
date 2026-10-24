import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const password = request.headers['x-admin-password'] || request.body?.adminPassword;

    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!password || password !== adminPassword) {
      throw new UnauthorizedException('No autorizado');
    }
    return true;
  }
}
