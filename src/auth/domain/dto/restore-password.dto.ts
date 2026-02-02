import { IsNotEmpty, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Match } from '../../../shared/infrastructure/nestjs/decorators/match.decorator'

export class RestorePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(4)
  readonly password: string

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(4)
  @Match('password', { message: 'Passwords do not match' })
  readonly confirmPassword: string
}
