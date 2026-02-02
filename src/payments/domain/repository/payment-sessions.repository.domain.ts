import { IReturnDomain } from '../../../shared/domain/entities/return-domain'
import { IGenericRepository } from '../../../shared/domain/repository/generic.repository.domain'
import { PaymentSessionEntity } from '../entities/payment-session.domain'
import { PaymentStatus } from '../entities/payment-status.enum'

export abstract class PaymentSessionsRepositoryDomain {
  abstract base: IGenericRepository<[PaymentSessionEntity]>

  abstract findByIdAndCustomerId(
    sessionId: string,
    customerId: string,
  ): Promise<IReturnDomain<PaymentSessionEntity, Error>>

  abstract findPendingByCustomerId(
    customerId: string,
  ): Promise<IReturnDomain<PaymentSessionEntity[], Error>>

  abstract updateStatus(
    sessionId: string,
    status: PaymentStatus,
    confirmedAt?: Date,
  ): Promise<IReturnDomain<PaymentSessionEntity, Error>>

  abstract expireSessions(): Promise<IReturnDomain<number, Error>>
}
