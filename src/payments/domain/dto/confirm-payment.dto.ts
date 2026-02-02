import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'ID de la sesión de pago' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  readonly sessionId: string

  @ApiProperty({ description: 'Token de 6 dígitos enviado al email', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El token debe tener exactamente 6 dígitos' })
  readonly token: string
}
