import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { WalletSchemaBaseMongoose } from '../schemas/wallet.schema.mongoose'
import { WalletEntity } from '../../../domain/entities/wallet.domain'
import { WalletsRepositoryDomain } from '../../../domain/repository/wallets.repository.domain'
import { GenericRepositoryMongoose } from '../../../../shared/infrastructure/mongoose/repositories/generic.repository.mongoose'
import { IReturnDomain } from '../../../../shared/domain/entities/return-domain'

@Injectable()
export class WalletsRepositoryMongoose implements WalletsRepositoryDomain {
  private readonly logger = new Logger(WalletsRepositoryMongoose.name)
  base: GenericRepositoryMongoose<[WalletEntity, Model<WalletSchemaBaseMongoose>]>

  constructor(@InjectModel('Wallet') private readonly _model: Model<WalletSchemaBaseMongoose>) {
    this.base = new GenericRepositoryMongoose<[WalletEntity, Model<WalletSchemaBaseMongoose>]>(
      _model as any,
      WalletEntity,
    )
  }

  async findByCustomerId(customerId: string): Promise<IReturnDomain<WalletEntity, Error>> {
    return this.base.findOne({ customerId })
  }

  async updateBalance(walletId: string, newBalance: number): Promise<IReturnDomain<WalletEntity, Error>> {
    try {
      const result = await this._model.findByIdAndUpdate(
        walletId,
        { $set: { balance: newBalance } },
        { new: true },
      )
      if (!result) {
        return [null, null]
      }
      return [this.base.mapperModelToDomain(result), null]
    } catch (error) {
      this.logger.error(error)
      return [null, error]
    }
  }

  async incrementBalance(walletId: string, amount: number): Promise<IReturnDomain<WalletEntity, Error>> {
    try {
      const result = await this._model.findByIdAndUpdate(
        walletId,
        { $inc: { balance: amount } },
        { new: true },
      )
      if (!result) {
        return [null, null]
      }
      return [this.base.mapperModelToDomain(result), null]
    } catch (error) {
      this.logger.error(error)
      return [null, error]
    }
  }

  async decrementBalance(walletId: string, amount: number): Promise<IReturnDomain<WalletEntity, Error>> {
    try {
      const result = await this._model.findByIdAndUpdate(
        walletId,
        { $inc: { balance: -amount } },
        { new: true },
      )
      if (!result) {
        return [null, null]
      }
      return [this.base.mapperModelToDomain(result), null]
    } catch (error) {
      this.logger.error(error)
      return [null, error]
    }
  }
}
