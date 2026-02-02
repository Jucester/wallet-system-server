import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserRoles } from '../../domain/entities/user-roles.interface'

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  readonly _id: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly firstName: string

  @ApiPropertyOptional()
  @IsString()
  readonly lastName: string

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly password: string

  @ApiPropertyOptional({ default: UserRoles.User, enum: UserRoles })
  @IsEnum(UserRoles)
  readonly role: UserRoles
}
