import { Module } from '@nestjs/common';
import { AuditInterceptor } from './audit.interceptor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AuditInterceptor],
  exports: [AuditInterceptor],
})
export class AuditModule {}
