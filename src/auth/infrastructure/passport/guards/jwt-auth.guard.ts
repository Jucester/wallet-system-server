import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/**
 * JwtAuthGuard is a class that extends from AuthGuard class of passport, this allows that if we
 * need to use only the JwtStrategy, we didn't need to specify the strategy to passport class
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
