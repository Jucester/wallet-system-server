import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { CustomersService } from '../../../application/services/customers.service'
import { WalletsService } from '../../../application/services/wallets.service'
import { RegisterCustomerDto } from '../../../domain/dto/register-customer.dto'
import { RechargeWalletDto } from '../../../domain/dto/recharge-wallet.dto'
import { JwtAuthGuard } from '../../../../auth/infrastructure/passport/guards/jwt-auth.guard'
import { RequestCustom } from '../../../../shared/infrastructure/nestjs/custom-types/custom-types.nestjs'

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly _customersService: CustomersService,
    private readonly _walletsService: WalletsService,
  ) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new customer (registroCliente)' })
  async register(@Body() body: RegisterCustomerDto) {
    return await this._customersService.register(body)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current customer profile' })
  async getMe(@Req() req: RequestCustom) {
    return await this._customersService.findByUserId(req.user._id)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('wallet/balance')
  @ApiOperation({ summary: 'Get wallet balance (consultarSaldo)' })
  async getBalance(@Req() req: RequestCustom) {
    return await this._walletsService.getBalanceByUserId(req.user._id)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('wallet/recharge')
  @HttpCode(200)
  @ApiOperation({ summary: 'Recharge wallet (recargarBilletera)' })
  async rechargeWallet(@Req() req: RequestCustom, @Body() body: RechargeWalletDto) {
    return await this._walletsService.rechargeByUserId(req.user._id, body.amount)
  }
}
