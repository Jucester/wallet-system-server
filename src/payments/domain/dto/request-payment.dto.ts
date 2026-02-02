import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RequestPaymentDto {
  @ApiProperty({ description: 'Valor de la compra', example: 25000 })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  readonly amount: number
}
