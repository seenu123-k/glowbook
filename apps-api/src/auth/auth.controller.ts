import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // =========================
  // REGISTER
  // POST /auth/register
  // =========================
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // =========================
  // LOGIN
  // POST /auth/login
  // =========================
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // =========================
  // GET MY PROFILE
  // GET /auth/profile
  // =========================
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() request: any) {
    return this.authService.getProfile(
      request.user.userId,
    );
  }

  // =========================
  // UPDATE MY PROFILE
  // PATCH /auth/profile
  // =========================
  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  updateProfile(
    @Req() request: any,
    @Body() body: {
      name?: string;
      phone?: string;
    },
  ) {
    return this.authService.updateProfile(
      request.user.userId,
      body.name,
      body.phone,
    );
  }
}