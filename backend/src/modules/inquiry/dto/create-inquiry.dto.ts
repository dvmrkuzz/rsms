import { IsString, IsEnum, IsOptional, IsUUID, MinLength } from 'class-validator';
import { InquiryInterface } from '../../../database/entities/inquiry.entity';

export class CreateInquiryDto {
  @IsString()
  sessionId: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  @MinLength(3)
  question: string;

  @IsEnum(InquiryInterface)
  interface: InquiryInterface;
}