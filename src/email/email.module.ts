import { Module } from '@nestjs/common'
import { EmailService } from './application/services/email.service'
import { ConfigService } from '@nestjs/config'
import { EmailRepository } from './infrastructure/nodemailer/email.repository'

@Module({
  providers: [EmailService, ConfigService, EmailRepository],
  exports: [EmailService],
})
export class EmailModule {}
