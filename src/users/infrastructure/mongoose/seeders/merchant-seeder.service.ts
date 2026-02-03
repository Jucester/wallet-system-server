import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { genSaltSync, hashSync } from 'bcryptjs'
import { UserRoles } from '../../../domain/entities/user-roles.interface'

export const MERCHANT_DATA = {
  _id: '5ffc242e-b32e-4512-ba97-84ee091209be',
  firstName: 'TechStore',
  lastName: 'Colombia',
  email: 'merchant@techstore.co',
  password: 'Merchant123!',
  role: UserRoles.Merchant,
  logo: '🏪',
  isBlocked: false,
  verification: {
    email: true,
  },
}

@Injectable()
export class MerchantSeederService implements OnModuleInit {
  private readonly logger = new Logger(MerchantSeederService.name)

  constructor(@InjectModel('User') private readonly userModel: Model<any>) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') {
      return
    }

    await this.seedMerchant()
  }

  async seedMerchant() {
    try {
      const existingMerchant = await this.userModel.findById(MERCHANT_DATA._id).exec()

      if (existingMerchant) {
        this.logger.log(`✅ Merchant already exists: ${existingMerchant.firstName} ${existingMerchant.lastName}`)
        return existingMerchant
      }

      const salt = genSaltSync()
      const hashedPassword = hashSync(MERCHANT_DATA.password, salt)

      const merchant = new this.userModel({
        ...MERCHANT_DATA,
        password: hashedPassword,
      })

      await merchant.save()

      this.logger.log('🏪 Merchant seeded successfully:')
      this.logger.log(`   ID: ${MERCHANT_DATA._id}`)
      this.logger.log(`   Name: ${MERCHANT_DATA.firstName} ${MERCHANT_DATA.lastName}`)
      this.logger.log(`   Email: ${MERCHANT_DATA.email}`)
      this.logger.log(`   Password: ${MERCHANT_DATA.password}`)

      return merchant
    } catch (error) {
      this.logger.error('❌ Error seeding merchant:', error.message)
    }
  }
}
