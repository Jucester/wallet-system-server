import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'

import { UserEntity } from '../../domain/entities/user.domain'
import { UpdateUserDto } from '../../domain/dto/update-user.dto'
import { UserResDto } from '../../domain/dto/user.dto'
import { UtilsSharedService } from '../../../shared/application/services/utils-shared.service'
import { CreateUserDto } from '../../domain/dto/create-user.dto'
import { UsersRepositoryDomain } from '../../domain/repository/users.repository.domain'
import { QueryPaginationDto } from '../../../shared/domain/dto/query-pagination.dto'

@Injectable()
export class UsersService {
  constructor(
    private readonly _usersRepository: UsersRepositoryDomain,
    private readonly _utilsSharedService: UtilsSharedService,
  ) {}

  async find(arg: { queryPagination: QueryPaginationDto }) {
    const { queryPagination } = arg
    const [result, err] = await this._usersRepository.base.findPaginate({
      options: {
        ...queryPagination,
      },
    })

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    result.data = plainToInstance(UserResDto, result.data)

    return result
  }

  async findCustom(arg: { queryPagination: QueryPaginationDto; quickSearch?: string }) {
    const { queryPagination, quickSearch } = arg
    const [result, err] = await this._usersRepository.findPaginationCustom({
      quickSearch,
      queryPagination,
    })

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    result.data = plainToInstance(UserResDto, result.data)
    return result
  }

  async create(body: CreateUserDto) {
    const [userIdFound, errFoundUser] = await this._usersRepository.base.findById(body._id)

    this._utilsSharedService.checkErrDatabaseThrowErr({ err: errFoundUser })
    this._utilsSharedService.checkErrIdAlReadyFoundThrowErr({ result: userIdFound })

    const [userEmailFound] = await this._usersRepository.base.findOne({ email: body.email })

    this._utilsSharedService.checkErrFieldAlReadyFoundThrowErr({ result: userEmailFound, field: 'email' })

    const userDomain = plainToInstance(UserEntity, body)
    const [result, err] = await this._usersRepository.base.create(userDomain)

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })

    return plainToInstance(UserResDto, result)
  }

  async findById(id: string) {
    const [result, err] = await this._usersRepository.base.findById(id)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result })

    return plainToInstance(UserResDto, result)
  }

  async updateById(id: string, body: UpdateUserDto) {
    await this.findById(id)
    const [userEmailFound] = await this._usersRepository.base.findOneExceptById(id, { email: body.email })

    this._utilsSharedService.checkErrFieldAlReadyFoundThrowErr({ result: userEmailFound, field: 'email' })

    const userDomain = plainToInstance(UserEntity, body)
    const [result, err] = await this._usersRepository.base.updateById(id, userDomain)

    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result })

    return plainToInstance(UserResDto, result)
  }

  async deleteById(id: string) {
    await this.findById(id)
    const [result, err] = await this._usersRepository.base.deleteById(id)
    this._utilsSharedService.checkErrDatabaseThrowErr({ err })
    this._utilsSharedService.checkErrIdNotFoundThrowErr({ result })
    return plainToInstance(UserResDto, result)
  }
}
