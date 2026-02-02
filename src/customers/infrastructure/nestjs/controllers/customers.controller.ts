import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { CustomersService } from '../../../application/services/customers.service'
import { WalletsService } from '../../../application/services/wallets.service'
import { RegisterCustomerDto } from '../../../domain/dto/register-customer.dto'
import { RechargeWalletDto } from '../../../domain/dto/recharge-wallet.dto'
import { JwtAuthGuard } from '../../../../auth/infrastructure/passport/guards/jwt-auth.guard'
import { AuthUser } from '../../../../shared/infrastructure/nestjs/decorators/auth-user.decorator'

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly _customersService: CustomersService,
    private readonly _walletsService: WalletsService,
  ) { }

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
  async getMe(@AuthUser('_id') userId: string) {
    return await this._customersService.findByUserId(userId)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('wallet/balance')
  @ApiOperation({ summary: 'Get wallet balance (consultarSaldo)' })
  async getBalance(@AuthUser('_id') userId: string) {
    return await this._walletsService.getBalanceByUserId(userId)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('wallet/recharge')
  @HttpCode(200)
  @ApiOperation({ summary: 'Recharge wallet (recargarBilletera)' })
  async rechargeWallet(@AuthUser('_id') userId: string, @Body() body: RechargeWalletDto) {
    return await this._walletsService.rechargeByUserId(userId, body.amount)
  }
}
