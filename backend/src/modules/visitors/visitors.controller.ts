import {
    Controller, Get, Post, Patch, Body,
    Param, Query, UseGuards, ParseUUIDPipe,
    ParseIntPipe, DefaultValuePipe,
  } from '@nestjs/common';
  import { VisitorsService } from './visitors.service';
  import { CreateVisitorDto, CheckoutVisitorDto } from './dto';
  import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
  import { RolesGuard } from '../../common/guards/roles.guard';
  import { Roles } from '../../common/decorators/roles.decorator';
  import { CurrentUser } from '../../common/decorators/current-user.decorator';
  import { UserRole, User } from '../../database/entities/user.entity';
  
  @Controller('visitors')
  export class VisitorsController {
    constructor(private readonly visitorsService: VisitorsService) {}
  
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
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
  
    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.visitorsService.findOne(id);
    }
  
    @Post('checkin')
    checkin(
      @Body() dto: CreateVisitorDto,
      @CurrentUser() user?: User,
    ) {
      return this.visitorsService.checkin(dto, user);
    }
  
    @Patch(':id/checkout')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    checkout(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: CheckoutVisitorDto,
    ) {
      return this.visitorsService.checkout(id, dto);
    }
  }