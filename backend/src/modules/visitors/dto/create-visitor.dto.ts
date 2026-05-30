import {
    IsString, IsOptional, IsEnum,
    MinLength, MaxLength,
  } from 'class-validator';
  import { VisitorPurpose } from '../../../database/entities/visitor-log.entity';
  
  export class CreateVisitorDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    visitorName: string;
  
    @IsOptional()
    @IsString()
    contactNumber?: string;
  
    @IsOptional()
    @IsString()
    studentId?: string;
  
    @IsEnum(VisitorPurpose)
    purpose: VisitorPurpose;
  
    @IsOptional()
    @IsString()
    purposeDetails?: string;
  
    @IsOptional()
    @IsString()
    notes?: string;
  }