import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { compare } from 'bcryptjs'
import { UpdateMyInformationDto } from '../../domain/dto/update-my-information.dto'
import { RegisterDto } from '../../domain/dto/register.dto'
import { LoginDto } from '../../domain/dto/login.dto'
import { JwtSecurityService } from './jwt-security.service'
import { ForgotPasswordDto } from '../../domain/dto/forgot-password.dto'
import { RestorePasswordDto } from '../../domain/dto/restore-password.dto'
import { UsersRepositoryDomain } from '../../../users/domain/repository/users.repository.domain'
import { UserEntity } from '../../../users/domain/entities/user.domain'
import { plainToInstance } from 'class-transformer'
import { UserWithTokenResDto } from '../../domain/dto/user-with-token.dto'
import { UserResDto } from '../../../users/domain/dto/user.dto'
import { UtilsSharedService } from '../../../shared/application/services/utils-shared.service'
import { MessagesEntity } from '../../../shared/domain/entities/message-shared.entity'

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService')
  constructor(
    private readonly _configService: ConfigService,
    private readonly _jwtSecurityService: JwtSecurityService,

    private readonly _usersRepository: UsersRepositoryDomain,
    private readonly _utilsSharedService: UtilsSharedService,
  ) {}

  async register(body: RegisterDto) {
    const [userIdFound, errFoundUser] = await this._usersRepository.base.findById(body._id)

    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errFoundUser })
    this._utilsSharedService.checkErrIdAlReadyFoundThrowErr({ result: userIdFound })

    const [userEmailFound] = await this._usersRepository.base.findOne({ email: body.email })

    this._utilsSharedService.checkErrFieldAlReadyFoundThrowErr({ result: userEmailFound, field: 'email' })

    const userDomain = plainToInstance(UserEntity, body)

    const [user, err] = await this._usersRepository.base.create(userDomain)

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })

    const expiresIn = this._configService.get('JWT_EXPIRES_IN')
    const token = this._jwtSecurityService.generateToken({ ...user }, expiresIn)

    return plainToInstance(UserWithTokenResDto, { user: user, token })
  }

  async login(login: LoginDto) {
    const [user, error] = await this._usersRepository.base.findOne({
      email: login.email,
    })

    this._utilsSharedService.checkErrDatabaseThrowErr({ err: error })

    const match = user ? await compare(login.password, user.password) : null

    if (!match) {
      throw new UnauthorizedException(MessagesEntity.BAD_CREDENTIALS)
    }

    const expiresIn = this._configService.get('JWT_EXPIRES_IN')
    const token = this._jwtSecurityService.generateToken({ _id: user._id }, expiresIn)

    return plainToInstance(UserWithTokenResDto, { user: user, token })
  }

  async updateByMe(id: string, body: UpdateMyInformationDto) {
    const userDomain = plainToInstance(UserEntity, body)

    const [user, error] = await this._usersRepository.base.updateById(id, userDomain)

    this._utilsSharedService.checkErrDatabaseThrowErr({ err: error })

    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result: user })

    const userResDto = plainToInstance(UserResDto, user)
    return userResDto
  }

  async findByMe(id: string) {
    const [user, error] = await this._usersRepository.base.findById(id)

    this._utilsSharedService.checkErrDatabaseThrowErr({ err: error })

    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result: user })

    const userResDto = plainToInstance(UserResDto, user)
    return userResDto
  }

  async forgotPassword(forgotPassword: ForgotPasswordDto): Promise<{ message?: string }> {
    const [user, error] = await this._usersRepository.base.findOne({
      email: forgotPassword.email,
    })

    this._utilsSharedService.checkErrDatabaseThrowErr({ err: error })

    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result: user })

    const token = this._jwtSecurityService.generateToken({ _id: user._id, from: 'forgotPassword' }, '15m')
    const urlWithToken = `${this._configService.get('URL_APP')}/update-password/${token}`
    this.logger.debug(`reset password url: ${urlWithToken}`)


    return {
      message: 'Password reset email sent',
    }
  }

  async restorePassword(token: string, updatePassword: RestorePasswordDto) {
    const [tokenDecode, err] = this._jwtSecurityService.verifyToken(token)

    if (err) {
      throw new HttpException({ message: 'Wrong token, request it again.' }, HttpStatus.BAD_REQUEST)
    }

    if (tokenDecode.from !== 'forgotPassword') {
      throw new HttpException({ message: 'Wrong or expired token, request it again.' }, HttpStatus.BAD_REQUEST)
    }
    const userDomain = new UserEntity({ password: updatePassword.password })
    const [, error] = await this._usersRepository.base.updateById(tokenDecode._id, userDomain)

    if (error) {
      throw new InternalServerErrorException('err database')
    }

    return { message: 'Updated successfully' }
  }
}
