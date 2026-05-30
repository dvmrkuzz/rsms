import { IsOptional, IsString } from 'class-validator';

export class CheckoutVisitorDto {
  @IsOptional()
  @IsString()
  notes?: string;
}