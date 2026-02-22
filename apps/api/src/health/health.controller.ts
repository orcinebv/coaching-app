import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  async check() {
    const checks: Record<string, { status: string; message?: string }> = {};

    // Database check
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      checks['database'] = { status: 'up' };
    } catch (error) {
      checks['database'] = {
        status: 'down',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    const allUp = Object.values(checks).every((c) => c.status === 'up');

    return {
      status: allUp ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    };
  }
}
