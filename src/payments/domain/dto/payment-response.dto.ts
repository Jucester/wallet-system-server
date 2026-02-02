import { Exclude, Expose, Transform } from 'class-transformer'
import { transformIdToString } from '../../../shared/domain/helpers/normalize-id-shared.helper'

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
  previousBalance: number

  @Expose()
  amountDeducted: number

  @Expose()
  newBalance: number
}
