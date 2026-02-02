// import { Inject, Injectable } from '@nestjs/common'
// import * as faker from 'faker'
// import { Command, Positional } from 'nestjs-command'
// import { UserEntity } from '../../../domain/entities/user.domain'
// import { UserRoles } from '../../../domain/entities/user-roles.interface'
// import { UsersRepository } from '../../../../auth/domain/repositories/users.repository'

// @Injectable()
// export class UserSeeder {
//   constructor(private readonly _repository: UsersRepository) {}

//   // how to run? npm run seed <command> <...args>
//   @Command({
//     command: 'create:users <quantity>',
//     describe: 'create a number of users',
//   })
//   async createUsers(
//     @Positional({
//       name: 'quantity',
//       describe: 'quantity number of users to create',
//       type: 'number',
//     })
//     quantity: number,
//   ) {
//     console.log('Running user seeder')
//     const users: Array<Partial<UserEntity>> = []
//     for (let i = 0; i < quantity; i++) {
//       users.push({
//         firstName: faker.name.firstName(),
//         lastName: faker.name.lastName(),
//         email: faker.internet.email(),
//         password: faker.animal.dog() + Math.round(Math.random() * 10000),
//         role: UserRoles.Member,
//         verification: {
//           email: true,
//         },
//       })
//     }
//     const promises = users.map((user) => this._repository.create(user))
//     await Promise.all(promises)

//     console.log('Seeder complete!')
//     process.exit()
//   }
// }
