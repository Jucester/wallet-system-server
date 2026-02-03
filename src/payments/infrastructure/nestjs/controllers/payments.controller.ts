import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { PaymentsService } from '../../../application/services/payments.service'
import { TransactionsService } from '../../../application/services/transactions.service'
import { RequestPaymentDto } from '../../../domain/dto/request-payment.dto'
import { SendPaymentDto } from '../../../domain/dto/send-payment.dto'
import { ConfirmPaymentDto } from '../../../domain/dto/confirm-payment.dto'
import { JwtAuthGuard } from '../../../../auth/infrastructure/passport/guards/jwt-auth.guard'
import { AuthUser } from '../../../../shared/infrastructure/nestjs/decorators/auth-user.decorator'
import { QueryPaginationDto } from '../../../../shared/domain/dto/query-pagination.dto'

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly _paymentsService: PaymentsService,
    private readonly _transactionsService: TransactionsService,
  ) { }

  @Post('request')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Request a payment (Merchant Flow)',
    description: 'Initiate a payment to a merchant. Payer is authenticated via JWT.',
  })
  async requestPayment(@AuthUser('_id') userId: string, @Body() body: RequestPaymentDto) {
    return await this._paymentsService.requestPayment(userId, body.merchantId, body.amount)
  }

  @Post('send')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Send payment (P2P Transfer)',
    description: 'Send money directly to another customer. Authenticated endpoint.',
  })
  async sendPayment(@AuthUser('_id') userId: string, @Body() body: SendPaymentDto) {
    return await this._paymentsService.sendPayment(userId, body.recipientDocument, body.recipientPhone, body.amount)
  }

  @Post('confirm')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Confirm a payment with OTP',
    description: 'Confirm a pending payment (merchant or P2P) using the OTP token.',
  })
  async confirmPayment(@AuthUser('_id') userId: string, @Body() body: ConfirmPaymentDto) {
    return await this._paymentsService.confirmPayment(userId, body.sessionId, body.token)
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get transaction history',
    description: 'Get paginated list of all wallet transactions (payments, transfers, recharges).',
  })
  async getTransactionHistory(@AuthUser('_id') userId: string, @Query() query: QueryPaginationDto) {
    return await this._transactionsService.getTransactionHistoryByUserId(userId, query)
  }
}
