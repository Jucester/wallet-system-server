// import { Test, TestingModule } from '@nestjs/testing';
//
// import { UsersRepository } from '../../infrastructure/mongoose/repositories/users.repository';
// import { AuthService } from '../../../auth/domain/services/auth.service';
//
// import { UsersService } from './users.service';
//
// jest.mock('../../../auth/domain/services/auth.service');
// jest.mock('../../infrastructure/mongoose/repositories/users.repository');
//
// describe('UsersService', () => {
//   let service: UsersService;
//   let repository: UsersRepository;
//
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [UsersService, UsersRepository, AuthService],
//     }).compile();
//
//     service = module.get<UsersService>(UsersService);
//     repository = module.get<UsersRepository>(UsersRepository);
//   });
//
//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
//
//   // it('should be call repository.findAll', () => {
//   //   service
//   //     .findAll({
//   //       limit: 0,
//   //       page: 1,
//   //       skip: 0,
//   //     })
//   //     .then()
//   //     .catch((err) => err);
//   //   expect(repository.findAll).toHaveBeenCalled();
//   // });
//
//   // it('should be call repository.findOneById', () => {
//   //   const id = 'id';
//   //   service
//   //     .findOneById(id)
//   //     .then()
//   //     .catch((err) => err);
//   //   expect(repository.findOneById).toHaveBeenCalledWith(id);
//   // });
//
//   it('should be call repository.create', () => {
//     const params = {
//       clientId: '',
//       email: '',
//       firstName: '',
//       lastName: '',
//       role: '',
//     };
//     service
//       .create(params)
//       .then()
//       .catch((err) => err);
//     expect(repository.create).toHaveBeenCalledWith(params);
//   });
//
//   it('should be call repository.updateOneById', () => {
//     const id = 'id';
//     const params = {
//       clientId: '',
//       email: '',
//       firstName: '',
//       lastName: '',
//       role: '',
//     };
//     // service
//     //   .updateOneById(id, params)
//     //   .then()
//     //   .catch((err) => err);
//     // expect(repository.updateOneById).toHaveBeenCalledWith(id, params);
//   });
//
//   it('should be call repository.removeOneById', () => {
//     const id = 'id';
//     // service
//     //   .removeOneById(id)
//     //   .then()
//     //   .catch((err) => err);
//     // expect(repository.removeOneById).toHaveBeenCalledWith(id);
//   });
// });
