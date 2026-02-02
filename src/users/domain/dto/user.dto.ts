import { Exclude, Expose } from 'class-transformer'
import { UserRoles } from '../entities/user-roles.interface'

@Exclude()
export class UserResDto {
  @Expose()
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
  role: UserRoles
  @Expose()
  isBlocked: boolean
  @Expose()
  verification?: {
    email: boolean
  }
}
