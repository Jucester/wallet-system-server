import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { PaymentsService } from '../../../application/services/payments.service'
import { RequestPaymentDto } from '../../../domain/dto/request-payment.dto'
import { ConfirmPaymentDto } from '../../../domain/dto/confirm-payment.dto'
import { JwtAuthGuard } from '../../../../auth/infrastructure/passport/guards/jwt-auth.guard'
import { RequestCustom } from '../../../../shared/infrastructure/nestjs/custom-types/custom-types.nestjs'

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly _paymentsService: PaymentsService) {}

  @Post('request')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request a payment (solicitarPago)' })
  async requestPayment(@Req() req: RequestCustom, @Body() body: RequestPaymentDto) {
    return await this._paymentsService.requestPayment(req.user._id, body.amount)
  }

  @Post('confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm a payment with OTP (confirmarPago)' })
  async confirmPayment(@Req() req: RequestCustom, @Body() body: ConfirmPaymentDto) {
    return await this._paymentsService.confirmPayment(req.user._id, body.sessionId, body.token)
  }
}
