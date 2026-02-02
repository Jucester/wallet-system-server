import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RechargeWalletDto {
  @ApiProperty({ description: 'Valor a recargar', example: 50000 })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  readonly amount: number
}
