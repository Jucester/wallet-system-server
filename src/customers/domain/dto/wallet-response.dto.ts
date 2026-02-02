import { Exclude, Expose, Transform } from 'class-transformer'
import { transformIdToString } from '../../../shared/domain/helpers/normalize-id-shared.helper'

@Exclude()
export class BalanceResponseDto {
  @Expose()
  @Transform(transformIdToString)
  walletId: string

  @Expose()
  balance: number

  @Expose()
  message?: string
}

@Exclude()
export class RechargeResponseDto {
  @Expose()
  previousBalance: number

  @Expose()
  amountRecharged: number

  @Expose()
  newBalance: number

  @Expose()
  message: string
}
