import { Injectable } from '@nestjs/common'
import { hashSync, compareSync, genSaltSync } from 'bcryptjs'

@Injectable()
export class OtpService {
  generateOtp(): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    return otp
  }

  hashOtp(otp: string): string {
    const salt = genSaltSync(10)
    return hashSync(otp, salt)
  }

  verifyOtp(plainOtp: string, hashedOtp: string): boolean {
    return compareSync(plainOtp, hashedOtp)
  }
}
