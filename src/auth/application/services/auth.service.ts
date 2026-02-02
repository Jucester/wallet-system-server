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

  // async updateEmail(updateEmail: UpdateEmailDto) {
  //   const [user, error] = await this._usersRepository.findOne({
  //     email: updateEmail.currentEmail,
  //   });

  //   if (error) {
  //     throw new HttpException(<string>error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }

  //   if (!user) {
  //     throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  //   }

  //   if (updateEmail.newEmail !== updateEmail.confirmationEmail) {
  //     throw new HttpException('Emails do not match', HttpStatus.BAD_REQUEST);
  //   }

  //   const isMatch = await compare(updateEmail.password, user.password);

  //   if (isMatch) {
  //     user.email = updateEmail.newEmail;
  //     user.verification = {
  //       email: false,
  //     };

  //     // await user.save();

  //     const token = this._jwtService.sign(
  //       { id: user._id, field: 'email' },
  //       {
  //         expiresIn: '1d',
  //       },
  //     );
  //     // await this._emailService.sendMail(
  //     //   'Email verification',
  //     //   updateEmail.newEmail,
  //     //   {
  //     //     URL: `${this._configService.get<string>(
  //     //       'URL_APP',
  //     //     )}/verification/${token}`,
  //     //     buttonMessage: 'Verify email',
  //     //     fullName: user.fullName,
  //     //     message: `Hi ${user.firstName}, recently you requested change your email, please verify this email`,
  //     //   },
  //     // );
  //     throw new HttpException({ message: 'Email updated' }, HttpStatus.OK);
  //   }
  //   throw new HttpException('Password do not match', HttpStatus.BAD_REQUEST);
  // }

  // async updatePassword(updatePassword: UpdatePasswordDto, userId: string) {
  //   const [user, error] = await this._usersRepository.findOneById(new ObjectId(userId));
  //   if (error) {
  //     throw new HttpException(<string>error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  //   if (!user) {
  //     throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  //   }
  //   if (updatePassword.newPassword !== updatePassword.confirmationPassword) {
  //     throw new HttpException('Password do not match', HttpStatus.BAD_REQUEST);
  //   }
  //   const isMatch = await compare(updatePassword.currentPassword, user.password);

  //   if (isMatch) {
  //     user.password = updatePassword.newPassword;
  //     // await user.save();
  //     throw new HttpException('Password updated', HttpStatus.OK);
  //   }
  //   throw new HttpException('Password do not match', HttpStatus.BAD_REQUEST);
  // }

  // async verify(token: string) {
  //   const { id, field } = this._jwtService.verify(token);
  //   const [user, error] = await this._usersRepository.findOneById(id);
  //   if (error) {
  //     throw new HttpException(<string>error, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  //   if (!user) {
  //     throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  //   }
  //   user.verification[field] = true;
  //   // await user.save();
  //   throw new HttpException(`${field} verified`, HttpStatus.OK);
  // }

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
