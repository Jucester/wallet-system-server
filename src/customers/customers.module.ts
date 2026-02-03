import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CustomersService } from './application/services/customers.service'
import { WalletsService } from './application/services/wallets.service'
import { CustomersController } from './infrastructure/nestjs/controllers/customers.controller'
import { CustomerSchemaMongoose } from './infrastructure/mongoose/schemas/customer.schema.mongoose'
import { WalletSchemaMongoose } from './infrastructure/mongoose/schemas/wallet.schema.mongoose'
import { CustomersRepositoryMongoose } from './infrastructure/mongoose/repositories/customers.repository.mongoose'
import { WalletsRepositoryMongoose } from './infrastructure/mongoose/repositories/wallets.repository.mongoose'
import { CustomersRepositoryDomain } from './domain/repository/customers.repository.domain'
import { WalletsRepositoryDomain } from './domain/repository/wallets.repository.domain'
import { UtilsSharedService } from '../shared/application/services/utils-shared.service'
import { UsersModule } from '../users/users.module'
import { AuthModule } from '../auth/auth.module'
import { PaymentsModule } from '../payments/payments.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Customer', schema: CustomerSchemaMongoose },
      { name: 'Wallet', schema: WalletSchemaMongoose },
    ]),
    UsersModule,
    AuthModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    WalletsService,
    {
      provide: CustomersRepositoryDomain,
      useClass: CustomersRepositoryMongoose,
    },
    {
      provide: WalletsRepositoryDomain,
      useClass: WalletsRepositoryMongoose,
    },
    UtilsSharedService,
  ],
  exports: [
    CustomersService,
    WalletsService,
    {
      provide: CustomersRepositoryDomain,
      useClass: CustomersRepositoryMongoose,
    },
    {
      provide: WalletsRepositoryDomain,
      useClass: WalletsRepositoryMongoose,
    },
    MongooseModule,
  ],
})
export class CustomersModule { }
