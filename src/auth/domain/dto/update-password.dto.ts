import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdatePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly currentPassword: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly newPassword: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly confirmationPassword: string
}
