import { IsString, MinLength, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateFaqDto {
  @IsString()
  @MinLength(5)
  question: string;

  @IsString()
  @MinLength(5)
  answer: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}