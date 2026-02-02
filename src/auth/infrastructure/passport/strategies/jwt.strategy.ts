import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { IAuthJWTTokenPayload } from '../../jwt/interfaces/auth-jwt-token-payload.interface'
import { JwtSecurityService } from '../../../application/services/jwt-security.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly _configService: ConfigService,
    private readonly _jwtSecurityService: JwtSecurityService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: _configService.get('JWT_SECRET'),
    })
  }

  validate = async (payload: IAuthJWTTokenPayload) => await this._jwtSecurityService.validatePayload(payload)
}
