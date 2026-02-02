import { CanActivate, ExecutionContext, Logger, mixin, UnauthorizedException } from '@nestjs/common'

import { UserRoles } from '../../../../users/domain/entities/user-roles.interface'

export const RoleGuard = (roles: UserRoles[]): any => {
  class RolesGuardMixin implements CanActivate {
    private readonly logger = new Logger('RoleGuard')

    canActivate(context: ExecutionContext): any {
      const request = context.switchToHttp().getRequest()
      const user = request.user
      const hasPermission = roles.includes(user.role)

      if (!hasPermission) {
        this.logger.log(`user: ${user.username} has not access to this resource`)
        throw new UnauthorizedException({
          message: 'user has not access to this resource',
        })
      }

      return true
    }
  }
  return mixin(RolesGuardMixin)
}
