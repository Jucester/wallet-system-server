import { Exclude, Expose, Transform } from 'class-transformer'
import { transformIdToString } from '../../../shared/domain/helpers/normalize-id-shared.helper'
import { PaymentType } from '../entities/payment-type.enum'

@Exclude()
export class RequestPaymentResponseDto {
  @Expose()
  @Transform(transformIdToString)
  sessionId: string

  @Expose()
  message: string
}

@Exclude()
export class ConfirmPaymentResponseDto {
  @Expose()
  message: string

  @Expose()
  type: PaymentType

  @Expose()
  previousBalance: number

  @Expose()
  amountDeducted: number

  @Expose()
  newBalance: number
}

@Exclude()
export class SendPaymentResponseDto {
  @Expose()
  @Transform(transformIdToString)
  sessionId: string

  @Expose()
  message: string
}
