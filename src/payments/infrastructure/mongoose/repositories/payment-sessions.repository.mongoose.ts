import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { PaymentSessionSchemaBaseMongoose } from '../schemas/payment-session.schema.mongoose'
import { PaymentSessionEntity } from '../../../domain/entities/payment-session.domain'
import { PaymentSessionsRepositoryDomain } from '../../../domain/repository/payment-sessions.repository.domain'
import { GenericRepositoryMongoose } from '../../../../shared/infrastructure/mongoose/repositories/generic.repository.mongoose'
import { IReturnDomain } from '../../../../shared/domain/entities/return-domain'
import { PaymentStatus } from '../../../domain/entities/payment-status.enum'

@Injectable()
export class PaymentSessionsRepositoryMongoose implements PaymentSessionsRepositoryDomain {
  private readonly logger = new Logger(PaymentSessionsRepositoryMongoose.name)
  base: GenericRepositoryMongoose<[PaymentSessionEntity, Model<PaymentSessionSchemaBaseMongoose>]>

  constructor(
    @InjectModel('PaymentSession') private readonly _model: Model<PaymentSessionSchemaBaseMongoose>,
  ) {
    this.base = new GenericRepositoryMongoose<[PaymentSessionEntity, Model<PaymentSessionSchemaBaseMongoose>]>(
      _model as any,
      PaymentSessionEntity,
    )
  }

  async findByIdAndCustomerId(
    sessionId: string,
    customerId: string,
  ): Promise<IReturnDomain<PaymentSessionEntity, Error>> {
    try {
      const result = await this._model.findOne({ _id: sessionId, customerId })
      if (!result) {
        return [null, null]
      }
      return [this.base.mapperModelToDomain(result), null]
    } catch (error) {
      this.logger.error(error)
      return [null, null]
    }
  }

  async findPendingByCustomerId(customerId: string): Promise<IReturnDomain<PaymentSessionEntity[], Error>> {
    try {
      const result = await this._model.find({
        customerId,
        status: PaymentStatus.Pending,
        expiresAt: { $gt: new Date() },
      })
      const entities = result.map((doc) => this.base.mapperModelToDomain(doc))
      return [entities, null]
    } catch (error) {
      this.logger.error(error)
      return [null, error as Error]
    }
  }

  async updateStatus(
    sessionId: string,
    status: PaymentStatus,
    confirmedAt?: Date,
  ): Promise<IReturnDomain<PaymentSessionEntity, Error>> {
    try {
      const updateData: any = { status }
      if (confirmedAt) {
        updateData.confirmedAt = confirmedAt
      }

      const result = await this._model.findByIdAndUpdate(sessionId, { $set: updateData }, { new: true })

      if (!result) {
        return [null, null]
      }
      return [this.base.mapperModelToDomain(result), null]
    } catch (error) {
      this.logger.error(error)
      return [null, error as Error]
    }
  }

  async expireSessions(): Promise<IReturnDomain<number, Error>> {
    try {
      const result = await this._model.updateMany(
        {
          status: PaymentStatus.Pending,
          expiresAt: { $lte: new Date() },
        },
        { $set: { status: PaymentStatus.Expired } },
      )
      return [result.modifiedCount, null]
    } catch (error) {
      this.logger.error(error)
      return [null, error as Error]
    }
  }
}
