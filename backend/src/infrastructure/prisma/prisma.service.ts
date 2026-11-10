import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Prisma');

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Base de datos conectada');
    } catch (error: any) {
      // Si la base de datos no responde, el servidor arranca igual:
      // /health funciona y las rutas de datos devuelven error controlado.
      this.logger.error(`No se pudo conectar a la base de datos: ${error?.message || error}`);
    }
  }
}
