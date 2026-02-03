import { Injectable, Logger } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { v4 as uuidv4 } from 'uuid'

import { PaymentSessionEntity } from '../../domain/entities/payment-session.domain'
import { PaymentStatus } from '../../domain/entities/payment-status.enum'
import { PaymentType } from '../../domain/entities/payment-type.enum'
import { TransactionType } from '../../domain/entities/transaction-type.enum'
import { PaymentSessionsRepositoryDomain } from '../../domain/repository/payment-sessions.repository.domain'
import {
  RequestPaymentResponseDto,
  ConfirmPaymentResponseDto,
  SendPaymentResponseDto,
} from '../../domain/dto/payment-response.dto'
import { UtilsSharedService } from '../../../shared/application/services/utils-shared.service'
import { CustomersRepositoryDomain } from '../../../customers/domain/repository/customers.repository.domain'
import { WalletsRepositoryDomain } from '../../../customers/domain/repository/wallets.repository.domain'
import { UsersRepositoryDomain } from '../../../users/domain/repository/users.repository.domain'
import { EmailService } from '../../../email/application/services/email.service'
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
    private readonly _usersRepository: UsersRepositoryDomain,
    private readonly _emailService: EmailService,
    private readonly _otpService: OtpService,
    private readonly _transactionsService: TransactionsService,
    private readonly _utilsSharedService: UtilsSharedService,
  ) { }

  /**
   * Request Payment (Merchant Flow)
   * Payer initiates a payment to a merchant, receives an OTP to confirm.
   * Money flows: Payer -> Merchant
   */
  async requestPayment(payerUserId: string, merchantId: string, amount: number): Promise<RequestPaymentResponseDto> {
    const [payer, errPayer] = await this._customersRepository.findByUserId(payerUserId)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errPayer })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({
      result: payer,
      message: 'Pagador no encontrado',
    })

    const [payerWallet, errPayerWallet] = await this._walletsRepository.findByCustomerId(payer._id)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errPayerWallet })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({
      result: payerWallet,
      message: 'Billetera del pagador no encontrada',
    })

    const [merchant, errMerchant] = await this._customersRepository.base.findById(merchantId)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errMerchant })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({
      result: merchant,
      message: 'Comercio no encontrado',
    })

    if (payer._id === merchant._id) {
      this._utilsSharedService.checkErrValidationThrowErr({
        message: 'No puedes realizar un pago a ti mismo',
      })
    }

    const [merchantWallet, errMerchantWallet] = await this._walletsRepository.findByCustomerId(merchant._id)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errMerchantWallet })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({
      result: merchantWallet,
      message: 'Billetera del comercio no encontrada',
    })

    if (payerWallet.balance < amount) {
      this._utilsSharedService.checkErrValidationThrowErr({
        message: 'Saldo insuficiente para realizar el pago',
      })
    }

    const otp = this._otpService.generateOtp()
    const hashedOtp = this._otpService.hashOtp(otp)

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRATION_MINUTES)

    const sessionDomain = plainToInstance(PaymentSessionEntity, {
      _id: uuidv4(),
      type: PaymentType.Merchant,
      customerId: payer._id,
      walletId: payerWallet._id,
      destinationCustomerId: merchant._id,
      destinationWalletId: merchantWallet._id,
      amount,
      otp: hashedOtp,
      status: PaymentStatus.Pending,
      expiresAt,
    })

    const [session, errSession] = await this._paymentSessionsRepository.base.create(sessionDomain)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errSession })

    this.logger.log(`[MERCHANT PAYMENT] OTP for session ${session._id}: ${otp}`)

    // Send OTP via email
    await this._sendOtpEmail({
      userId: payer.userId,
      otp,
      amount,
      transactionType: 'Pago a comercio',
    })

    return plainToInstance(RequestPaymentResponseDto, {
      sessionId: session._id,
      message: `Token de confirmación enviado a tu email. Válido por ${this.OTP_EXPIRATION_MINUTES} minutos.`,
    })
  }

  /**
   * Send Payment (P2P Flow)
   * A customer sends money directly to another customer.
   * Money flows: Sender -> Recipient
   */
  async sendPayment(
    senderUserId: string,
    recipientDocument: string,
    recipientPhone: string,
    amount: number,
  ): Promise<SendPaymentResponseDto> {
    // Find sender (source)
    const [sender, errSender] = await this._customersRepository.findByUserId(senderUserId)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errSender })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({
      result: sender,
      message: 'Remitente no encontrado',
    })

    const [senderWallet, errSenderWallet] = await this._walletsRepository.findByCustomerId(sender._id)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errSenderWallet })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({
      result: senderWallet,
      message: 'Billetera del remitente no encontrada',
    })

    // Find recipient (destination)
    const [recipient, errRecipient] = await this._customersRepository.findByDocumentAndPhone(
      recipientDocument,
      recipientPhone,
    )
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errRecipient })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({
      result: recipient,
      message: 'Destinatario no encontrado',
    })

    // Cannot send to yourself
    if (sender._id === recipient._id) {
      this._utilsSharedService.checkErrValidationThrowErr({
        message: 'No puedes enviarte dinero a ti mismo',
      })
    }

    const [recipientWallet, errRecipientWallet] = await this._walletsRepository.findByCustomerId(recipient._id)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errRecipientWallet })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({
      result: recipientWallet,
      message: 'Billetera del destinatario no encontrada',
    })

    // Check sender has sufficient balance
    if (senderWallet.balance < amount) {
      this._utilsSharedService.checkErrValidationThrowErr({
        message: 'Saldo insuficiente para realizar la transferencia',
      })
    }

    const otp = this._otpService.generateOtp()
    const hashedOtp = this._otpService.hashOtp(otp)

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRATION_MINUTES)

    const sessionDomain = plainToInstance(PaymentSessionEntity, {
      _id: uuidv4(),
      type: PaymentType.P2P,
      customerId: sender._id,
      walletId: senderWallet._id,
      destinationCustomerId: recipient._id,
      destinationWalletId: recipientWallet._id,
      amount,
      otp: hashedOtp,
      status: PaymentStatus.Pending,
      expiresAt,
    })

    const [session, errSession] = await this._paymentSessionsRepository.base.create(sessionDomain)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errSession })

    this.logger.log(`[P2P TRANSFER] OTP for session ${session._id}: ${otp}`)

    // Send OTP via email
    await this._sendOtpEmail({
      userId: sender.userId,
      otp,
      amount,
      transactionType: 'Transferencia P2P',
    })

    return plainToInstance(SendPaymentResponseDto, {
      sessionId: session._id,
      message: `Token de confirmación enviado a tu email. Válido por ${this.OTP_EXPIRATION_MINUTES} minutos.`,
    })
  }

  /**
   * Confirm Payment
   * Works for both Merchant and P2P flows.
   * Validates OTP and transfers money from source wallet to destination wallet.
   */
  async confirmPayment(userId: string, sessionId: string, token: string): Promise<ConfirmPaymentResponseDto> {
    const [customer, errCustomer] = await this._customersRepository.findByUserId(userId)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errCustomer })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result: customer })

    // Session must belong to the confirming customer (the payer)
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

    // Get source wallet (payer)
    const [sourceWallet, errSourceWallet] = await this._walletsRepository.findByCustomerId(customer._id)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errSourceWallet })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result: sourceWallet })

    if (sourceWallet.balance < session.amount) {
      this._utilsSharedService.checkErrValidationThrowErr({ message: 'Saldo insuficiente para realizar el pago' })
    }

    // Get destination wallet (merchant or recipient)
    const [destWallet, errDestWallet] = await this._walletsRepository.base.findById(session.destinationWalletId)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errDestWallet })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({
      result: destWallet,
      message: 'Billetera destino no encontrada',
    })

    // Deduct from source
    const sourcePreviousBalance = sourceWallet.balance
    const sourceNewBalance = sourcePreviousBalance - session.amount

    const [updatedSourceWallet, errUpdateSource] = await this._walletsRepository.updateBalance(
      sourceWallet._id,
      sourceNewBalance,
    )
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errUpdateSource })

    // Credit to destination
    const destPreviousBalance = destWallet.balance
    const destNewBalance = destPreviousBalance + session.amount

    const [, errUpdateDest] = await this._walletsRepository.updateBalance(destWallet._id, destNewBalance)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errUpdateDest })

    // Create transaction for source (debit)
    const transactionDescription = session.type === PaymentType.Merchant ? 'Pago a comercio' : 'Transferencia enviada'
    await this._transactionsService.createTransaction({
      walletId: sourceWallet._id,
      type: TransactionType.Payment,
      amount: session.amount,
      balanceBefore: sourcePreviousBalance,
      balanceAfter: sourceNewBalance,
      referenceId: sessionId,
      description: transactionDescription,
    })

    // Create transaction for destination (credit)
    const destTransactionDescription =
      session.type === PaymentType.Merchant ? 'Pago recibido' : 'Transferencia recibida'
    await this._transactionsService.createTransaction({
      walletId: destWallet._id,
      type: TransactionType.Recharge,
      amount: session.amount,
      balanceBefore: destPreviousBalance,
      balanceAfter: destNewBalance,
      referenceId: sessionId,
      description: destTransactionDescription,
    })

    await this._paymentSessionsRepository.updateStatus(sessionId, PaymentStatus.Confirmed, new Date())

    const confirmMessage =
      session.type === PaymentType.Merchant ? 'Pago confirmado exitosamente' : 'Transferencia confirmada exitosamente'

    return plainToInstance(ConfirmPaymentResponseDto, {
      message: confirmMessage,
      type: session.type,
      previousBalance: sourcePreviousBalance,
      amountDeducted: session.amount,
      newBalance: updatedSourceWallet.balance,
    })
  }

  /**
   * Send OTP email to user
   */
  private async _sendOtpEmail(params: {
    userId: string
    otp: string
    amount: number
    transactionType: string
  }): Promise<void> {
    const { userId, otp, amount, transactionType } = params

    try {
      const [user, errUser] = await this._usersRepository.base.findById(userId)
      if (errUser || !user) {
        this.logger.warn(`Could not find user ${userId} to send OTP email`)
        return
      }

      const fullName = user.firstName + (user.lastName ? ` ${user.lastName}` : '')

      await this._emailService.sendMail(
        `Código de confirmación - ${transactionType}`,
        user.email,
        {
          fullName,
          message: `Has solicitado realizar una transacción. Usa el siguiente código para confirmar.`,
          otpCode: otp,
          amount: amount.toLocaleString('es-CO'),
          transactionType,
          expirationMinutes: this.OTP_EXPIRATION_MINUTES,
        },
        'otp',
      )

      this.logger.log(`OTP email sent to ${user.email}`)
    } catch (error) {
      this.logger.error(`Failed to send OTP email: ${error.message}`)
      // Don't throw - email failure shouldn't block the payment flow
    }
  }
}
