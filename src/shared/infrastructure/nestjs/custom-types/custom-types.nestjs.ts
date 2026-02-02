import { Request } from 'express'
import { UserEntity } from '../../../../users/domain/entities/user.domain'

export type RequestCustom = Request & {
  user: UserEntity
}
