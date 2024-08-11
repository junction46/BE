import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  BadRequestException,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtAuthGuard } from './Guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(@Req() req) {
    console.log('google-login');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    console.log('google-login-end');
    const user = req.user;
    const jwt = await this.authService.generateJwt(user);

    return res.redirect(`http://localhost:5173/callback?access_token=${jwt}`);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    return req.user;
  }
}