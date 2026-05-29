import {
    IsString, MinLength, MaxLength,
    IsOptional, IsEmail,
  } from 'class-validator';
  
  export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    firstName?: string;
  
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName?: string;
  
    @IsOptional()
    @IsEmail()
    email?: string;
  
    @IsOptional()
    @IsString()
    studentId?: string;
  }