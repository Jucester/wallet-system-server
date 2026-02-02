import { Request } from 'express'
import { Readable } from 'stream'
import { IAuthJWTTokenPayload } from '../../../auth/infrastructure/jwt/interfaces/auth-jwt-token-payload.interface'

export type IRequestCustom = Request & {
  user: IAuthJWTTokenPayload
}

export type IFileMulter = {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  stream: Readable
  destination: string
  filename: string
  path: string
  buffer: Buffer
}
