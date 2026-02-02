// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersController } from './users.controller';
// import { UsersService } from '../services/users.service';
// import { ImplUsersRepository } from '../../infrastructure/mongoose/repositories/impl-users.repository';
// import { UserEntity } from '../../domain/entities/user.interface';
// import { UserRoles } from '../../domain/entities/user-roles.interface';
// import { CreateUserDto } from '../dto/create-user.dto';
// import { Schema, Types } from 'mongoose';

// const { ObjectId } = Types;

// jest.mock('../../domain/services/users.service');
// jest.mock('../../infrastructure/mongoose/repositories/impl-users.repository');

// describe('UsersController', () => {
//   let controller: UsersController;
//   let service: UsersService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [UsersController],
//       providers: [UsersService, ImplUsersRepository],
//     }).compile();

//     controller = module.get(UsersController);
//     service = module.get(UsersService);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   describe('all', () => {
//     it('should return an array of users', async () => {
//       const mock: UserEntity[] = [
//         {
//           _id: '1',
//           firstName: 'test',
//           lastName: 'test',
//           email: 'test',
//           password: 'test',
//           isBlocked: false,
//           role: UserRoles.Member,
//         },
//         {
//           _id: '2',
//           firstName: 'test',
//           lastName: 'test',
//           email: 'test',
//           password: 'test',
//           isBlocked: false,
//           role: UserRoles.Member,
//         },
//       ];

//       jest.spyOn(service, 'find').mockImplementation(() => Promise.resolve(mock));
//       expect(await controller.all()).toBe(mock);
//     });
//   });

//   describe('create', () => {
//     it('should create a new user', async () => {
//       const createUserDto: CreateUserDto = {
//         firstName: 'test',
//         lastName: 'test',
//         email: 'test',
//         password: 'test',
//         role: UserRoles.Member,
//       };

//       const createdUser: UserEntity = {
//         _id: new ObjectId(),
//         ...createUserDto,
//         role: UserRoles.Member,
//         isBlocked: false,
//       };

//       jest.spyOn(service, 'create').mockImplementation(() =>
//         Promise.resolve({
//           message: 'Created successfully.',
//           data: createdUser,
//         }),
//       );

//       const result = await controller.create(createUserDto);

//       expect(result.data).toBe(createdUser);
//       expect(result.message).toBe('Created successfully.');
//     });
//   });

//   describe('findById', () => {
//     it('should find a user by id', async () => {
//       const id = new Schema.Types.ObjectId('605090f20e342f9c0a8db4c3');
//       const result: UserEntity = {
//         _id: id,
//         firstName: 'test',
//         lastName: 'test',
//         email: 'test',
//         password: 'test',
//         role: UserRoles.Member,
//         isBlocked: false,
//       };
//       jest.spyOn(service, 'findOneById').mockImplementation(() => Promise.resolve(result));
//       expect(await controller.findById(id)).toBe(result);
//     });

// it('should handle the case where user is not found', async () => {
//   const id = new Schema.Types.ObjectId('605090f20e342f9c0a8db4c3');
//   jest
//     .spyOn(service, 'findOneById')
//     .mockImplementation(() =>
//       Promise.reject(new NotFoundException('Resource not found')),
//     );
//   const result = await controller.findById(id);
//
//   console.log('result', result);
//   // expect().toEqual({
//   //   error: 'User not found',
//   // });
// });
// describe('updateById', () => {
//     it('should update a user by id', async () => {
//         const id = new ObjectId('605090f20e342f9c0a8db4c3');
//         const updateUserDto: UpdateUserDto = {name: 'Jane'};
//         const result = {id: id.toHexString(), ...updateUserDto};
//         jest.spyOn(service, 'updateOneById').mockImplementation(() => Promise.resolve(result));
//         expect(await controller.updateById(id, updateUserDto)).toBe(result);
//     });
//
//     it('should handle the case where user is not found', async () => {
//         const id = new ObjectId('605090f20e342f9c0a8db4c3');
//         const updateUserDto: UpdateUserDto = {name: 'Jane'};
//         jest.spyOn(service, 'updateOneById').mockImplementation(() => Promise.resolve(null));
//         expect(await controller.updateById(id, updateUserDto)).toEqual({error: 'User not found'});
//     });
// });

// describe('removeById', () => {
//     it('should remove a user by id', async () => {
//         const id = new ObjectId('605090f20e342f9c0a8db4c3');
//         const result = {success: true};
//         jest.spyOn(service, 'deleteOneById').mockImplementation(() => Promise.resolve(result));
//         expect(await controller.removeById(id)).toBe(result);
//     });
//
//     //
//     // it('should ensure the JwtAuthGuard is applied to the UsersController', async () => {
//     //     const guards = Reflect.getMetadata('__guards__', UsersController);
//     //     const guard = new guards[0]();
//     //     expect(guard).toBeInstanceOf(JwtAuthGuard);
//     // });
// });
//   });
// });
