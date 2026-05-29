import {
    Controller, Get, Post, Patch, Body,
    Param, Query, UseGuards, ParseUUIDPipe,
    ParseIntPipe, DefaultValuePipe,
  } from '@nestjs/common';
  import { ServicesService } from './services.service';
  import { CreateServiceRequestDto, UpdateStatusDto } from './dto';
  import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
  import { RolesGuard } from '../../common/guards/roles.guard';
  import { Roles } from '../../common/decorators/roles.decorator';
  import { CurrentUser } from '../../common/decorators/current-user.decorator';
  import { UserRole, User } from '../../database/entities/user.entity';
  import { RequestStatus } from '../../database/entities/service-request.entity';
  
  @Controller('service-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class ServicesController {
    constructor(private readonly servicesService: ServicesService) {}
  
    @Get()
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('status') status?: RequestStatus,
      @Query('userId') userId?: string,
    ) {
      return this.servicesService.findAll(page, limit, status, userId);
    }
  
    @Get('my-requests')
    findMyRequests(
      @CurrentUser() user: User,
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
      return this.servicesService.findMyRequests(user.id, page, limit);
    }
  
    @Get('track/:trackingNumber')
    findByTracking(@Param('trackingNumber') trackingNumber: string) {
      return this.servicesService.findByTracking(trackingNumber);
    }
  
    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.servicesService.findOne(id);
    }
  
    @Post()
    create(
      @Body() dto: CreateServiceRequestDto,
      @CurrentUser() user: User,
    ) {
      return this.servicesService.create(dto, user);
    }
  
    @Patch(':id/status')
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    updateStatus(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateStatusDto,
      @CurrentUser() user: User,
    ) {
      return this.servicesService.updateStatus(id, dto, user);
    }
  
    @Patch(':id/cancel')
    cancel(
      @Param('id', ParseUUIDPipe) id: string,
      @CurrentUser() user: User,
    ) {
      return this.servicesService.cancel(id, user);
    }
  }