import { Document, Schema as MongooseSchema } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ITransactionEntity } from '../../../domain/entities/transaction.domain'
import { TransactionType } from '../../../domain/entities/transaction-type.enum'

@Schema({
  versionKey: false,
  timestamps: true,
  collection: 'transactions',
})
export class TransactionSchemaBaseMongoose extends Document<string> implements ITransactionEntity {
  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
  })
  _id: string

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'Wallet',
    index: true,
  })
  walletId: string

  @Prop({
    required: true,
    enum: TransactionType,
    index: true,
  })
  type: TransactionType

  @Prop({
    required: true,
    min: 0,
  })
  amount: number

  @Prop({
    required: true,
  })
  balanceBefore: number

  @Prop({
    required: true,
  })
  balanceAfter: number

  @Prop({
    type: MongooseSchema.Types.UUID,
  })
  referenceId?: string

  @Prop()
  description?: string
}

export const TransactionSchemaMongoose = SchemaFactory.createForClass(TransactionSchemaBaseMongoose)
