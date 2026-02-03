import * as mongoose from 'mongoose'
import { genSaltSync, hashSync } from 'bcryptjs'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
const envFile = process.env.NODE_ENV === 'testing' ? 'testing.env' : 'local.env'
dotenv.config({ path: path.resolve(process.cwd(), envFile) })

const MERCHANT_DATA = {
  _id: '5ffc242e-b32e-4512-ba97-84ee091209be',
  firstName: 'TechStore',
  lastName: 'Colombia',
  email: 'merchant@techstore.co',
  password: 'Merchant123!',
  role: 'merchant',
  logo: '🏪',
  isBlocked: false,
  verification: {
    email: true,
  },
}

const UserSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.UUID, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    logo: { type: String },
    isBlocked: { type: Boolean, default: false },
    verification: {
      email: { type: Boolean, default: false },
    },
  },
  { versionKey: false, timestamps: true, collection: 'users' },
)

async function seedMerchant() {
  const dbUri = process.env.DB_MONGO

  if (!dbUri) {
    console.error('❌ DB_MONGO environment variable is not set')
    process.exit(1)
  }

  console.log(`🔗 Connecting to MongoDB...`)

  try {
    await mongoose.connect(dbUri)
    console.log('✅ Connected to MongoDB')

    const User = mongoose.model('User', UserSchema)

    // Check if merchant already exists
    const existingMerchant = await User.findById(MERCHANT_DATA._id)

    if (existingMerchant) {
      console.log('ℹ️  Merchant already exists:')
      console.log(`   ID: ${existingMerchant._id}`)
      console.log(`   Name: ${existingMerchant.firstName} ${existingMerchant.lastName}`)
      console.log(`   Email: ${existingMerchant.email}`)
    } else {
      // Hash password
      const salt = genSaltSync()
      const hashedPassword = hashSync(MERCHANT_DATA.password, salt)

      const merchant = new User({
        ...MERCHANT_DATA,
        password: hashedPassword,
      })

      await merchant.save()

      console.log('✅ Merchant created successfully:')
      console.log(`   ID: ${MERCHANT_DATA._id}`)
      console.log(`   Name: ${MERCHANT_DATA.firstName} ${MERCHANT_DATA.lastName}`)
      console.log(`   Email: ${MERCHANT_DATA.email}`)
      console.log(`   Password: ${MERCHANT_DATA.password}`)
      console.log(`   Logo: ${MERCHANT_DATA.logo}`)
    }
  } catch (error) {
    console.error('❌ Error seeding merchant:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

seedMerchant()
