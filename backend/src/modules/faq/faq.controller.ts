import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, UseGuards, ParseUUIDPipe,
  } from '@nestjs/common';
  import { FaqService } from './faq.service';
  import { CreateFaqDto, UpdateFaqDto } from './dto';
  import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
  import { RolesGuard } from '../../common/guards/roles.guard';
  import { Roles } from '../../common/decorators/roles.decorator';
  import { CurrentUser } from '../../common/decorators/current-user.decorator';
  import { UserRole, User } from '../../database/entities/user.entity';
  
  @Controller('faqs')
  export class FaqController {
    constructor(private readonly faqService: FaqService) {}
  
    // Public endpoints
    @Get()
    findAll(
      @Query('search') search?: string,
      @Query('category') category?: string,
    ) {
      return this.faqService.findAll(search, category);
    }
  
    @Get('categories')
    findCategories() {
      return this.faqService.findCategories();
    }
  
    // Admin endpoints
    @Get('admin/all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    findAllAdmin(
      @Query('search') search?: string,
      @Query('category') category?: string,
    ) {
      return this.faqService.findAllAdmin(search, category);
    }
  
    @Get('admin/stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    getStats() {
      return this.faqService.getStats();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.faqService.findOne(id);
    }
  
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    create(
      @Body() dto: CreateFaqDto,
      @CurrentUser() user: User,
    ) {
      return this.faqService.create(dto, user);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateFaqDto,
    ) {
      return this.faqService.update(id, dto);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.faqService.remove(id);
    }
  }