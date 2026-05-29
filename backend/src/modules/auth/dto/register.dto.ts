import {
    IsEmail, IsString, MinLength,
    MaxLength, IsOptional, Matches,
  } from 'class-validator';
  
  export class RegisterDto {
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    firstName: string;
  
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName: string;
  
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email: string;
  
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
    )
    password: string;
  
    @IsOptional()
    @IsString()
    studentId?: string;
  }