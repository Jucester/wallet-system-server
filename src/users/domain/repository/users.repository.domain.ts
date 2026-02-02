import { QueryPaginationDto } from '../../../shared/domain/dto/query-pagination.dto'
import { IReturnDomain } from '../../../shared/domain/entities/return-domain'
import { IGenericRepository, PaginateResultDomain } from '../../../shared/domain/repository/generic.repository.domain'
import { UserEntity } from '../entities/user.domain'

export abstract class UsersRepositoryDomain {
  abstract base: IGenericRepository<[UserEntity]>
  abstract findPaginationCustom<K = UserEntity>(arg: {
    quickSearch?: string
    queryPagination?: QueryPaginationDto
  }): Promise<IReturnDomain<PaginateResultDomain<K>, Error>>
}
