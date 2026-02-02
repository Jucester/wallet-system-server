import { IReturnDomain } from '../../../shared/domain/entities/return-domain'
import { IGenericRepository } from '../../../shared/domain/repository/generic.repository.domain'
import { WalletEntity } from '../entities/wallet.domain'

export abstract class WalletsRepositoryDomain {
  abstract base: IGenericRepository<[WalletEntity]>

  abstract findByCustomerId(customerId: string): Promise<IReturnDomain<WalletEntity, Error>>

  abstract updateBalance(
    walletId: string,
    newBalance: number,
  ): Promise<IReturnDomain<WalletEntity, Error>>

  abstract incrementBalance(
    walletId: string,
    amount: number,
  ): Promise<IReturnDomain<WalletEntity, Error>>

  abstract decrementBalance(
    walletId: string,
    amount: number,
  ): Promise<IReturnDomain<WalletEntity, Error>>
}
