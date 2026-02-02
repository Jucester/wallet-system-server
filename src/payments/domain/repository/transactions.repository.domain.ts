import { IReturnDomain } from '../../../shared/domain/entities/return-domain'
import { IGenericRepository, PaginateResultDomain } from '../../../shared/domain/repository/generic.repository.domain'
import { TransactionEntity } from '../entities/transaction.domain'
import { QueryPaginationDto } from '../../../shared/domain/dto/query-pagination.dto'

export abstract class TransactionsRepositoryDomain {
  abstract base: IGenericRepository<[TransactionEntity]>

  abstract findByWalletId(
    walletId: string,
    queryPagination?: QueryPaginationDto,
  ): Promise<IReturnDomain<PaginateResultDomain<TransactionEntity>, Error>>
}
