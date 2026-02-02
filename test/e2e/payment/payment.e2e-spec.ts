import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../../src/app.module'
import { faker } from '@faker-js/faker'
import { UsersRepositoryDomain } from '../../../src/users/domain/repository/users.repository.domain'
import { CustomersRepositoryDomain } from '../../../src/customers/domain/repository/customers.repository.domain'
import { WalletsRepositoryDomain } from '../../../src/customers/domain/repository/wallets.repository.domain'
import { PaymentSessionsRepositoryDomain } from '../../../src/payments/domain/repository/payment-sessions.repository.domain'
import { TransactionsRepositoryDomain } from '../../../src/payments/domain/repository/transactions.repository.domain'

import '../shared-helpers/set-timeout'

const customersEndpoint = '/api/customers'
const paymentsEndpoint = '/api/payments'

const generateCustomerData = () => ({
  document: faker.string.numeric(10),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email().toLowerCase(),
  phone: faker.string.numeric(10),
  password: faker.internet.password({ length: 8 }),
})

describe('Test payments - solicitarPago & confirmarPago (e2e)', () => {
  let app: INestApplication
  let module: TestingModule
  let usersRepository: UsersRepositoryDomain
  let customersRepository: CustomersRepositoryDomain
  let walletsRepository: WalletsRepositoryDomain
  let paymentSessionsRepository: PaymentSessionsRepositoryDomain
  let transactionsRepository: TransactionsRepositoryDomain

  let customerToken: string
  let customerId: string
  let userId: string
  let walletId: string

  const customerData = generateCustomerData()
  const initialRechargeAmount = 100000

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
    paymentSessionsRepository = module.get<PaymentSessionsRepositoryDomain>(PaymentSessionsRepositoryDomain)
    transactionsRepository = module.get<TransactionsRepositoryDomain>(TransactionsRepositoryDomain)

    // Register a customer
    const registerResponse = await request(app.getHttpServer())
      .post(`${customersEndpoint}/register`)
      .send(customerData)

    customerToken = registerResponse.body.token
    customerId = registerResponse.body.customer._id
    userId = registerResponse.body.customer.userId
    walletId = registerResponse.body.customer.wallet._id

    // Recharge wallet for payment tests
    await request(app.getHttpServer())
      .post(`${customersEndpoint}/wallet/recharge`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ amount: initialRechargeAmount })
  })

  afterAll(async () => {
    // Cleanup transactions
    const [transactions] = await transactionsRepository.findByWalletId(walletId)
    if (transactions?.data) {
      for (const tx of transactions.data) {
        await transactionsRepository.base.deleteById(tx._id)
      }
    }

    // Cleanup payment sessions
    const [sessions] = await paymentSessionsRepository.findPendingByCustomerId(customerId)
    if (sessions) {
      for (const session of sessions) {
        await paymentSessionsRepository.base.deleteById(session._id)
      }
    }

    // Cleanup customer data
    await walletsRepository.base.deleteById(walletId)
    await customersRepository.base.deleteById(customerId)
    await usersRepository.base.deleteById(userId)
    await app?.close()
  })

  describe('POST /payments/request - solicitarPago', () => {
    it('should request a payment and return sessionId with status 200', async () => {
      const paymentAmount = 25000

      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/request`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: paymentAmount })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('sessionId')
      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('Token')

      // Cleanup: delete the session
      await paymentSessionsRepository.base.deleteById(response.body.sessionId)
    })

    it('should fail with 400 when amount exceeds balance', async () => {
      const excessiveAmount = 999999999

      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/request`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: excessiveAmount })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('insuficiente')
    })

    it('should fail with 400 when amount is negative', async () => {
      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/request`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: -1000 })

      expect(response.status).toBe(400)
    })

    it('should fail with 400 when amount is zero', async () => {
      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/request`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: 0 })

      expect(response.status).toBe(400)
    })

    it('should fail with 401 when no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/request`)
        .send({ amount: 10000 })

      expect(response.status).toBe(401)
    })
  })

  describe('POST /payments/confirm - confirmarPago', () => {
    it('should confirm payment with valid OTP and deduct balance', async () => {
      // Get current balance
      const balanceResponse = await request(app.getHttpServer())
        .get(`${customersEndpoint}/wallet/balance`)
        .set('Authorization', `Bearer ${customerToken}`)

      const balanceBefore = balanceResponse.body.balance
      const paymentAmount = 15000

      // Request payment
      const requestResponse = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/request`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: paymentAmount })

      expect(requestResponse.status).toBe(200)
      const sessionId = requestResponse.body.sessionId

      // Extract OTP from message (for testing purposes, OTP is included in message)
      const otpMatch = requestResponse.body.message.match(/OTP: (\d{6})/)
      const otp = otpMatch ? otpMatch[1] : null
      expect(otp).toBeTruthy()

      // Confirm payment
      const confirmResponse = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/confirm`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ sessionId, token: otp })

      expect(confirmResponse.status).toBe(200)
      expect(confirmResponse.body).toHaveProperty('message')
      expect(confirmResponse.body).toHaveProperty('previousBalance', balanceBefore)
      expect(confirmResponse.body).toHaveProperty('amountDeducted', paymentAmount)
      expect(confirmResponse.body).toHaveProperty('newBalance', balanceBefore - paymentAmount)
      expect(confirmResponse.body.message).toContain('exitosamente')
    })

    it('should fail with 400 when OTP is invalid', async () => {
      const paymentAmount = 5000

      // Request payment
      const requestResponse = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/request`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: paymentAmount })

      const sessionId = requestResponse.body.sessionId

      // Try to confirm with wrong OTP
      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/confirm`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ sessionId, token: '000000' })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('inválido')

      // Cleanup
      await paymentSessionsRepository.base.deleteById(sessionId)
    })

    it('should fail with 404 when session does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/confirm`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          sessionId: '00000000-0000-0000-0000-000000000000',
          token: '123456',
        })

      expect(response.status).toBe(404)
    })

    it('should fail with 400 when session is already confirmed', async () => {
      const paymentAmount = 5000

      // Request payment
      const requestResponse = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/request`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: paymentAmount })

      const sessionId = requestResponse.body.sessionId
      const otpMatch = requestResponse.body.message.match(/OTP: (\d{6})/)
      const otp = otpMatch[1]

      // Confirm payment
      await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/confirm`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ sessionId, token: otp })

      // Try to confirm again
      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/confirm`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ sessionId, token: otp })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('confirmed')
    })

    it('should fail with 400 when token format is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/confirm`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          sessionId: '00000000-0000-0000-0000-000000000000',
          token: '123', // Too short
        })

      expect(response.status).toBe(400)
    })

    it('should fail with 401 when no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/confirm`)
        .send({
          sessionId: '00000000-0000-0000-0000-000000000000',
          token: '123456',
        })

      expect(response.status).toBe(401)
    })
  })
})
