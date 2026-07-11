import {
  Controller, Get, Post, Patch, Body,
  Param, Query, UseGuards, ParseUUIDPipe,
  ParseIntPipe, DefaultValuePipe, Request,
} from '@nestjs/common';
import { VisitorsService } from './visitors.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Get('document-types')
  getPublicDocumentTypes() {
    return this.visitorsService.getPublicDocumentTypes();
  }

  @Post('checkin')
  kioskCheckin(@Body() dto: any) {
    return this.visitorsService.kioskCheckin(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('date') date?: string,
  ) {
    return this.visitorsService.findAll(page, limit, date);
  }

  @Get('stats/today')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getTodayStats() {
    return this.visitorsService.getTodayStats();
  }

  @Get('queue/today')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getTodayQueue() {
    return this.visitorsService.getTodayQueue();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.visitorsService.findOne(id);
  }

  @Patch(':id/serve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  markServed(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.visitorsService.markServed(id, req.user.id);
  }
}