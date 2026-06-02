import { IsString, IsOptional, IsInt, IsBoolean, MinLength } from 'class-validator';

export class UpdateFaqDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  question?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  answer?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}