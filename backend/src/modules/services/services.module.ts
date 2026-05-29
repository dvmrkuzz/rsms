import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { ServiceRequest } from '../../database/entities/service-request.entity';
import { DocumentType } from '../../database/entities/document-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceRequest, DocumentType]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}