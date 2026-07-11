import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentType } from '../../database/entities/document-type.entity';
import { FaqModule } from '../faq/faq.module';
import { ServicesModule } from '../services/services.module';
import { InquiryModule } from '../inquiry/inquiry.module';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { IngestionService } from './ingestion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentType]),
    FaqModule,
    ServicesModule,
    InquiryModule,
  ],
  controllers: [AssistantController],
  providers: [AssistantService, IngestionService],
})
export class AssistantModule {}
