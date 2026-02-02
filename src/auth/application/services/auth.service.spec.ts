// import { JwtService } from '@nestjs/jwt';
// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthService } from './auth.service';
// import { ConfigService } from '@nestjs/config';
// import {
//     InternalServerErrorException,
//     NotFoundException,
// } from '@nestjs/common';
// import {UsersRepository} from "../repositories/users.repository";
//
// jest.mock(
//     '../../../users/infrastructure/mongoose/repositories/users.repository',
// );
// jest.mock(
//     '../../../auth/infrastructure/mongoose/repositories/unique-token.repository',
// );
// jest.mock('@framework/jwt');
// jest.mock('@framework/config');
//
// describe('AuthService', () => {
//     let authService: AuthService;
//     let usersRepository: UsersRepository;
//     let jwtService: JwtService;
//     // let emailsService: EmailsService;
//     // let uniqueTokenService: UniqueTokenService;
//     // let uniqueTokenRepository: UniqueTokenRepository;
//
//     beforeAll(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             providers: [
//                 AuthService,
//                 {
//                     provide: UsersRepository,
//                     useClass:
//                 },
//                 JwtService,
//                 ConfigService,
//             ],
//         }).compile();
//
//         authService = module.get(AuthService);
//         usersRepository = module.get(UsersRepository);
//         jwtService = module.get(JwtService);
//
//         jest.clearAllMocks();
//     });
//
//     it('AuthService should be defined', () => {
//         expect(authService).toBeDefined();
//     });
//
//     it('UsersRepository should be defined', () => {
//         expect(usersRepository).toBeDefined();
//     });
//
//     it('JwtService should be defined', () => {
//         expect(jwtService).toBeDefined();
//     });
//
//     it('UsersRepository.create must be called in register', () => {
//         const loginDto = {
//             firstName: '',
//             lastName: '',
//             email: '',
//             password: '',
//             confirmPassword: '',
//         };
//
//         authService
//             .register(loginDto)
//             .then()
//             .catch((err) => err);
//
//         expect(usersRepository.create).toHaveBeenCalledWith(loginDto);
//     });
//
//     it('UsersRepository.create must be called in register', async () => {
//         const loginDto = {
//             firstName: '',
//             lastName: '',
//             email: '',
//             password: '',
//             confirmPassword: '',
//         };
//
//         jest.spyOn(jwtService, 'sign').mockReturnValueOnce('test token');
//         jest
//             .spyOn(usersRepository, 'create')
//             .mockReturnValueOnce(Promise.resolve([{}, null]));
//
//         const response = await authService.register(loginDto);
//
//         expect(usersRepository.create).toHaveBeenCalledWith(loginDto);
//         expect(response.message).toEqual('Registered successfully.');
//         expect(response.token).toBeDefined();
//         expect(response.user).toBeDefined();
//     });
//
//     it('UsersRepository.findOne must be called in login', () => {
//         const registerDto = {
//             email: '',
//             password: '',
//         };
//
//         authService
//             .login(registerDto)
//             .then()
//             .catch((err) => err);
//
//         expect(usersRepository.findOne).toHaveBeenCalledWith({
//             email: registerDto.email,
//         });
//     });
//
//     it('UsersRepository.findOne must be called in forgotPassword', () => {
//         const forgotPassword = { email: 'fake@email.co' };
//
//         authService
//             .forgotPassword(forgotPassword)
//             .then()
//             .catch((err) => err);
//
//         expect(usersRepository.findOne).toHaveBeenCalledWith(forgotPassword);
//     });
//
//     it('JwtService.verify must be called in restorePassword', () => {
//         const restorePasswordDto = {
//             password: '',
//             confirmPassword: '',
//         };
//         const token = 'token';
//
//         authService
//             .restorePassword(token, restorePasswordDto)
//             .then()
//             .catch((err) => err);
//
//         expect(jwtService.verify).toHaveBeenCalledWith(token);
//     });
//
//     it('UsersRepository.findOne must be called in forgotPassword', async () => {
//         const emailDto = { email: '' };
//
//         jest
//             .spyOn(usersRepository, 'findOne')
//             .mockReturnValueOnce(Promise.resolve([null, null]));
//
//         await expect(authService.forgotPassword(emailDto)).rejects.toThrowError(
//             NotFoundException,
//         );
//
//         expect(usersRepository.findOne).toHaveBeenCalledWith(emailDto);
//     });
//
//     it('UsersRepository.findOne must be called in forgotPassword', async () => {
//         const emailDto = { email: '' };
//
//         jest
//             .spyOn(usersRepository, 'findOne')
//             .mockReturnValueOnce(Promise.resolve([null, {}]));
//
//         await expect(authService.forgotPassword(emailDto)).rejects.toThrowError(
//             InternalServerErrorException,
//         );
//
//         expect(usersRepository.findOne).toHaveBeenCalledWith(emailDto);
//     });
//
//     // it('UsersRepository.findOne must be called in forgotPassword', async () => {
//     //   const emailDto = { email: '' };
//     //   const userData = {
//     //     _id: 'id',
//     //     email: '',
//     //     fullName: 'test',
//     //   };
//     //
//     //   jest
//     //     .spyOn(usersRepository, 'findOne')
//     //     .mockReturnValueOnce(Promise.resolve([userData, {}]));
//     //
//     //   jest.spyOn(emailsService, 'basic').mockReturnValueOnce(Promise.resolve());
//     //
//     //   jest.spyOn(jwtService, 'sign').mockReturnValueOnce('token');
//     //
//     //   const response = authService.forgotPassword(emailDto);
//     //
//     //   expect(usersRepository.findOne).toHaveBeenCalledWith(emailDto);
//     //   expect(authService.sendRegistrationEmail).toHaveBeenCalledWith(
//     //     emailDto.email,
//     //     userData.fullName,
//     //   );
//     //
//     //   console.log('response', response);
//     // });
// });
