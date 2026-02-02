import { Injectable, NestMiddleware, Logger } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP')

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, baseUrl } = req
    const userAgent = req.get('user-agent') || ''

    res.on('close', () => {
      const { statusCode } = res
      const contentLength = res.get('content-length')
      const timestamp = new Date().toISOString()

      const message = `${timestamp}, method: ${method}, baseUrl: ${baseUrl}, statusCode: ${statusCode}, contentLength: ${contentLength}, userAgent: ${userAgent}, ip: ${ip}`

      if (statusCode >= 500) {
        this.logger.error(message)
      } else if (statusCode >= 400) {
        this.logger.warn(message)
      } else {
        this.logger.log(message)
      }
    })

    next()
  }
}
