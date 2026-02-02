import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { validate } from './shared/domain/dto/environment.validator'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerMiddleware } from './shared/infrastructure/nestjs/middlewares/logger.middleware'
import { MongooseModule } from '@nestjs/mongoose'
import { SharedModule } from './shared/shared.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { CustomersModule } from './customers/customers.module'
import { PaymentsModule } from './payments/payments.module'
import { envLoader } from './shared/infrastructure/nestjs/env/env-loader'
// import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envLoader(),
      cache: true,
      validate,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('DB_MONGO'),
      }),
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     type: 'mysql',
    //     url: configService.get('DB_SQL'),
    //     autoLoadEntities: true,
    //     synchronize: true,
    //     // logging: 'all',
    //   }),
    // }),
    // CommandModule,
    SharedModule,
    UsersModule,
    AuthModule,
    CustomersModule,
    PaymentsModule,
  ],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
