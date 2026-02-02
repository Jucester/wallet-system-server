import { Exclude, Expose, Transform } from 'class-transformer'
import { initProp } from '../../../shared/domain/helpers/init_prop'
import { transformIdToString } from '../../../shared/domain/helpers/normalize-id-shared.helper'

export interface ICustomerEntity {
  _id: string
  userId: string
  document: string
  phone: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

@Exclude()
export class CustomerEntity implements ICustomerEntity {
  @Expose()
  @Transform(transformIdToString)
  _id: string

  @Expose()
  @Transform(transformIdToString)
  userId: string

  @Expose()
  document: string

  @Expose()
  phone: string

  @Expose()
  isActive: boolean

  @Expose()
  createdAt?: Date

  @Expose()
  updatedAt?: Date

  constructor(arg?: Partial<CustomerEntity>) {
    this._id = initProp(arg?._id)
    this.userId = initProp(arg?.userId)
    this.document = initProp(arg?.document)
    this.phone = initProp(arg?.phone)
    this.isActive = initProp(arg?.isActive)
    this.createdAt = initProp(arg?.createdAt)
    this.updatedAt = initProp(arg?.updatedAt)
  }
}
