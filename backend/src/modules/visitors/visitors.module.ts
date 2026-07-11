import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitorsService } from './visitors.service';
import { VisitorsController } from './visitors.controller';
import { VisitorLog } from '../../database/entities/visitor-log.entity';
import { ServiceRequest } from '../../database/entities/service-request.entity';
import { DocumentType } from '../../database/entities/document-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VisitorLog, ServiceRequest, DocumentType])],
  controllers: [VisitorsController],
  providers: [VisitorsService],
  exports: [VisitorsService],
})
export class VisitorsModule {}