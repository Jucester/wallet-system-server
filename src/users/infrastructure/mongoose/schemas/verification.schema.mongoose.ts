import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({
  _id: false,
  versionKey: false,
})
export class Verification {
  @Prop({
    default: false,
  })
  email: boolean
}

export const VerificationSchema = SchemaFactory.createForClass(Verification)
