import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getDatabaseStatus() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      success: true,
      message: 'GlowBook database connected successfully',
      database: 'MariaDB',
    };
  }
}