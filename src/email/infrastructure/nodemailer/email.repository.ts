import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createTransport, Transporter } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { resolve } from 'path'
import { readFileSync } from 'fs'

import handlebars from 'handlebars'

@Injectable()
export class EmailRepository {
  private readonly logger = new Logger('EmailRepository')
  private host: string
  private from: string
  private port: number
  private user: string
  private pass: string
  private debug: boolean
  private ssl: boolean

  constructor(private readonly configService: ConfigService) {
    this.from = this.configService.get<string>('MAIL_FROM')
    this.user = this.configService.get<string>('MAIL_USER')
    this.pass = this.configService.get<string>('MAIL_PASS')
    this.host = this.configService.get<string>('MAIL_HOST')
    this.port = this.configService.get<number>('MAIL_PORT')
    this.debug = this.configService.get<boolean>('MAIL_DEBUG')
    this.ssl = this.configService.get<boolean>('MAIL_SSL')
  }

  async sendMail(subject: string, to: string, templateData: any, template = 'default') {
    return new Promise((resolve, reject) => {
      this.transport().sendMail(
        {
          from: this.from,
          to: to,
          subject,
          html: this.generateEmailTemplate(template, templateData),
        },
        (error) => {
          if (error) {
            this.logger.error(error)
            reject(error)
          }
          this.logger.log(`Email successfully sent to ${to}`)
          resolve(true)
        },
      )
    })
  }

  generateEmailTemplate(template = 'default', values: any) {
    const templatePath = resolve(`src/email/infrastructure/html/${template}.email.template.html`)
    const htmlString = readFileSync(templatePath, 'utf8')
    const templateCompiled = handlebars.compile(htmlString)
    return templateCompiled(values)
  }

  async verify() {
    return await this.transport().verify()
  }

  transport(): Transporter<SMTPTransport.SentMessageInfo> {
    return createTransport({
      host: this.host,
      port: this.port,
      secure: false,
      logger: this.debug,
      debug: this.debug,
      auth: {
        user: this.user,
        pass: this.pass,
      },
      tls: { rejectUnauthorized: false },
    } as SMTPTransport.Options)
  }
}
