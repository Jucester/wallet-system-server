import { Document, Schema as MongooseSchema } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ICustomerEntity } from '../../../domain/entities/customer.domain'

@Schema({
  versionKey: false,
  timestamps: true,
  collection: 'customers',
})
export class CustomerSchemaBaseMongoose extends Document<string> implements ICustomerEntity {
  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
  })
  _id: string

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'User',
    unique: true,
  })
  userId: string

  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  document: string

  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  phone: string

  @Prop({
    required: false,
    default: true,
  })
  isActive: boolean

  @Prop({
    required: false,
    trim: true,
  })
  avatar?: string
}

export const CustomerSchemaMongoose = SchemaFactory.createForClass(CustomerSchemaBaseMongoose)
