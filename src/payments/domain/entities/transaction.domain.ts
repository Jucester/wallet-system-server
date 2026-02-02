import { Exclude, Expose, Transform } from 'class-transformer'
import { initProp } from '../../../shared/domain/helpers/init_prop'
import { transformIdToString } from '../../../shared/domain/helpers/normalize-id-shared.helper'
import { TransactionType } from './transaction-type.enum'

export interface ITransactionEntity {
  _id: string
  walletId: string
  type: TransactionType
  amount: number
  balanceBefore: number
  balanceAfter: number
  referenceId?: string
  description?: string
  createdAt?: Date
}

@Exclude()
export class TransactionEntity implements ITransactionEntity {
  @Expose()
  @Transform(transformIdToString)
  _id: string

  @Expose()
  @Transform(transformIdToString)
  walletId: string

  @Expose()
  type: TransactionType

  @Expose()
  amount: number

  @Expose()
  balanceBefore: number

  @Expose()
  balanceAfter: number

  @Expose()
  @Transform(transformIdToString)
  referenceId?: string

  @Expose()
  description?: string

  @Expose()
  createdAt?: Date

  constructor(arg?: Partial<TransactionEntity>) {
    this._id = initProp(arg?._id)
    this.walletId = initProp(arg?.walletId)
    this.type = initProp(arg?.type)
    this.amount = initProp(arg?.amount)
    this.balanceBefore = initProp(arg?.balanceBefore)
    this.balanceAfter = initProp(arg?.balanceAfter)
    this.referenceId = initProp(arg?.referenceId)
    this.description = initProp(arg?.description)
    this.createdAt = initProp(arg?.createdAt)
  }
}
