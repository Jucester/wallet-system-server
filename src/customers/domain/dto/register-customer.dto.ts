import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegisterCustomerDto {
  @ApiProperty({ description: 'Documento de identificación' })
  @IsString()
  @IsNotEmpty()
  readonly document: string

  @ApiProperty({ description: 'Nombres del cliente' })
  @IsString()
  @IsNotEmpty()
  readonly firstName: string

  @ApiPropertyOptional({ description: 'Apellidos del cliente' })
  @IsString()
  @IsOptional()
  readonly lastName?: string

  @ApiProperty({ description: 'Correo electrónico' })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string

  @ApiProperty({ description: 'Número de celular' })
  @IsString()
  @IsNotEmpty()
  readonly phone: string

  @ApiProperty({ description: 'Contraseña', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string
}
