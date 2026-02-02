import { Exclude, Expose, Type } from 'class-transformer'
import { UserResDto } from '../../../users/domain/dto/user.dto'

@Exclude()
export class UserWithTokenResDto {
  @Expose()
  @Type(() => UserResDto)
  user: UserResDto
  @Expose()
  token: string
}
