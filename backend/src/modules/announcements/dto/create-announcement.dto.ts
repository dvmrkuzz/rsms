import {
    IsString, IsEnum, IsOptional,
    IsBoolean, IsDateString, MinLength,
  } from 'class-validator';
  import { AnnouncementTarget } from '../../../database/entities/announcement.entity';
  
  export class CreateAnnouncementDto {
    @IsString()
    @MinLength(3)
    title: string;
  
    @IsString()
    @MinLength(10)
    content: string;
  
    @IsEnum(AnnouncementTarget)
    target: AnnouncementTarget;
  
    @IsOptional()
    @IsDateString()
    expiresAt?: string;
  }