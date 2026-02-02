import { TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import * as request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { UsersRepositoryDomain } from '../../../src/users/domain/repository/users.repository.domain'
import { CustomersRepositoryDomain } from '../../../src/customers/domain/repository/customers.repository.domain'
import { WalletsRepositoryDomain } from '../../../src/customers/domain/repository/wallets.repository.domain'

export interface CustomerTestData {
  document: string
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

export interface RegisteredCustomer {
  token: string
  customerId: string
  userId: string
  walletId: string
  data: CustomerTestData
}

export const generateCustomerData = (): CustomerTestData => ({
  document: faker.string.numeric(10),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email().toLowerCase(),
  phone: faker.string.numeric(10),
  password: faker.internet.password({ length: 8 }),
})

export async function registerCustomer(arg: {
  app: INestApplication
  data?: CustomerTestData
}): Promise<RegisteredCustomer> {
  const { app, data } = arg
  const customerData = data || generateCustomerData()

  const response = await request(app.getHttpServer())
    .post('/api/customers/register')
    .send(customerData)

  if (response.status !== 201) {
    throw new Error(`Failed to register customer: ${JSON.stringify(response.body)}`)
  }

  return {
    token: response.body.token,
    customerId: response.body.customer._id,
    userId: response.body.customer.userId,
    walletId: response.body.customer.wallet._id,
    data: customerData,
  }
}

export async function cleanupCustomer(arg: {
  module: TestingModule
  customer: RegisteredCustomer
}): Promise<void> {
  const { module, customer } = arg

  const usersRepository = module.get<UsersRepositoryDomain>(UsersRepositoryDomain)
  const customersRepository = module.get<CustomersRepositoryDomain>(CustomersRepositoryDomain)
  const walletsRepository = module.get<WalletsRepositoryDomain>(WalletsRepositoryDomain)

  await walletsRepository.base.deleteById(customer.walletId)
  await customersRepository.base.deleteById(customer.customerId)
  await usersRepository.base.deleteById(customer.userId)
}

export async function rechargeWallet(arg: {
  app: INestApplication
  token: string
  amount: number
}): Promise<{ previousBalance: number; newBalance: number }> {
  const { app, token, amount } = arg

  const response = await request(app.getHttpServer())
    .post('/api/customers/wallet/recharge')
    .set('Authorization', `Bearer ${token}`)
    .send({ amount })

  if (response.status !== 200) {
    throw new Error(`Failed to recharge wallet: ${JSON.stringify(response.body)}`)
  }

  return {
    previousBalance: response.body.previousBalance,
    newBalance: response.body.newBalance,
  }
}

export async function getWalletBalance(arg: {
  app: INestApplication
  token: string
}): Promise<number> {
  const { app, token } = arg

  const response = await request(app.getHttpServer())
    .get('/api/customers/wallet/balance')
    .set('Authorization', `Bearer ${token}`)

  if (response.status !== 200) {
    throw new Error(`Failed to get wallet balance: ${JSON.stringify(response.body)}`)
  }

  return response.body.balance
}
