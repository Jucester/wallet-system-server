import { IsEmail, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly currentEmail: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly newEmail: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly confirmationEmail: string

  @ApiProperty()
  @IsNotEmpty()
  readonly password: string
}
