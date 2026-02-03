import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { genSaltSync, hashSync } from 'bcryptjs'
import { UserRoles } from '../../../../users/domain/entities/user-roles.interface'
import { v4 as uuidv4 } from 'uuid'

/**
 * THIS IS JUST FOR TESTING PURPOSES. TO HAVE AN INITIAL MERCHANT/STORE
 * TO TEST WITH THE FRONTEND ECOMMERCE SIMULATION.
 */

const MERCHANT_USER_ID = uuidv4()

export const MERCHANT_USER_DATA = {
  _id: MERCHANT_USER_ID,
  firstName: 'TechStore',
  lastName: 'Colombia',
  email: 'merchant@techstore.co',
  password: 'Merchant123!',
  role: UserRoles.Merchant,
  isBlocked: false,
  verification: {
    email: true,
  },
}

export const MERCHANT_CUSTOMER_DATA = {
  _id: '5ffc242e-b32e-4512-ba97-84ee091209be',
  userId: MERCHANT_USER_ID,
  document: '900123456-1',
  phone: '+573001234567',
  isActive: true,
  avatar: '🏪',
}

@Injectable()
export class MerchantSeederService implements OnModuleInit {
  private readonly logger = new Logger(MerchantSeederService.name)

  constructor(
    @InjectModel('User') private readonly userModel: Model<any>,
    @InjectModel('Customer') private readonly customerModel: Model<any>,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') {
      return
    }

    await this.seedMerchant()
  }

  async seedMerchant() {
    try {
      // Check if merchant customer already exists
      const existingCustomer = await this.customerModel.findById(MERCHANT_CUSTOMER_DATA._id).exec()

      if (existingCustomer) {
        this.logger.log(`✅ Merchant customer already exists: ${MERCHANT_CUSTOMER_DATA._id}`)
        return existingCustomer
      }

      // Create merchant user first
      const salt = genSaltSync()
      const hashedPassword = hashSync(MERCHANT_USER_DATA.password, salt)

      const user = new this.userModel({
        ...MERCHANT_USER_DATA,
        password: hashedPassword,
      })

      await user.save()
      this.logger.log(`👤 Merchant user created: ${MERCHANT_USER_DATA.email}`)

      // Create merchant customer
      const customer = new this.customerModel(MERCHANT_CUSTOMER_DATA)
      await customer.save()

      this.logger.log('🏪 Merchant seeded successfully:')
      this.logger.log(`   Customer ID: ${MERCHANT_CUSTOMER_DATA._id}`)
      this.logger.log(`   User ID: ${MERCHANT_USER_DATA._id}`)
      this.logger.log(`   Name: ${MERCHANT_USER_DATA.firstName} ${MERCHANT_USER_DATA.lastName}`)
      this.logger.log(`   Email: ${MERCHANT_USER_DATA.email}`)
      this.logger.log(`   Password: ${MERCHANT_USER_DATA.password}`)
      this.logger.log(`   Document: ${MERCHANT_CUSTOMER_DATA.document}`)
      this.logger.log(`   Phone: ${MERCHANT_CUSTOMER_DATA.phone}`)
      this.logger.log(`   Avatar: ${MERCHANT_CUSTOMER_DATA.avatar}`)

      return customer
    } catch (error) {
      this.logger.error('❌ Error seeding merchant:', error.message)
    }
  }
}
