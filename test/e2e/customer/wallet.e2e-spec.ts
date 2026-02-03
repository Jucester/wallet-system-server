import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../../src/app.module'
import { faker } from '@faker-js/faker'
import { UsersRepositoryDomain } from '../../../src/users/domain/repository/users.repository.domain'
import { CustomersRepositoryDomain } from '../../../src/customers/domain/repository/customers.repository.domain'
import { WalletsRepositoryDomain } from '../../../src/customers/domain/repository/wallets.repository.domain'

import '../shared-helpers/set-timeout'

const endpoint = '/api/customers'

const generateCustomerData = () => ({
  document: faker.string.numeric(10),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email().toLowerCase(),
  phone: faker.string.numeric(10),
  password: faker.internet.password({ length: 8 }),
})

describe('Test wallets - recargarBilletera & consultarSaldo (e2e)', () => {
  let app: INestApplication
  let module: TestingModule
  let usersRepository: UsersRepositoryDomain
  let customersRepository: CustomersRepositoryDomain
  let walletsRepository: WalletsRepositoryDomain

  // Customer data for tests
  let customerToken: string
  let customerId: string
  let userId: string
  let walletId: string

  const customerData = generateCustomerData()

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = module.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init()

    usersRepository = module.get<UsersRepositoryDomain>(UsersRepositoryDomain)
    customersRepository = module.get<CustomersRepositoryDomain>(CustomersRepositoryDomain)
    walletsRepository = module.get<WalletsRepositoryDomain>(WalletsRepositoryDomain)

    // Register a customer for wallet tests
    const registerResponse = await request(app.getHttpServer())
      .post(`${endpoint}/register`)
      .send(customerData)

    customerToken = registerResponse.body.token
    customerId = registerResponse.body.customer._id
    userId = registerResponse.body.customer.userId
    walletId = registerResponse.body.customer.wallet._id
  })

  afterAll(async () => {
    // Cleanup
    await walletsRepository.base.deleteById(walletId)
    await customersRepository.base.deleteById(customerId)
    await usersRepository.base.deleteById(userId)
    await app?.close()
  })

  describe('GET /customers/wallet/balance - consultarSaldo', () => {
    it('should return wallet balance successfully with status 200', async () => {
      const response = await request(app.getHttpServer())
        .get(`${endpoint}/wallet/balance`)
        .set('Authorization', `Bearer ${customerToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('walletId')
      expect(response.body).toHaveProperty('balance')
      expect(typeof response.body.balance).toBe('number')
    })

    it('should fail with 401 when no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get(`${endpoint}/wallet/balance`)

      expect(response.status).toBe(401)
    })

    it('should fail with 401 when invalid token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get(`${endpoint}/wallet/balance`)
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(401)
    })
  })

  describe('POST /customers/wallet/recharge - recargarBilletera', () => {
    it('should recharge wallet successfully with status 200', async () => {
      const rechargeAmount = 50000

      const response = await request(app.getHttpServer())
        .post(`${endpoint}/wallet/recharge`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: rechargeAmount })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('previousBalance')
      expect(response.body).toHaveProperty('amountRecharged', rechargeAmount)
      expect(response.body).toHaveProperty('newBalance')
      expect(response.body).toHaveProperty('message')
      expect(response.body.newBalance).toBe(response.body.previousBalance + rechargeAmount)
    })

    it('should accumulate balance on multiple recharges', async () => {
      // Get current balance
      const balanceResponse = await request(app.getHttpServer())
        .get(`${endpoint}/wallet/balance`)
        .set('Authorization', `Bearer ${customerToken}`)

      const currentBalance = balanceResponse.body.balance
      const rechargeAmount = 25000

      // Recharge
      const response = await request(app.getHttpServer())
        .post(`${endpoint}/wallet/recharge`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: rechargeAmount })

      expect(response.status).toBe(200)
      expect(response.body.previousBalance).toBe(currentBalance)
      expect(response.body.newBalance).toBe(currentBalance + rechargeAmount)
    })

    it('should fail with 400 when amount is negative', async () => {
      const response = await request(app.getHttpServer())
        .post(`${endpoint}/wallet/recharge`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: -1000 })

      expect(response.status).toBe(400)
    })

    it('should fail with 400 when amount is zero', async () => {
      const response = await request(app.getHttpServer())
        .post(`${endpoint}/wallet/recharge`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: 0 })

      expect(response.status).toBe(400)
    })

    it('should fail with 400 when amount is not a number', async () => {
      const response = await request(app.getHttpServer())
        .post(`${endpoint}/wallet/recharge`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: 'invalid' })

      expect(response.status).toBe(400)
    })

    it('should fail with 400 when amount is missing', async () => {
      const response = await request(app.getHttpServer())
        .post(`${endpoint}/wallet/recharge`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({})

      expect(response.status).toBe(400)
    })

    it('should fail with 401 when no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .post(`${endpoint}/wallet/recharge`)
        .send({ amount: 10000 })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /customers/me - Get customer profile', () => {
    it('should return customer profile with user and wallet info', async () => {
      const response = await request(app.getHttpServer())
        .get(`${endpoint}/me`)
        .set('Authorization', `Bearer ${customerToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('_id')
      expect(response.body).toHaveProperty('userId')
      expect(response.body).toHaveProperty('document', customerData.document)
      expect(response.body).toHaveProperty('phone', customerData.phone)
      expect(response.body).toHaveProperty('isActive', true)
      expect(response.body).toHaveProperty('user')
      expect(response.body.user).toHaveProperty('email', customerData.email)
      expect(response.body.user).toHaveProperty('firstName', customerData.firstName)
      expect(response.body).toHaveProperty('wallet')
      expect(response.body.wallet).toHaveProperty('balance')
    })

    it('should fail with 401 when no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get(`${endpoint}/me`)

      expect(response.status).toBe(401)
    })
  })

  describe('GET /payments/history - Transaction history', () => {
    const paymentsEndpoint = '/api/payments'

    it('should return empty transaction history initially', async () => {
      const response = await request(app.getHttpServer())
        .get(`${paymentsEndpoint}/history`)
        .set('Authorization', `Bearer ${customerToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('metadata')
      expect(response.body).toHaveProperty('data')
      expect(response.body.metadata).toHaveProperty('totalDocs')
      expect(response.body.metadata).toHaveProperty('page')
      expect(response.body.metadata).toHaveProperty('limit')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should return paginated transaction history with query params', async () => {
      const response = await request(app.getHttpServer())
        .get(`${paymentsEndpoint}/history?page=1&limit=5`)
        .set('Authorization', `Bearer ${customerToken}`)

      expect(response.status).toBe(200)
      expect(response.body.metadata.page).toBe(1)
      expect(response.body.metadata.limit).toBe(5)
    })

    it('should fail with 401 when no token is provided', async () => {
      const response = await request(app.getHttpServer()).get(`${paymentsEndpoint}/history`)

      expect(response.status).toBe(401)
    })
  })
})
