import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthController } from './infrastructure/nestjs/controllers/auth.controller'
import { AuthService } from './application/services/auth.service'
import { JwtAuthGuard } from './infrastructure/passport/guards/jwt-auth.guard'
import { UsersModule } from '../users/users.module'
import { JwtStrategy } from './infrastructure/passport/strategies/jwt.strategy'
import { JwtSecurityService } from './application/services/jwt-security.service'
import { UsersRepositoryDomain } from '../users/domain/repository/users.repository.domain'
import { UtilsSharedService } from '../shared/application/services/utils-shared.service'
import { UsersRepositoryMongoose } from '../users/infrastructure/mongoose/repositories/users.repository.mongoose'

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: UsersRepositoryDomain,
      // useClass: UsersRepositoryTypeOrm,
      useClass: UsersRepositoryMongoose,
    },

    JwtSecurityService,
    JwtStrategy,
    JwtAuthGuard,
    UtilsSharedService,
  ],
  exports: [AuthService, JwtSecurityService],
})
export class AuthModule {}
