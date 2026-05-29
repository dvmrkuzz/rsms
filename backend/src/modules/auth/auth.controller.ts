import {
    Controller, Post, Get, Body,
    UseGuards, HttpCode, HttpStatus,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { LoginDto, RegisterDto } from './dto';
  import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
  import { CurrentUser } from '../../common/decorators/current-user.decorator';
  import { User } from '../../database/entities/user.entity';
  
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto) {
      return this.authService.login(dto);
    }
  
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterDto) {
      return this.authService.register(dto);
    }
  
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@CurrentUser() user: User) {
      return this.authService.getMe(user.id);
    }
  }