import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { v4 as uuidv4 } from 'uuid'

import { TransactionEntity } from '../../domain/entities/transaction.domain'
import { TransactionType } from '../../domain/entities/transaction-type.enum'
import { TransactionsRepositoryDomain } from '../../domain/repository/transactions.repository.domain'
import { CustomersRepositoryDomain } from '../../../customers/domain/repository/customers.repository.domain'
import { WalletsRepositoryDomain } from '../../../customers/domain/repository/wallets.repository.domain'
import { UtilsSharedService } from '../../../shared/application/services/utils-shared.service'
import { QueryPaginationDto } from '../../../shared/domain/dto/query-pagination.dto'
import { PaginateResultDomain } from '../../../shared/domain/repository/generic.repository.domain'

@Injectable()
export class TransactionsService {
  constructor(
    private readonly _transactionsRepository: TransactionsRepositoryDomain,
    private readonly _customersRepository: CustomersRepositoryDomain,
    private readonly _walletsRepository: WalletsRepositoryDomain,
    private readonly _utilsSharedService: UtilsSharedService,
  ) { }

  async createTransaction(arg: {
    walletId: string
    type: TransactionType
    amount: number
    balanceBefore: number
    balanceAfter: number
    referenceId?: string
    description?: string
  }): Promise<TransactionEntity> {
    const transactionDomain = plainToInstance(TransactionEntity, {
      _id: uuidv4(),
      walletId: arg.walletId,
      type: arg.type,
      amount: arg.amount,
      balanceBefore: arg.balanceBefore,
      balanceAfter: arg.balanceAfter,
      referenceId: arg.referenceId,
      description: arg.description,
    })

    const [transaction, err] = await this._transactionsRepository.base.create(transactionDomain)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err })

    return transaction
  }

  async getTransactionsByWalletId(
    walletId: string,
    queryPagination?: QueryPaginationDto,
  ): Promise<PaginateResultDomain<TransactionEntity>> {
    const [result, err] = await this._transactionsRepository.findByWalletId(walletId, queryPagination)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    return result
  }

  async getTransactionHistoryByUserId(
    userId: string,
    queryPagination?: QueryPaginationDto,
  ): Promise<PaginateResultDomain<TransactionEntity>> {
    const [customer, errCustomer] = await this._customersRepository.findByUserId(userId)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errCustomer })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result: customer })

    const [wallet, errWallet] = await this._walletsRepository.findByCustomerId(customer._id)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errWallet })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result: wallet })

    return this.getTransactionsByWalletId(wallet._id, queryPagination)
  }
}
