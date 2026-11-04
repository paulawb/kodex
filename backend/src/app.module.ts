import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { ProductModule } from '@presentation/product/product.module';
import { AdminModule } from '@presentation/admin/admin.module';
import { SettingsModule } from '@presentation/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProductModule,
    AdminModule,
    SettingsModule,
  ],
})
export class AppModule {}
