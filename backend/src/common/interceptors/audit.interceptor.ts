import {
    Injectable, NestInterceptor, ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable, tap } from 'rxjs';
  import { AuditService } from '../../modules/audit/audit.service';
  import { AuditAction } from '../../database/entities/audit-log.entity';
  
  const METHOD_ACTION_MAP: Record<string, AuditAction> = {
    POST: AuditAction.CREATE,
    PUT: AuditAction.UPDATE,
    PATCH: AuditAction.UPDATE,
    DELETE: AuditAction.DELETE,
  };
  
  const SENSITIVE_FIELDS = [
    'password', 'passwordHash', 'currentPassword',
    'newPassword', 'confirmPassword', 'token', 'secret',
  ];
  
  @Injectable()
  export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly auditService: AuditService) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const { method, url, user, ip, headers } = request;
  
      const action = METHOD_ACTION_MAP[method];
      if (!action || !user) return next.handle();
  
      const urlParts = url.split('/').filter(Boolean);
      const entityName = urlParts[2] ?? 'unknown';
  
      const sanitizedBody = { ...request.body };
      SENSITIVE_FIELDS.forEach((field) => delete sanitizedBody[field]);
  
      return next.handle().pipe(
        tap((responseData) => {
          const entityId = responseData?.id ?? urlParts[3] ?? undefined;
  
          this.auditService.log({
            userId: user.id,
            action,
            entityName,
            entityId,
            newValue: method !== 'DELETE' ? sanitizedBody : undefined,
            ipAddress: ip,
            userAgent: headers['user-agent'],
            description: `${method} ${url}`,
          }).catch(() => {
            // Never let audit logging break the main request
          });
        }),
      );
    }
  }