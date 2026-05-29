import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions } from 'typeorm';
import {
  AuditLog,
  AuditAction,
} from '../../database/entities/audit-log.entity';

export interface CreateAuditLogDto {
  userId?: string;
  action: AuditAction;
  entityName: string;
  entityId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
}

export interface AuditQueryOptions {
  page?: number;
  limit?: number;
  userId?: string;
  action?: AuditAction;
  entityName?: string;
  from?: Date;
  to?: Date;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async log(dto: CreateAuditLogDto): Promise<void> {
    const entry = this.auditRepository.create({
      userId: dto.userId,
      action: dto.action,
      entityName: dto.entityName,
      entityId: dto.entityId,
      oldValue: dto.oldValue,
      newValue: dto.newValue,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      description: dto.description,
    });
    await this.auditRepository.save(entry);
  }

  async findAll(options: AuditQueryOptions = {}) {
    const {
      page = 1,
      limit = 20,
      userId,
      action,
      entityName,
      from,
      to,
    } = options;

    const skip = (page - 1) * limit;
    const where: FindManyOptions<AuditLog>['where'] = {};

    if (userId) Object.assign(where, { userId });
    if (action) Object.assign(where, { action });
    if (entityName) Object.assign(where, { entityName });
    if (from && to) Object.assign(where, { createdAt: Between(from, to) });

    const [logs, total] = await this.auditRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: { user: true },
    });

    return {
      data: logs.map((log) => ({
        ...log,
        user: log.user
          ? {
              id: log.user.id,
              firstName: log.user.firstName,
              lastName: log.user.lastName,
              email: log.user.email,
              role: log.user.role,
            }
          : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    return this.findAll({ userId, page, limit });
  }

  async findByEntity(entityName: string, entityId: string) {
    const logs = await this.auditRepository.find({
      where: { entityName, entityId },
      order: { createdAt: 'DESC' },
      relations: { user: true },
    });
    return logs;
  }
}