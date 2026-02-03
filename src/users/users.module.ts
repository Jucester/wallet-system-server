import { Module } from '@nestjs/common'

import { UsersService } from './application/services/users.service'
import { UsersController } from './infrastructure/nestjs/controllers/users.controller'
import { UtilsSharedService } from '../shared/application/services/utils-shared.service'
// import { TypeOrmModule } from '@nestjs/typeorm'
// import { UserSchemaTypeOrm } from './infrastructure/typeorm/schemas/user.schema.typeorm'
import { UserSchemaMongoose } from './infrastructure/mongoose/schemas/user.schema.mongoose'
import { MongooseModule } from '@nestjs/mongoose'
import { UsersRepositoryMongoose } from './infrastructure/mongoose/repositories/users.repository.mongoose'
import { UsersRepositoryDomain } from './domain/repository/users.repository.domain'
import { MerchantSeederService } from './infrastructure/mongoose/seeders/merchant-seeder.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchemaMongoose }]),
    // TypeOrmModule.forFeature([UserSchemaTypeOrm]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: UsersRepositoryDomain,
      // useClass: UsersRepositoryTypeOrm,
      useClass: UsersRepositoryMongoose,
    },
    UtilsSharedService,
    MerchantSeederService,
  ],

  exports: [
    UsersService,
    {
      provide: UsersRepositoryDomain,
      // useClass: UsersRepositoryTypeOrm,
      useClass: UsersRepositoryMongoose,
    },
    // TypeOrmModule,
    MongooseModule,
  ],
})
export class UsersModule {}
