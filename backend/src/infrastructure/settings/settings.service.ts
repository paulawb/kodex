import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

const ALLOWED_KEYS = ['banner', 'lookbook1', 'lookbook2'] as const;

export interface PublicSettings {
  banner: string | null;
  lookbook1: string | null;
  lookbook2: string | null;
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublic(): Promise<PublicSettings> {
    const rows = await this.prisma.siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return {
      banner: map.banner || null,
      lookbook1: map.lookbook1 || null,
      lookbook2: map.lookbook2 || null,
    };
  }

  async update(data: Record<string, unknown>): Promise<PublicSettings> {
    if (!data || typeof data !== 'object') {
      return this.getPublic();
    }

    for (const key of ALLOWED_KEYS) {
      if (!(key in data)) continue;
      const raw = (data as Record<string, unknown>)[key];
      const value = typeof raw === 'string' ? raw : '';

      if (!value) {
        await this.prisma.siteSetting.deleteMany({ where: { key } });
        continue;
      }

      await this.prisma.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }

    return this.getPublic();
  }
}
