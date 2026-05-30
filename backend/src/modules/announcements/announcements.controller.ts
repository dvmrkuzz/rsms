import {
    Controller, Get, Post, Patch, Body,
    Param, Query, UseGuards, ParseUUIDPipe,
    ParseIntPipe, DefaultValuePipe,
  } from '@nestjs/common';
  import { AnnouncementsService } from './announcements.service';
  import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto';
  import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
  import { RolesGuard } from '../../common/guards/roles.guard';
  import { Roles } from '../../common/decorators/roles.decorator';
  import { CurrentUser } from '../../common/decorators/current-user.decorator';
  import { UserRole, User } from '../../database/entities/user.entity';
  import { AnnouncementTarget } from '../../database/entities/announcement.entity';
  
  @Controller('announcements')
  export class AnnouncementsController {
    constructor(private readonly announcementsService: AnnouncementsService) {}
  
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('target') target?: AnnouncementTarget,
    ) {
      return this.announcementsService.findAll(page, limit, target);
    }
  
    @Get('active')
    findActive(@Query('target') target?: AnnouncementTarget) {
      return this.announcementsService.findActive(target);
    }
  
    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.announcementsService.findOne(id);
    }
  
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    create(
      @Body() dto: CreateAnnouncementDto,
      @CurrentUser() user: User,
    ) {
      return this.announcementsService.create(dto, user);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateAnnouncementDto,
    ) {
      return this.announcementsService.update(id, dto);
    }
  
    @Patch(':id/deactivate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    deactivate(@Param('id', ParseUUIDPipe) id: string) {
      return this.announcementsService.deactivate(id);
    }
  }