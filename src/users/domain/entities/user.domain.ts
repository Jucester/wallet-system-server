import { Exclude, Expose, Transform } from 'class-transformer'
import { initProp } from '../../../shared/domain/helpers/init_prop'
import { UserRoles } from './user-roles.interface'
import { transformIdToString } from '../../../shared/domain/helpers/normalize-id-shared.helper'

export interface IUserEntity {
  _id: string
  firstName: string
  lastName: string
  email: string
  password?: string
  isBlocked: boolean
  role: string

  verification?: {
    email: boolean
  }

  fullName?: string
  logo?: string
}

@Exclude()
export class UserEntity implements IUserEntity {
  @Expose()
  @Transform(transformIdToString)
  _id: string

  @Expose()
  firstName: string

  @Expose()
  lastName: string

  @Expose()
  fullName?: string

  @Expose()
  email: string

  @Expose()
  password?: string

  @Expose()
  isBlocked: boolean

  @Expose()
  role: UserRoles

  @Expose()
  verification?: {
    email: boolean
  }

  @Expose()
  logo?: string

  constructor(arg?: Partial<UserEntity>) {
    this._id = initProp(arg?._id)
    this.firstName = initProp(arg?.firstName)
    this.lastName = initProp(arg?.lastName)
    this.fullName = initProp(arg?.fullName)
    this.email = initProp(arg?.email)
    this.password = initProp(arg?.password)
    this.isBlocked = initProp(arg?.isBlocked)
    this.role = initProp(arg?.role)
    this.verification = initProp(arg?.verification)
    this.logo = initProp(arg?.logo)
  }
}
