import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { PaymentsService } from './application/services/payments.service'
import { OtpService } from './application/services/otp.service'
import { TransactionsService } from './application/services/transactions.service'
import { PaymentsController } from './infrastructure/nestjs/controllers/payments.controller'
import { PaymentSessionSchemaMongoose } from './infrastructure/mongoose/schemas/payment-session.schema.mongoose'
import { TransactionSchemaMongoose } from './infrastructure/mongoose/schemas/transaction.schema.mongoose'
import { PaymentSessionsRepositoryMongoose } from './infrastructure/mongoose/repositories/payment-sessions.repository.mongoose'
import { TransactionsRepositoryMongoose } from './infrastructure/mongoose/repositories/transactions.repository.mongoose'
import { PaymentSessionsRepositoryDomain } from './domain/repository/payment-sessions.repository.domain'
import { TransactionsRepositoryDomain } from './domain/repository/transactions.repository.domain'
import { UtilsSharedService } from '../shared/application/services/utils-shared.service'
import { CustomersModule } from '../customers/customers.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PaymentSession', schema: PaymentSessionSchemaMongoose },
      { name: 'Transaction', schema: TransactionSchemaMongoose },
    ]),
    forwardRef(() => CustomersModule),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    OtpService,
    TransactionsService,
    {
      provide: PaymentSessionsRepositoryDomain,
      useClass: PaymentSessionsRepositoryMongoose,
    },
    {
      provide: TransactionsRepositoryDomain,
      useClass: TransactionsRepositoryMongoose,
    },
    UtilsSharedService,
  ],
  exports: [
    PaymentsService,
    TransactionsService,
    {
      provide: TransactionsRepositoryDomain,
      useClass: TransactionsRepositoryMongoose,
    },
  ],
})
export class PaymentsModule {}
