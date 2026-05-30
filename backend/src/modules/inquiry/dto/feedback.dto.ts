import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FeedbackDto {
  @IsBoolean()
  isHelpful: boolean;

  @IsOptional()
  @IsString()
  feedbackNote?: string;
}