import {
    IsString, IsEnum, IsOptional,
    IsBoolean, IsDateString, MinLength, IsArray,
  } from 'class-validator';
  import { AnnouncementTarget } from '../../../database/entities/announcement.entity';
  
  export class UpdateAnnouncementDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    title?: string;
  
    @IsOptional()
    @IsString()
    content?: string;
  
    @IsOptional()
    @IsEnum(AnnouncementTarget)
    target?: AnnouncementTarget;
  
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
  
    @IsOptional()
    @IsDateString()
    expiresAt?: string;

    @IsOptional()
    @IsString()
    imageBase64?: string;

        @IsOptional()
    @IsArray()
    @IsString({ each: true })
    imageBase64List?: string[];
    
  }