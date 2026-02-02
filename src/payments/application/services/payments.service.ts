import { Injectable, Logger } from '@nestjs/common'
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
  ) { }

  async requestPayment(userId: string, amount: number): Promise<RequestPaymentResponseDto> {
    const [customer, errCustomer] = await this._customersRepository.findByUserId(userId)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errCustomer })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result: customer })

    const [wallet, errWallet] = await this._walletsRepository.findByCustomerId(customer._id)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errWallet })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result: wallet })

    if (wallet.balance < amount) {
      this._utilsSharedService.checkErrValidationThrowErr({ message: 'Saldo insuficiente para realizar el pago' })
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

    this.logger.log(`[PAYMENT] OTP for session ${session._id}: ${otp}`)

    return plainToInstance(RequestPaymentResponseDto, {
      sessionId: session._id,
      message: `Token de confirmación enviado. Válido por ${this.OTP_EXPIRATION_MINUTES} minutos. (OTP: ${otp})`,
    })
  }

  async confirmPayment(userId: string, sessionId: string, token: string): Promise<ConfirmPaymentResponseDto> {
    const [customer, errCustomer] = await this._customersRepository.findByUserId(userId)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errCustomer })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result: customer })

    const [session, errSession] = await this._paymentSessionsRepository.findByIdAndCustomerId(sessionId, customer._id)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errSession })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result: session })

    if (session.status !== PaymentStatus.Pending) {
      this._utilsSharedService.checkErrValidationThrowErr({ message: `La sesión de pago ya fue ${session.status}` })
    }

    if (new Date() > new Date(session.expiresAt)) {
      await this._paymentSessionsRepository.updateStatus(sessionId, PaymentStatus.Expired)
      this._utilsSharedService.checkErrValidationThrowErr({ message: 'El token ha expirado. Solicite un nuevo pago.' })
    }

    const isValidOtp = this._otpService.verifyOtp(token, session.otp)
    if (!isValidOtp) {
      this._utilsSharedService.checkErrValidationThrowErr({ message: 'Token inválido' })
    }

    const [wallet, errWallet] = await this._walletsRepository.findByCustomerId(customer._id)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errWallet })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result: wallet })

    if (wallet.balance < session.amount) {
      this._utilsSharedService.checkErrValidationThrowErr({ message: 'Saldo insuficiente para realizar el pago' })
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
