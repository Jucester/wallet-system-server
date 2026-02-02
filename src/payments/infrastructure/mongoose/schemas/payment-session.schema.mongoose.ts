import { Document, Schema as MongooseSchema } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IPaymentSessionEntity } from '../../../domain/entities/payment-session.domain'
import { PaymentStatus } from '../../../domain/entities/payment-status.enum'
import { PaymentType } from '../../../domain/entities/payment-type.enum'

@Schema({
  versionKey: false,
  timestamps: true,
  collection: 'payment_sessions',
})
export class PaymentSessionSchemaBaseMongoose extends Document<string> implements IPaymentSessionEntity {
  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
  })
  _id: string

  @Prop({
    required: true,
    enum: PaymentType,
    index: true,
  })
  type: PaymentType

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'Customer',
    index: true,
  })
  customerId: string

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'Wallet',
  })
  walletId: string

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'Customer',
    index: true,
  })
  destinationCustomerId: string

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'Wallet',
  })
  destinationWalletId: string

  @Prop({
    required: true,
    min: 0,
  })
  amount: number

  @Prop({
    required: true,
  })
  otp: string

  @Prop({
    required: true,
    enum: PaymentStatus,
    default: PaymentStatus.Pending,
    index: true,
  })
  status: PaymentStatus

  @Prop({
    required: true,
    index: true,
  })
  expiresAt: Date

  @Prop()
  confirmedAt?: Date
}

export const PaymentSessionSchemaMongoose = SchemaFactory.createForClass(PaymentSessionSchemaBaseMongoose)

// Index for finding expired sessions
PaymentSessionSchemaMongoose.index({ status: 1, expiresAt: 1 })
