import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

const WRITE_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE'];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    if (!WRITE_METHODS.includes(method) || !user?.userId) {
      return next.handle();
    }

    const resource = this.extractResource(url);
    const resourceId = this.extractResourceId(url);

    return next.handle().pipe(
      tap(() => {
        this.prisma.auditLog
          .create({
            data: {
              userId: user.userId,
              action: method,
              resource,
              resourceId,
              newValue: JSON.stringify(request.body || {}),
              ipAddress: ip || headers['x-forwarded-for'] || 'unknown',
              userAgent: headers['user-agent'] || 'unknown',
            },
          })
          .catch(() => {
            // Audit logging failures should never break the request
          });
      }),
    );
  }

  private extractResource(url: string): string {
    const parts = url.split('/').filter(Boolean);
    return parts[0] || 'unknown';
  }

  private extractResourceId(url: string): string | null {
    const parts = url.split('/').filter(Boolean);
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const idPart = parts.find((p) => uuidPattern.test(p));
    return idPart || null;
  }
}
