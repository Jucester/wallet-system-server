import { Body, Controller, Get, HttpCode, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { AuthService } from '../../../application/services/auth.service'
import { LoginDto } from '../../../domain/dto/login.dto'
import { JwtAuthGuard } from '../../passport/guards/jwt-auth.guard'
import { RegisterDto } from '../../../domain/dto/register.dto'
import { UpdateMyInformationDto } from '../../../domain/dto/update-my-information.dto'
import { ForgotPasswordDto } from '../../../domain/dto/forgot-password.dto'
import { RestorePasswordDto } from '../../../domain/dto/restore-password.dto'
import { RequestCustom } from '../../../../shared/infrastructure/nestjs/custom-types/custom-types.nestjs'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() body: RegisterDto) {
    return await this._authService.register(body)
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto) {
    return await this._authService.login(body)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findByMe(@Req() req: RequestCustom) {
    return await this._authService.findByMe(req.user._id)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateByMe(@Req() req: RequestCustom, @Body() body: UpdateMyInformationDto) {
    return await this._authService.updateByMe(req.user._id, body)
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return await this._authService.forgotPassword(body)
  }

  @Put('restore-password/:token')
  async restorePassword(@Body() body: RestorePasswordDto, @Param('token') token: string) {
    return await this._authService.restorePassword(token, body)
  }

  // @ApiBearerAuth()
  // @Get('verify-token')
  // @UseGuards(JwtAuthGuard)
  // verifyToken() {
  //   return {
  //     token: 'OK',
  //   };
  // }

  // @ApiBearerAuth()
  // @Patch('update-email')
  // @UseGuards(JwtAuthGuard)
  // async updateEmail(@Body() body: UpdateEmailDto) {
  //   return await this._authService.updateEmail(body);
  // }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @Patch('update-password')
  // async updatePassword(@Req() req: Request, @Body() body: UpdatePasswordDto) {
  //   return await this._authService.updatePassword(body, req.user._id);
  // }

  // @Get('verification/:token')
  // async verify(@Param('token') token: string) {
  //   return await this._authService.verify(token);
  // }
}
