import { IsEmail, IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegisterDto {
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
  @IsOptional()
  readonly lastName: string

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly password: string
}
