import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { UserEntity } from '../../../../users/domain/entities/user.domain'

export const AuthUser = createParamDecorator((data: keyof UserEntity | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user as UserEntity

    if (!user) {
        throw new UnauthorizedException('User not authenticated')
    }

    if (data) {
        return user[data]
    }

    return user
})
