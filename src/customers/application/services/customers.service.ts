import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { plainToInstance } from 'class-transformer'
import { v4 as uuidv4 } from 'uuid'

import { CustomerEntity } from '../../domain/entities/customer.domain'
import { CustomersRepositoryDomain } from '../../domain/repository/customers.repository.domain'
import { RegisterCustomerDto } from '../../domain/dto/register-customer.dto'
import { CustomerResponseDto, CustomerWithTokenResponseDto } from '../../domain/dto/customer-response.dto'
import { UtilsSharedService } from '../../../shared/application/services/utils-shared.service'
import { UsersRepositoryDomain } from '../../../users/domain/repository/users.repository.domain'
import { UserEntity } from '../../../users/domain/entities/user.domain'
import { UserRoles } from '../../../users/domain/entities/user-roles.interface'
import { JwtSecurityService } from '../../../auth/application/services/jwt-security.service'
import { WalletsService } from './wallets.service'

@Injectable()
export class CustomersService {
  constructor(
    private readonly _configService: ConfigService,
    private readonly _customersRepository: CustomersRepositoryDomain,
    private readonly _usersRepository: UsersRepositoryDomain,
    private readonly _jwtSecurityService: JwtSecurityService,
    private readonly _walletsService: WalletsService,
    private readonly _utilsSharedService: UtilsSharedService,
  ) {}

  async register(body: RegisterCustomerDto): Promise<CustomerWithTokenResponseDto> {
    const [userEmailFound] = await this._usersRepository.base.findOne({ email: body.email })
    this._utilsSharedService.checkErrFieldAlReadyFoundThrowErr({ result: userEmailFound, field: 'email' })

    const [documentFound] = await this._customersRepository.findByDocument(body.document)
    this._utilsSharedService.checkErrFieldAlReadyFoundThrowErr({ result: documentFound, field: 'document' })

    const [phoneFound] = await this._customersRepository.findByPhone(body.phone)
    this._utilsSharedService.checkErrFieldAlReadyFoundThrowErr({ result: phoneFound, field: 'phone' })

    const userId = uuidv4()
    const userDomain = plainToInstance(UserEntity, {
      _id: userId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password,
      role: UserRoles.Customer,
      isBlocked: false,
      verification: { email: false },
    })

    const [user, errUser] = await this._usersRepository.base.create(userDomain)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errUser })

    const customerId = uuidv4()
    const customerDomain = plainToInstance(CustomerEntity, {
      _id: customerId,
      userId: user._id,
      document: body.document,
      phone: body.phone,
      isActive: true,
    })

    const [customer, errCustomer] = await this._customersRepository.base.create(customerDomain)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errCustomer })

    const wallet = await this._walletsService.createWalletForCustomer(customer._id)

    const expiresIn = this._configService.get('JWT_EXPIRES_IN')
    const token = this._jwtSecurityService.generateToken({ _id: user._id }, expiresIn)

    const customerResponse = {
      ...customer,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      wallet: {
        _id: wallet._id,
        balance: wallet.balance,
      },
    }

    return plainToInstance(CustomerWithTokenResponseDto, {
      customer: customerResponse,
      token,
    })
  }

  async findByUserId(userId: string): Promise<CustomerResponseDto> {
    const [customer, err] = await this._customersRepository.findByUserId(userId)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err })

    if (!customer) {
      throw new NotFoundException('Customer not found for this user')
    }

    // Get user data
    const [user, errUser] = await this._usersRepository.base.findById(userId)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errUser })

    // Get wallet data
    const wallet = await this._walletsService.getWalletByCustomerId(customer._id)

    const customerResponse = {
      ...customer,
      user: user
        ? {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          }
        : undefined,
      wallet: wallet
        ? {
            _id: wallet._id,
            balance: wallet.balance,
          }
        : undefined,
    }

    return plainToInstance(CustomerResponseDto, customerResponse)
  }

  async getCustomerByUserId(userId: string): Promise<CustomerEntity> {
    const [customer, err] = await this._customersRepository.findByUserId(userId)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    return customer
  }
}
