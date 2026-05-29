import {
    IsEmail, IsString, MinLength,
    MaxLength, IsOptional, IsEnum, Matches,
  } from 'class-validator';
  import { UserRole } from '../../../database/entities/user.entity';
  
  export class CreateUserDto {
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
    @MinLength(8)
    @Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      { message: 'Password must contain uppercase, lowercase, and a number' },
    )
    password: string;
  
    @IsEnum(UserRole)
    role: UserRole;
  
    @IsOptional()
    @IsString()
    studentId?: string;
  }