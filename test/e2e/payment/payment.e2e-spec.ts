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

describe('Test payments - Merchant & P2P flows (e2e)', () => {
  let app: INestApplication
  let module: TestingModule
  let usersRepository: UsersRepositoryDomain
  let customersRepository: CustomersRepositoryDomain
  let walletsRepository: WalletsRepositoryDomain
  let paymentSessionsRepository: PaymentSessionsRepositoryDomain
  let transactionsRepository: TransactionsRepositoryDomain

  // Merchant (destination for merchant payments)
  let merchantToken: string
  let merchantId: string
  let merchantUserId: string
  let merchantWalletId: string
  const merchantData = generateCustomerData()

  // Payer/Sender
  let payerToken: string
  let payerId: string
  let payerUserId: string
  let payerWalletId: string
  const payerData = generateCustomerData()

  // Recipient (for P2P transfers)
  let recipientToken: string
  let recipientId: string
  let recipientUserId: string
  let recipientWalletId: string
  const recipientData = generateCustomerData()

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

    // Register merchant
    const merchantResponse = await request(app.getHttpServer())
      .post(`${customersEndpoint}/register`)
      .send(merchantData)

    merchantToken = merchantResponse.body.token
    merchantId = merchantResponse.body.customer._id
    merchantUserId = merchantResponse.body.customer.userId
    merchantWalletId = merchantResponse.body.customer.wallet._id

    // Register payer
    const payerResponse = await request(app.getHttpServer()).post(`${customersEndpoint}/register`).send(payerData)

    payerToken = payerResponse.body.token
    payerId = payerResponse.body.customer._id
    payerUserId = payerResponse.body.customer.userId
    payerWalletId = payerResponse.body.customer.wallet._id

    // Register recipient
    const recipientResponse = await request(app.getHttpServer())
      .post(`${customersEndpoint}/register`)
      .send(recipientData)

    recipientToken = recipientResponse.body.token
    recipientId = recipientResponse.body.customer._id
    recipientUserId = recipientResponse.body.customer.userId
    recipientWalletId = recipientResponse.body.customer.wallet._id

    // Recharge payer's wallet
    await request(app.getHttpServer())
      .post(`${customersEndpoint}/wallet/recharge`)
      .set('Authorization', `Bearer ${payerToken}`)
      .send({ amount: initialRechargeAmount })
  })

  afterAll(async () => {
    // Cleanup transactions
    for (const walletId of [merchantWalletId, payerWalletId, recipientWalletId]) {
      const [transactions] = await transactionsRepository.findByWalletId(walletId)
      if (transactions?.data) {
        for (const tx of transactions.data) {
          await transactionsRepository.base.deleteById(tx._id)
        }
      }
    }

    // Cleanup payment sessions
    for (const customerId of [merchantId, payerId, recipientId]) {
      const [sessions] = await paymentSessionsRepository.findPendingByCustomerId(customerId)
      if (sessions) {
        for (const session of sessions) {
          await paymentSessionsRepository.base.deleteById(session._id)
        }
      }
    }

    // Cleanup customers and users
    await walletsRepository.base.deleteById(merchantWalletId)
    await customersRepository.base.deleteById(merchantId)
    await usersRepository.base.deleteById(merchantUserId)

    await walletsRepository.base.deleteById(payerWalletId)
    await customersRepository.base.deleteById(payerId)
    await usersRepository.base.deleteById(payerUserId)

    await walletsRepository.base.deleteById(recipientWalletId)
    await customersRepository.base.deleteById(recipientId)
    await usersRepository.base.deleteById(recipientUserId)

    await app?.close()
  })

  describe('POST /payments/request - Merchant Payment Flow (Authenticated)', () => {
    it('should request a payment to merchant and return sessionId', async () => {
      const paymentAmount = 25000

      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/request`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({
          merchantId: merchantId,
          amount: paymentAmount,
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('sessionId')
      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('Token')

      // Cleanup
      await paymentSessionsRepository.base.deleteById(response.body.sessionId)
    })

    it('should fail with 404 when merchant not found', async () => {
      const nonExistentUUID = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/request`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({
          merchantId: nonExistentUUID,
          amount: 10000,
        })

      expect(response.status).toBe(404)
      expect(response.body.message).toContain('Comercio')
    })

    it('should fail with 400 when trying to pay yourself', async () => {
      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/request`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({
          merchantId: payerId, // Trying to pay yourself
          amount: 10000,
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('ti mismo')
    })

    it('should fail with 400 when payer has insufficient balance', async () => {
      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/request`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({
          merchantId: merchantId,
          amount: 999999999,
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('insuficiente')
    })

    it('should fail with 401 when not authenticated', async () => {
      const response = await request(app.getHttpServer()).post(`${paymentsEndpoint}/request`).send({
        merchantId: merchantId,
        amount: 10000,
      })

      expect(response.status).toBe(401)
    })

    it('should confirm merchant payment and transfer funds', async () => {
      // Get initial balances
      const payerBalanceBefore = await request(app.getHttpServer())
        .get(`${customersEndpoint}/wallet/balance`)
        .set('Authorization', `Bearer ${payerToken}`)

      const merchantBalanceBefore = await request(app.getHttpServer())
        .get(`${customersEndpoint}/wallet/balance`)
        .set('Authorization', `Bearer ${merchantToken}`)

      const paymentAmount = 15000

      // Request payment (authenticated)
      const requestResponse = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/request`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({
          merchantId: merchantId,
          amount: paymentAmount,
        })

      expect(requestResponse.status).toBe(200)
      const sessionId = requestResponse.body.sessionId
      const otpMatch = requestResponse.body.message.match(/OTP: (\d{6})/)
      const otp = otpMatch[1]

      // Confirm payment (payer confirms)
      const confirmResponse = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/confirm`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({ sessionId, token: otp })

      expect(confirmResponse.status).toBe(200)
      expect(confirmResponse.body).toHaveProperty('type', 'merchant')
      expect(confirmResponse.body.amountDeducted).toBe(paymentAmount)
      expect(confirmResponse.body.newBalance).toBe(payerBalanceBefore.body.balance - paymentAmount)

      // Verify merchant received funds
      const merchantBalanceAfter = await request(app.getHttpServer())
        .get(`${customersEndpoint}/wallet/balance`)
        .set('Authorization', `Bearer ${merchantToken}`)

      expect(merchantBalanceAfter.body.balance).toBe(merchantBalanceBefore.body.balance + paymentAmount)
    })
  })

  describe('POST /payments/send - P2P Transfer Flow (Authenticated)', () => {
    it('should send payment to another customer', async () => {
      const transferAmount = 5000

      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/send`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({
          recipientDocument: recipientData.document,
          recipientPhone: recipientData.phone,
          amount: transferAmount,
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('sessionId')
      expect(response.body.message).toContain('Token')

      // Cleanup
      await paymentSessionsRepository.base.deleteById(response.body.sessionId)
    })

    it('should fail with 404 when recipient not found', async () => {
      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/send`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({
          recipientDocument: '0000000000',
          recipientPhone: '0000000000',
          amount: 1000,
        })

      expect(response.status).toBe(404)
      expect(response.body.message).toContain('Destinatario')
    })

    it('should fail with 400 when trying to send to yourself', async () => {
      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/send`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({
          recipientDocument: payerData.document,
          recipientPhone: payerData.phone,
          amount: 1000,
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('ti mismo')
    })

    it('should fail with 400 when sender has insufficient balance', async () => {
      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/send`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({
          recipientDocument: recipientData.document,
          recipientPhone: recipientData.phone,
          amount: 999999999,
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('insuficiente')
    })

    it('should fail with 401 when not authenticated', async () => {
      const response = await request(app.getHttpServer()).post(`${paymentsEndpoint}/send`).send({
        recipientDocument: recipientData.document,
        recipientPhone: recipientData.phone,
        amount: 1000,
      })

      expect(response.status).toBe(401)
    })

    it('should confirm P2P transfer and move funds', async () => {
      // Get initial balances
      const senderBalanceBefore = await request(app.getHttpServer())
        .get(`${customersEndpoint}/wallet/balance`)
        .set('Authorization', `Bearer ${payerToken}`)

      const recipientBalanceBefore = await request(app.getHttpServer())
        .get(`${customersEndpoint}/wallet/balance`)
        .set('Authorization', `Bearer ${recipientToken}`)

      const transferAmount = 10000

      // Send payment
      const sendResponse = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/send`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({
          recipientDocument: recipientData.document,
          recipientPhone: recipientData.phone,
          amount: transferAmount,
        })

      expect(sendResponse.status).toBe(200)
      const sessionId = sendResponse.body.sessionId
      const otpMatch = sendResponse.body.message.match(/OTP: (\d{6})/)
      const otp = otpMatch[1]

      // Confirm transfer (sender confirms)
      const confirmResponse = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/confirm`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({ sessionId, token: otp })

      expect(confirmResponse.status).toBe(200)
      expect(confirmResponse.body).toHaveProperty('type', 'p2p')
      expect(confirmResponse.body.amountDeducted).toBe(transferAmount)
      expect(confirmResponse.body.newBalance).toBe(senderBalanceBefore.body.balance - transferAmount)

      // Verify recipient received funds
      const recipientBalanceAfter = await request(app.getHttpServer())
        .get(`${customersEndpoint}/wallet/balance`)
        .set('Authorization', `Bearer ${recipientToken}`)

      expect(recipientBalanceAfter.body.balance).toBe(recipientBalanceBefore.body.balance + transferAmount)
    })
  })

  describe('POST /payments/confirm - Confirmation errors', () => {
    it('should fail with 400 when OTP is invalid', async () => {
      const sendResponse = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/send`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({
          recipientDocument: recipientData.document,
          recipientPhone: recipientData.phone,
          amount: 1000,
        })

      const sessionId = sendResponse.body.sessionId

      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/confirm`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({ sessionId, token: '000000' })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('inválido')

      // Cleanup
      await paymentSessionsRepository.base.deleteById(sessionId)
    })

    it('should fail with 404 when session does not exist', async () => {
      const nonExistentUUID = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/confirm`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({
          sessionId: nonExistentUUID,
          token: '123456',
        })

      expect(response.status).toBe(404)
    })

    it('should fail with 400 when session is already confirmed', async () => {
      const sendResponse = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/send`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({
          recipientDocument: recipientData.document,
          recipientPhone: recipientData.phone,
          amount: 1000,
        })

      const sessionId = sendResponse.body.sessionId
      const otpMatch = sendResponse.body.message.match(/OTP: (\d{6})/)
      const otp = otpMatch[1]

      // Confirm first time
      await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/confirm`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({ sessionId, token: otp })

      // Try to confirm again
      const response = await request(app.getHttpServer())
        .post(`${paymentsEndpoint}/confirm`)
        .set('Authorization', `Bearer ${payerToken}`)
        .send({ sessionId, token: otp })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('confirmed')
    })

    it('should fail with 401 when not authenticated', async () => {
      const response = await request(app.getHttpServer()).post(`${paymentsEndpoint}/confirm`).send({
        sessionId: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
        token: '123456',
      })

      expect(response.status).toBe(401)
    })
  })
})
