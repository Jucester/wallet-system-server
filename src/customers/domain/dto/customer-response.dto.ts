import { Exclude, Expose, Transform, Type } from 'class-transformer'
import { transformIdToString } from '../../../shared/domain/helpers/normalize-id-shared.helper'

@Exclude()
export class WalletResponseDto {
  @Expose()
  @Transform(transformIdToString)
  _id: string

  @Expose()
  balance: number
}

@Exclude()
export class UserInCustomerResponseDto {
  @Expose()
  @Transform(transformIdToString)
  _id: string

  @Expose()
  firstName: string

  @Expose()
  lastName?: string

  @Expose()
  email: string
}

@Exclude()
export class CustomerResponseDto {
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
  @Type(() => UserInCustomerResponseDto)
  user?: UserInCustomerResponseDto

  @Expose()
  @Type(() => WalletResponseDto)
  wallet?: WalletResponseDto

  @Expose()
  createdAt?: Date
}

@Exclude()
export class CustomerWithTokenResponseDto {
  @Expose()
  @Type(() => CustomerResponseDto)
  customer: CustomerResponseDto

  @Expose()
  token: string
}
