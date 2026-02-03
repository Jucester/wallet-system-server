import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { TransactionSchemaBaseMongoose } from '../schemas/transaction.schema.mongoose'
import { TransactionEntity } from '../../../domain/entities/transaction.domain'
import { TransactionsRepositoryDomain } from '../../../domain/repository/transactions.repository.domain'
import { GenericRepositoryMongoose } from '../../../../shared/infrastructure/mongoose/repositories/generic.repository.mongoose'
import { IReturnDomain } from '../../../../shared/domain/entities/return-domain'
import {
  PaginateResultDomain,
  OptionsRepositoryDomain,
} from '../../../../shared/domain/repository/generic.repository.domain'
import { QueryPaginationDto } from '../../../../shared/domain/dto/query-pagination.dto'

@Injectable()
export class TransactionsRepositoryMongoose implements TransactionsRepositoryDomain {
  private readonly logger = new Logger(TransactionsRepositoryMongoose.name)
  base: GenericRepositoryMongoose<[TransactionEntity, Model<TransactionSchemaBaseMongoose>]>

  constructor(
    @InjectModel('Transaction') private readonly _model: Model<TransactionSchemaBaseMongoose>,
  ) {
    this.base = new GenericRepositoryMongoose<[TransactionEntity, Model<TransactionSchemaBaseMongoose>]>(
      _model as any,
      TransactionEntity,
    )
  }

  async findByWalletId(
    walletId: string,
    queryPagination?: QueryPaginationDto,
  ): Promise<IReturnDomain<PaginateResultDomain<TransactionEntity>, Error>> {
    return this.base.findPaginate({
      query: { walletId },
      options: new OptionsRepositoryDomain({
        ...queryPagination,
        sort: { createdAt: -1 },
      }),
    })
  }
}
