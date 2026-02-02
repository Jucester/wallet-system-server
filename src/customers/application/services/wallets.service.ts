import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { v4 as uuidv4 } from 'uuid'

import { WalletEntity } from '../../domain/entities/wallet.domain'
import { WalletsRepositoryDomain } from '../../domain/repository/wallets.repository.domain'
import { UtilsSharedService } from '../../../shared/application/services/utils-shared.service'
import { BalanceResponseDto, RechargeResponseDto } from '../../domain/dto/wallet-response.dto'
import { CustomersRepositoryDomain } from '../../domain/repository/customers.repository.domain'

@Injectable()
export class WalletsService {
  constructor(
    private readonly _walletsRepository: WalletsRepositoryDomain,
    private readonly _customersRepository: CustomersRepositoryDomain,
    private readonly _utilsSharedService: UtilsSharedService,
  ) {}

  async createWalletForCustomer(customerId: string): Promise<WalletEntity> {
    const walletDomain = plainToInstance(WalletEntity, {
      _id: uuidv4(),
      customerId,
      balance: 0,
    })

    const [wallet, err] = await this._walletsRepository.base.create(walletDomain)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err })

    return wallet
  }

  async getBalanceByUserId(userId: string): Promise<BalanceResponseDto> {
    const [customer, errCustomer] = await this._customersRepository.findByUserId(userId)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errCustomer })

    if (!customer) {
      throw new NotFoundException('Customer not found for this user')
    }

    const [wallet, errWallet] = await this._walletsRepository.findByCustomerId(customer._id)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errWallet })

    if (!wallet) {
      throw new NotFoundException('Wallet not found for this customer')
    }

    return plainToInstance(BalanceResponseDto, {
      walletId: wallet._id,
      balance: wallet.balance,
    })
  }

  async rechargeByUserId(userId: string, amount: number): Promise<RechargeResponseDto> {
    const [customer, errCustomer] = await this._customersRepository.findByUserId(userId)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errCustomer })

    if (!customer) {
      throw new NotFoundException('Customer not found for this user')
    }

    const [wallet, errWallet] = await this._walletsRepository.findByCustomerId(customer._id)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errWallet })

    if (!wallet) {
      throw new NotFoundException('Wallet not found for this customer')
    }

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0')
    }

    const previousBalance = wallet.balance
    const [updatedWallet, errUpdate] = await this._walletsRepository.incrementBalance(wallet._id, amount)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errUpdate })

    return plainToInstance(RechargeResponseDto, {
      previousBalance,
      amountRecharged: amount,
      newBalance: updatedWallet.balance,
      message: 'Wallet recharged successfully',
    })
  }

  async getWalletByCustomerId(customerId: string): Promise<WalletEntity> {
    const [wallet, err] = await this._walletsRepository.findByCustomerId(customerId)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    return wallet
  }

  async deductBalance(walletId: string, amount: number): Promise<WalletEntity> {
    const [wallet, err] = await this._walletsRepository.decrementBalance(walletId, amount)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    return wallet
  }
}
