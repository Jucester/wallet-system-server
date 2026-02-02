import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { PaymentsService } from '../../../application/services/payments.service'
import { RequestPaymentDto } from '../../../domain/dto/request-payment.dto'
import { ConfirmPaymentDto } from '../../../domain/dto/confirm-payment.dto'
import { JwtAuthGuard } from '../../../../auth/infrastructure/passport/guards/jwt-auth.guard'
import { AuthUser } from '../../../../shared/infrastructure/nestjs/decorators/auth-user.decorator'

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly _paymentsService: PaymentsService) { }

  @Post('request')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request a payment (solicitarPago)' })
  async requestPayment(@AuthUser('_id') userId: string, @Body() body: RequestPaymentDto) {
    return await this._paymentsService.requestPayment(userId, body.amount)
  }

  @Post('confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm a payment with OTP (confirmarPago)' })
  async confirmPayment(@AuthUser('_id') userId: string, @Body() body: ConfirmPaymentDto) {
    return await this._paymentsService.confirmPayment(userId, body.sessionId, body.token)
  }
}
