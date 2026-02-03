import { Injectable, Logger } from '@nestjs/common'
import { EmailRepository } from '../../infrastructure/nodemailer/email.repository'

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService')

  constructor(private readonly _emailRepository: EmailRepository) {}

  async sendMail(subject: string, to: string, templateData: any, template = 'default') {
    return this._emailRepository.sendMail(subject, to, templateData, template)
  }
}
