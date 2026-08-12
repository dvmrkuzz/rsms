import {
  Controller, Get, Post, Patch, Body,
  Param, Query, UseGuards, ParseUUIDPipe,
  ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { CreateInquiryDto, FeedbackDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, User } from '../../database/entities/user.entity';

@Controller('inquiries')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.inquiryService.findAll(page, limit);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.inquiryService.getStats();
  }

  @Get('session/:sessionId')
  findBySession(@Param('sessionId') sessionId: string) {
    return this.inquiryService.findBySession(sessionId);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: User) {
    return this.inquiryService.findMine(user.id);
  }

  @Post()
  create(@Body() dto: CreateInquiryDto) {
    return this.inquiryService.create(dto);
  }

  @Patch(':id/feedback')
  submitFeedback(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FeedbackDto,
  ) {
    return this.inquiryService.submitFeedback(id, dto);
  }
}