import { IsString, IsOptional } from 'class-validator';

export class KioskCheckinDto {
  @IsString()
  visitorName: string;

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsString()
  purpose: string;

  @IsOptional()
  @IsString()
  documentTypeId?: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}