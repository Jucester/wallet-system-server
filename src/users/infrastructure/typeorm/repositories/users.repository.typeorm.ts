// import { Injectable } from '@nestjs/common'

// import { UserEntity } from '../../../domain/entities/user.domain'

// import { UsersRepositoryDomain } from '../../../domain/repository/users.repository.domain'
// import { GenericRepositoryTypeOrm } from '../../../../shared/infrastructure/typeorm/repositories/generic.repository.typeorm'
// import { UserSchemaTypeOrm } from '../schemas/user.schema.typeorm'
// import { Repository } from 'typeorm'
// import { InjectRepository } from '@nestjs/typeorm'

// @Injectable()
// export class UsersRepositoryTypeOrm implements UsersRepositoryDomain {
//   base: GenericRepositoryTypeOrm<[UserEntity, Repository<UserSchemaTypeOrm>]>

//   constructor(@InjectRepository(UserSchemaTypeOrm) private readonly _model: Repository<UserSchemaTypeOrm>) {
//     this.base = new GenericRepositoryTypeOrm<[UserEntity, Repository<UserSchemaTypeOrm>]>(_model as any, UserEntity)
//   }
// }
