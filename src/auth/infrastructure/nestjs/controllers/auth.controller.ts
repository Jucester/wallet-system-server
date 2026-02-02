import { Body, Controller, Get, HttpCode, Param, Patch, Post, Put, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { AuthService } from '../../../application/services/auth.service'
import { LoginDto } from '../../../domain/dto/login.dto'
import { JwtAuthGuard } from '../../passport/guards/jwt-auth.guard'
import { RegisterDto } from '../../../domain/dto/register.dto'
import { UpdateMyInformationDto } from '../../../domain/dto/update-my-information.dto'
import { ForgotPasswordDto } from '../../../domain/dto/forgot-password.dto'
import { RestorePasswordDto } from '../../../domain/dto/restore-password.dto'
import { AuthUser } from '../../../../shared/infrastructure/nestjs/decorators/auth-user.decorator'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) { }

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
  async findByMe(@AuthUser('_id') userId: string) {
    return await this._authService.findByMe(userId)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateByMe(@AuthUser('_id') userId: string, @Body() body: UpdateMyInformationDto) {
    return await this._authService.updateByMe(userId, body)
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return await this._authService.forgotPassword(body)
  }

  @Put('restore-password/:token')
  async restorePassword(@Body() body: RestorePasswordDto, @Param('token') token: string) {
    return await this._authService.restorePassword(token, body)
  }
}
