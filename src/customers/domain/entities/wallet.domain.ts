import { Exclude, Expose, Transform } from 'class-transformer'
import { initProp } from '../../../shared/domain/helpers/init_prop'
import { transformIdToString } from '../../../shared/domain/helpers/normalize-id-shared.helper'

export interface IWalletEntity {
  _id: string
  customerId: string
  balance: number
  createdAt?: Date
  updatedAt?: Date
}

@Exclude()
export class WalletEntity implements IWalletEntity {
  @Expose()
  @Transform(transformIdToString)
  _id: string

  @Expose()
  @Transform(transformIdToString)
  customerId: string

  @Expose()
  balance: number

  @Expose()
  createdAt?: Date

  @Expose()
  updatedAt?: Date

  constructor(arg?: Partial<WalletEntity>) {
    this._id = initProp(arg?._id)
    this.customerId = initProp(arg?.customerId)
    this.balance = initProp(arg?.balance)
    this.createdAt = initProp(arg?.createdAt)
    this.updatedAt = initProp(arg?.updatedAt)
  }
}
