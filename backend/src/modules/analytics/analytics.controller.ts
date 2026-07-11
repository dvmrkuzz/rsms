import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AiReportService } from './ai-report.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly aiReportService: AiReportService,
  ) {}

  @Get()
  getAnalytics() {
    return this.analyticsService.getFullAnalytics();
  }

  @Get('requests')
  getRequestStats() {
    return this.analyticsService.getRequestStats();
  }

  @Get('documents')
  getDocumentStats() {
    return this.analyticsService.getDocumentStats();
  }

  @Get('visitors')
  getVisitorStats() {
    return this.analyticsService.getVisitorStats();
  }

  @Post('generate-report')
  @Roles(UserRole.ADMIN)
  generateReport() {
    return this.aiReportService.generateReport();
  }
}