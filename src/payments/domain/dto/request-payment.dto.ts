import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * DTO for merchant-initiated payment requests.
 * The merchant is identified by merchantId (customer _id).
 * The payer is authenticated (from JWT token).
 */
export class RequestPaymentDto {
  @ApiProperty({ description: 'ID del comercio/merchant que recibe el pago' })
  @IsString()
  @IsNotEmpty()
  readonly merchantId: string

  @ApiProperty({ description: 'Valor de la compra', example: 25000 })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  readonly amount: number
}
