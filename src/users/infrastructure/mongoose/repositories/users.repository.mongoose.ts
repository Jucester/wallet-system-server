import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { UserSchemaBaseMongoose } from '../schemas/user.schema.mongoose'
import { UserEntity } from '../../../domain/entities/user.domain'

import { Model } from 'mongoose'
import { UsersRepositoryDomain } from '../../../domain/repository/users.repository.domain'
import { GenericRepositoryMongoose } from '../../../../shared/infrastructure/mongoose/repositories/generic.repository.mongoose'
import { QueryPaginationDto } from '../../../../shared/domain/dto/query-pagination.dto'
import { IReturnDomain } from '../../../../shared/domain/entities/return-domain'
import {
  PaginateResultDomain,
  OptionsRepositoryDomain,
} from '../../../../shared/domain/repository/generic.repository.domain'

@Injectable()
export class UsersRepositoryMongoose implements UsersRepositoryDomain {
  base: GenericRepositoryMongoose<[UserEntity, Model<UserSchemaBaseMongoose>]>

  constructor(@InjectModel('User') private readonly _model: Model<UserSchemaBaseMongoose>) {
    this.base = new GenericRepositoryMongoose<[UserEntity, Model<UserSchemaBaseMongoose>]>(_model as any, UserEntity)
  }

  async findPaginationCustom<K = UserEntity>(arg: {
    quickSearch?: string
    queryPagination?: QueryPaginationDto
  }): Promise<IReturnDomain<PaginateResultDomain<K>, Error>> {
    const { quickSearch, queryPagination } = arg
    const pipeline = []

    if (quickSearch) {
      pipeline.push({
        $match: {
          email: { $regex: new RegExp(quickSearch, 'i') },
        },
      })
    }

    return this.base.rawQueryPaginate({ pipeline, options: new OptionsRepositoryDomain(queryPagination) })
  }
}

// example Custom query with relations
// Required (model) => domain mapperModelToDomain
// async usersJoinCityAndState() {
//   const populates = [
//     {
//       path: 'CityId',
//       select: ['name'],
//       populate: { path: 'StateId', select: ['name'] },
//     },
//   ]
//   const mapperModelToDomain = (e) => new UserEntityWithCityState(e)
//   return await this.base.run<UserEntityWithCityState>(() =>
//     this.base.findPaginate<UserEntityWithCityState>({ populates, mapperModelToDomain }),
//   )
// }

// example aggregate
// async customAggregate(): Promise<IReturnDomain<DataCustomDomain[], Error>> {
//   const pipeline = []
//   const [result, error] = await this.base.run(() => this._model.aggregate(pipeline) as any)
//   // apply mapperModelToDomainCustom
//   return [result, error]
// }

// class StateEntity {
//   name: string
//   constructor(data: any) {
//     this.name = data.name
//   }
// }

// class CityEntity {
//   name: string
//   state: StateEntity
//   constructor(data: any) {
//     this.name = data.name
//     this.state = new StateEntity(data.state)
//   }
// }

// class UserEntityWithCityState extends UserEntity {
//   city: CityEntity
//   constructor(data: any) {
//     super(data)
//     this.city = new CityEntity(data.city)
//   }
// }
