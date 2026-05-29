import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RequestStatus } from '../../../database/entities/service-request.entity';

export class UpdateStatusDto {
  @IsEnum(RequestStatus, {
    message: 'Status must be: pending, processing, ready, released, cancelled, or rejected',
  })
  status: RequestStatus;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}