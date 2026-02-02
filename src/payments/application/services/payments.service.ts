import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { v4 as uuidv4 } from 'uuid'

import { PaymentSessionEntity } from '../../domain/entities/payment-session.domain'
import { PaymentStatus } from '../../domain/entities/payment-status.enum'
import { TransactionType } from '../../domain/entities/transaction-type.enum'
import { PaymentSessionsRepositoryDomain } from '../../domain/repository/payment-sessions.repository.domain'
import { RequestPaymentResponseDto, ConfirmPaymentResponseDto } from '../../domain/dto/payment-response.dto'
import { UtilsSharedService } from '../../../shared/application/services/utils-shared.service'
import { CustomersRepositoryDomain } from '../../../customers/domain/repository/customers.repository.domain'
import { WalletsRepositoryDomain } from '../../../customers/domain/repository/wallets.repository.domain'
import { OtpService } from './otp.service'
import { TransactionsService } from './transactions.service'

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name)
  private readonly OTP_EXPIRATION_MINUTES = 5

  constructor(
    private readonly _paymentSessionsRepository: PaymentSessionsRepositoryDomain,
    private readonly _customersRepository: CustomersRepositoryDomain,
    private readonly _walletsRepository: WalletsRepositoryDomain,
    private readonly _otpService: OtpService,
    private readonly _transactionsService: TransactionsService,
    private readonly _utilsSharedService: UtilsSharedService,
  ) {}

  async requestPayment(userId: string, amount: number): Promise<RequestPaymentResponseDto> {
    const [customer, errCustomer] = await this._customersRepository.findByUserId(userId)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errCustomer })

    if (!customer) {
      throw new NotFoundException('Customer not found')
    }

    const [wallet, errWallet] = await this._walletsRepository.findByCustomerId(customer._id)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errWallet })

    if (!wallet) {
      throw new NotFoundException('Wallet not found')
    }

    if (wallet.balance < amount) {
      throw new BadRequestException('Saldo insuficiente para realizar el pago')
    }

    const otp = this._otpService.generateOtp()
    const hashedOtp = this._otpService.hashOtp(otp)

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRATION_MINUTES)

    const sessionDomain = plainToInstance(PaymentSessionEntity, {
      _id: uuidv4(),
      customerId: customer._id,
      walletId: wallet._id,
      amount,
      otp: hashedOtp,
      status: PaymentStatus.Pending,
      expiresAt,
    })

    const [session, errSession] = await this._paymentSessionsRepository.base.create(sessionDomain)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errSession })

    // Log OTP for testing (in production, send via email)
    this.logger.log(`[PAYMENT] OTP for session ${session._id}: ${otp}`)

    return plainToInstance(RequestPaymentResponseDto, {
      sessionId: session._id,
      message: `Token de confirmación enviado. Válido por ${this.OTP_EXPIRATION_MINUTES} minutos. (OTP: ${otp})`,
    })
  }

  async confirmPayment(
    userId: string,
    sessionId: string,
    token: string,
  ): Promise<ConfirmPaymentResponseDto> {
    const [customer, errCustomer] = await this._customersRepository.findByUserId(userId)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errCustomer })

    if (!customer) {
      throw new NotFoundException('Customer not found')
    }

    const [session, errSession] = await this._paymentSessionsRepository.findByIdAndCustomerId(
      sessionId,
      customer._id,
    )
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errSession })

    if (!session) {
      throw new NotFoundException('Sesión de pago no encontrada')
    }

    if (session.status !== PaymentStatus.Pending) {
      throw new BadRequestException(`La sesión de pago ya fue ${session.status}`)
    }

    if (new Date() > new Date(session.expiresAt)) {
      await this._paymentSessionsRepository.updateStatus(sessionId, PaymentStatus.Expired)
      throw new BadRequestException('El token ha expirado. Solicite un nuevo pago.')
    }

    const isValidOtp = this._otpService.verifyOtp(token, session.otp)
    if (!isValidOtp) {
      throw new BadRequestException('Token inválido')
    }

    const [wallet, errWallet] = await this._walletsRepository.findByCustomerId(customer._id)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errWallet })

    if (!wallet) {
      throw new NotFoundException('Wallet not found')
    }

    if (wallet.balance < session.amount) {
      throw new BadRequestException('Saldo insuficiente para realizar el pago')
    }

    const previousBalance = wallet.balance
    const newBalance = previousBalance - session.amount

    const [updatedWallet, errUpdate] = await this._walletsRepository.updateBalance(wallet._id, newBalance)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errUpdate })

    await this._transactionsService.createTransaction({
      walletId: wallet._id,
      type: TransactionType.Payment,
      amount: session.amount,
      balanceBefore: previousBalance,
      balanceAfter: newBalance,
      referenceId: sessionId,
      description: 'Pago confirmado',
    })

    await this._paymentSessionsRepository.updateStatus(sessionId, PaymentStatus.Confirmed, new Date())

    return plainToInstance(ConfirmPaymentResponseDto, {
      message: 'Pago confirmado exitosamente',
      previousBalance,
      amountDeducted: session.amount,
      newBalance: updatedWallet.balance,
    })
  }
}
