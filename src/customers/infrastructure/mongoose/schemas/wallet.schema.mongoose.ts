import { Document, Schema as MongooseSchema } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IWalletEntity } from '../../../domain/entities/wallet.domain'

@Schema({
  versionKey: false,
  timestamps: true,
  collection: 'wallets',
})
export class WalletSchemaBaseMongoose extends Document<string> implements IWalletEntity {
  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
  })
  _id: string

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'Customer',
    unique: true,
  })
  customerId: string

  @Prop({
    required: true,
    default: 0,
    min: 0,
  })
  balance: number
}

export const WalletSchemaMongoose = SchemaFactory.createForClass(WalletSchemaBaseMongoose)
