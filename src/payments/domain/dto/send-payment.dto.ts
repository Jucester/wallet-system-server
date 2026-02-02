import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * DTO for P2P direct transfers.
 * The sender is authenticated (from JWT token).
 * The recipient is identified by document and phone.
 */
export class SendPaymentDto {
    @ApiProperty({ description: 'Documento de identificación del destinatario' })
    @IsString()
    @IsNotEmpty()
    readonly recipientDocument: string

    @ApiProperty({ description: 'Número de celular del destinatario' })
    @IsString()
    @IsNotEmpty()
    readonly recipientPhone: string

    @ApiProperty({ description: 'Monto a transferir', example: 10000 })
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    readonly amount: number
}
