import {
    IsUUID, IsString, IsOptional,
    IsInt, Min, Max,
  } from 'class-validator';
  
  export class CreateServiceRequestDto {
    @IsUUID()
    documentTypeId: string;
  
    @IsOptional()
    @IsString()
    purpose?: string;
  
    @IsInt()
    @Min(1)
    @Max(10)
    copies: number;
  
    @IsOptional()
    @IsString()
    remarks?: string;
  }