import { Exclude, Expose, Transform } from 'class-transformer'
import { initProp } from '../../../shared/domain/helpers/init_prop'
import { transformIdToString } from '../../../shared/domain/helpers/normalize-id-shared.helper'
import { PaymentStatus } from './payment-status.enum'

export interface IPaymentSessionEntity {
  _id: string
  customerId: string
  walletId: string
  amount: number
  otp: string
  status: PaymentStatus
  expiresAt: Date
  createdAt?: Date
  confirmedAt?: Date
}

@Exclude()
export class PaymentSessionEntity implements IPaymentSessionEntity {
  @Expose()
  @Transform(transformIdToString)
  _id: string

  @Expose()
  @Transform(transformIdToString)
  customerId: string

  @Expose()
  @Transform(transformIdToString)
  walletId: string

  @Expose()
  amount: number

  @Expose()
  otp: string

  @Expose()
  status: PaymentStatus

  @Expose()
  expiresAt: Date

  @Expose()
  createdAt?: Date

  @Expose()
  confirmedAt?: Date

  constructor(arg?: Partial<PaymentSessionEntity>) {
    this._id = initProp(arg?._id)
    this.customerId = initProp(arg?.customerId)
    this.walletId = initProp(arg?.walletId)
    this.amount = initProp(arg?.amount)
    this.otp = initProp(arg?.otp)
    this.status = initProp(arg?.status)
    this.expiresAt = initProp(arg?.expiresAt)
    this.createdAt = initProp(arg?.createdAt)
    this.confirmedAt = initProp(arg?.confirmedAt)
  }
}
