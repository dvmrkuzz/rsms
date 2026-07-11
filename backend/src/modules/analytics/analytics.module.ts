import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AiReportService } from './ai-report.service';
import { AnalyticsController } from './analytics.controller';
import { ServiceRequest } from '../../database/entities/service-request.entity';
import { VisitorLog } from '../../database/entities/visitor-log.entity';
import { DocumentType } from '../../database/entities/document-type.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceRequest, VisitorLog, DocumentType, User]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AiReportService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}