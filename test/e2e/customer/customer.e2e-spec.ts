import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../../src/app.module'
import { Types } from 'mongoose'
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

describe('Test customers - registroCliente (e2e)', () => {
  let app: INestApplication
  let module: TestingModule
  let usersRepository: UsersRepositoryDomain
  let customersRepository: CustomersRepositoryDomain
  let walletsRepository: WalletsRepositoryDomain

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
  })

  afterAll(async () => {
    await app?.close()
  })

  describe('POST /customers/register - registroCliente', () => {
    it('should register a new customer successfully and return 201', async () => {
      const customerData = generateCustomerData()

      const response = await request(app.getHttpServer())
        .post(`${endpoint}/register`)
        .send(customerData)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('customer')
      expect(response.body).toHaveProperty('token')
      expect(response.body.customer).toHaveProperty('_id')
      expect(response.body.customer).toHaveProperty('userId')
      expect(response.body.customer).toHaveProperty('document', customerData.document)
      expect(response.body.customer).toHaveProperty('phone', customerData.phone)
      expect(response.body.customer).toHaveProperty('isActive', true)
      expect(response.body.customer).toHaveProperty('user')
      expect(response.body.customer.user).toHaveProperty('email', customerData.email)
      expect(response.body.customer.user).toHaveProperty('firstName', customerData.firstName)
      expect(response.body.customer).toHaveProperty('wallet')
      expect(response.body.customer.wallet).toHaveProperty('balance', 0)

      // Cleanup
      const customerId = response.body.customer._id
      const userId = response.body.customer.userId
      const walletId = response.body.customer.wallet._id
      await walletsRepository.base.deleteById(walletId)
      await customersRepository.base.deleteById(customerId)
      await usersRepository.base.deleteById(userId)
    })

    it('should fail with 400 when email already exists', async () => {
      const customerData = generateCustomerData()

      // First registration
      const firstResponse = await request(app.getHttpServer())
        .post(`${endpoint}/register`)
        .send(customerData)

      expect(firstResponse.status).toBe(201)

      // Second registration with same email
      const duplicateData = {
        ...generateCustomerData(),
        email: customerData.email,
      }

      const response = await request(app.getHttpServer())
        .post(`${endpoint}/register`)
        .send(duplicateData)

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('email')

      // Cleanup
      const customerId = firstResponse.body.customer._id
      const userId = firstResponse.body.customer.userId
      const walletId = firstResponse.body.customer.wallet._id
      await walletsRepository.base.deleteById(walletId)
      await customersRepository.base.deleteById(customerId)
      await usersRepository.base.deleteById(userId)
    })

    it('should fail with 400 when document already exists', async () => {
      const customerData = generateCustomerData()

      // First registration
      const firstResponse = await request(app.getHttpServer())
        .post(`${endpoint}/register`)
        .send(customerData)

      expect(firstResponse.status).toBe(201)

      // Second registration with same document
      const duplicateData = {
        ...generateCustomerData(),
        document: customerData.document,
      }

      const response = await request(app.getHttpServer())
        .post(`${endpoint}/register`)
        .send(duplicateData)

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('document')

      // Cleanup
      const customerId = firstResponse.body.customer._id
      const userId = firstResponse.body.customer.userId
      const walletId = firstResponse.body.customer.wallet._id
      await walletsRepository.base.deleteById(walletId)
      await customersRepository.base.deleteById(customerId)
      await usersRepository.base.deleteById(userId)
    })

    it('should fail with 400 when phone already exists', async () => {
      const customerData = generateCustomerData()

      // First registration
      const firstResponse = await request(app.getHttpServer())
        .post(`${endpoint}/register`)
        .send(customerData)

      expect(firstResponse.status).toBe(201)

      // Second registration with same phone
      const duplicateData = {
        ...generateCustomerData(),
        phone: customerData.phone,
      }

      const response = await request(app.getHttpServer())
        .post(`${endpoint}/register`)
        .send(duplicateData)

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('phone')

      // Cleanup
      const customerId = firstResponse.body.customer._id
      const userId = firstResponse.body.customer.userId
      const walletId = firstResponse.body.customer.wallet._id
      await walletsRepository.base.deleteById(walletId)
      await customersRepository.base.deleteById(customerId)
      await usersRepository.base.deleteById(userId)
    })

    it('should fail with 400 when required fields are missing', async () => {
      const incompleteData = {
        firstName: faker.person.firstName(),
        email: faker.internet.email(),
      }

      const response = await request(app.getHttpServer())
        .post(`${endpoint}/register`)
        .send(incompleteData)

      expect(response.status).toBe(400)
    })

    it('should fail with 400 when email format is invalid', async () => {
      const invalidData = {
        ...generateCustomerData(),
        email: 'invalid-email',
      }

      const response = await request(app.getHttpServer())
        .post(`${endpoint}/register`)
        .send(invalidData)

      expect(response.status).toBe(400)
    })

    it('should fail with 400 when password is too short', async () => {
      const invalidData = {
        ...generateCustomerData(),
        password: '123',
      }

      const response = await request(app.getHttpServer())
        .post(`${endpoint}/register`)
        .send(invalidData)

      expect(response.status).toBe(400)
    })
  })
})
