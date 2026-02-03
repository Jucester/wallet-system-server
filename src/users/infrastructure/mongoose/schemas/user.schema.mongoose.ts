import { Document, Schema as MongooseSchema } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { genSaltSync, hashSync } from 'bcryptjs'
import { UserRoles } from '../../../domain/entities/user-roles.interface'
import { VerificationSchema, Verification } from './verification.schema.mongoose'
import { capitalize } from '../../../../shared/application/helpers/string/capitalize'
import { IUserEntity } from '../../../domain/entities/user.domain'

@Schema({
  versionKey: false,
  timestamps: true,
  collection: 'users',
})
export class UserSchemaBaseMongoose extends Document<string> implements IUserEntity {
  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
  })
  _id: string

  @Prop({
    required: true,
    trim: true,
    set: capitalize,
  })
  firstName: string

  @Prop({
    trim: true,
    set: capitalize,
  })
  lastName: string

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
  })
  email: string

  @Prop({
    required: false,
    default: false,
  })
  isBlocked: boolean

  @Prop({
    required: true,
    set(plainText: string) {
      const salt = genSaltSync()
      return hashSync(plainText, salt)
    },
  })
  password: string

  @Prop({
    required: true,
    default: UserRoles.User,
    enum: UserRoles,
  })
  role: string

  @Prop({
    type: VerificationSchema,
    default: {
      email: false,
    },
  })
  verification: Verification
}

export const UserSchemaMongoose = SchemaFactory.createForClass(UserSchemaBaseMongoose)

UserSchemaMongoose.virtual('fullName')
  .set(function (fullName: string) {
    const [firstName, lastName] = fullName.split(' ')
    this.set({ firstName, lastName })
  })
  .get(function () {
    return this.lastName ? this.firstName.concat(' ', this.lastName) : this.firstName
  })
