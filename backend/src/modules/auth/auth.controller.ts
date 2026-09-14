import {
    Controller, Post, Get, Body,
    UseGuards, HttpCode, HttpStatus, Res,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { AuthGuard } from '@nestjs/passport';
  import type { Response } from 'express';
  import { AuthService } from './auth.service';
  import { LoginDto, RegisterDto } from './dto';
  import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
  import { CurrentUser } from '../../common/decorators/current-user.decorator';
  import { User } from '../../database/entities/user.entity';

  @Controller('auth')
  export class AuthController {
    constructor(
      private readonly authService: AuthService,
      private readonly configService: ConfigService,
    ) {}

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

    @Get('has-pin')
    @UseGuards(JwtAuthGuard)
    async hasPin(@CurrentUser() user: User) {
      return this.authService.hasPin(user.id);
    }

    @Post('set-pin')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async setPin(@CurrentUser() user: User, @Body('pin') pin: string) {
      return this.authService.setPin(user.id, pin);
    }

    @Post('verify-pin')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async verifyPin(@CurrentUser() user: User, @Body('pin') pin: string) {
      return this.authService.verifyPin(user.id, pin);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleAuth() {
      // Passport redirects to Google's consent screen — this body never runs.
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleAuthCallback(@CurrentUser() user: User, @Res() res: Response) {
      const { accessToken } = this.authService.issueTokenFor(user);
      const frontendUrl = this.configService.get<string>('asksorsuUrl');
      res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
    }
  }