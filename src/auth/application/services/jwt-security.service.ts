import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersRepositoryDomain } from '../../../users/domain/repository/users.repository.domain'
import { IAuthJWTTokenPayload } from '../../infrastructure/jwt/interfaces/auth-jwt-token-payload.interface'

@Injectable()
export class JwtSecurityService {
  private _logger = new Logger('JwtSecurityService')
  constructor(
    private readonly _jwtService: JwtService,
    private readonly _usersRepository: UsersRepositoryDomain,
  ) {}

  generateToken(data: Record<string, any>, expiresIn: string) {
    return this._jwtService.sign(data, {
      expiresIn,
    })
  }

  verifyToken(token: string): [Record<string, any>, null] | [null, Error] {
    try {
      return [this._jwtService.verify(token), null]
    } catch (e) {
      this._logger.error(e)
      return [null, e]
    }
  }

  async validatePayload(payload: IAuthJWTTokenPayload) {
    const [user, err] = await this._usersRepository.base.findById(payload._id)

    if (err) {
      this._logger.error(err)
    }

    if (!user || user?.isBlocked) {
      throw new UnauthorizedException()
    }

    // return payload
    return user
  }
}
