import { Exclude } from 'class-transformer'
import { PartialType } from '@nestjs/mapped-types'
import { UserRoles } from '../../../users/domain/entities/user-roles.interface'
import { CreateUserDto } from '../../../users/domain/dto/create-user.dto'

export class UpdateMyInformationDto extends PartialType(CreateUserDto) {
  @Exclude()
  role: UserRoles

  @Exclude()
  verification: string

  @Exclude()
  password: string

  @Exclude()
  email: string
}
