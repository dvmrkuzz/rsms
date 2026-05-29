import {
    Controller, Get, Param, Query,
    UseGuards, ParseUUIDPipe,
    ParseIntPipe, DefaultValuePipe,
  } from '@nestjs/common';
  import { AuditService } from './audit.service';
  import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
  import { RolesGuard } from '../../common/guards/roles.guard';
  import { Roles } from '../../common/decorators/roles.decorator';
  import { UserRole } from '../../database/entities/user.entity';
  import { AuditAction } from '../../database/entities/audit-log.entity';
  
  @Controller('audit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  export class AuditController {
    constructor(private readonly auditService: AuditService) {}
  
    @Get()
    findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
      @Query('userId') userId?: string,
      @Query('action') action?: AuditAction,
      @Query('entityName') entityName?: string,
      @Query('from') from?: string,
      @Query('to') to?: string,
    ) {
      return this.auditService.findAll({
        page,
        limit,
        userId,
        action,
        entityName,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      });
    }
  
    @Get('user/:userId')
    findByUser(
      @Param('userId', ParseUUIDPipe) userId: string,
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    ) {
      return this.auditService.findByUser(userId, page, limit);
    }
  
    @Get('entity/:entityName/:entityId')
    findByEntity(
      @Param('entityName') entityName: string,
      @Param('entityId') entityId: string,
    ) {
      return this.auditService.findByEntity(entityName, entityId);
    }
  }