// import { Test, TestingModule } from '@nestjs/testing';
// import { mockRequest } from 'mock-req-res';
//
// import { AuthService } from '../../domain/services/auth.service';
// import { JwtAuthGuard } from '../../infrastructure/passport/guards/jwt-auth.guard';
//
// import { AuthController } from './auth.controller';
//
// jest.mock('../../domain/services/auth.service');
//
// let email: string;
// let password: string;
// let reqFake;
// let loginMockFn;
//
// beforeAll(() => {
//   email = 'santiago@gmail.com';
//   password = 'santiago';
//   reqFake = mockRequest();
// });
//
// afterAll(() => {
//   loginMockFn.mockReset();
// });
//
// describe('AuthController', () => {
//   let controller: AuthController;
//   let authService: AuthService;
//
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [AuthController],
//       providers: [AuthService],
//     }).compile();
//
//     controller = module.get(AuthController);
//     authService = module.get(AuthService);
//
//     loginMockFn = jest.spyOn(authService, 'login');
//     jest.clearAllMocks();
//   });
//
//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
//
//   it('should be call authService.login', () => {
//     const loginParams = { email, password };
//     controller.login(loginParams, reqFake);
//
//     expect(authService.login).toHaveBeenCalled();
//     expect(loginMockFn.mock.calls[0]).toEqual([loginParams, reqFake.ip]);
//   });
//
//   it('should be call authService.register', () => {
//     const registerParams = {
//       email,
//       password,
//       confirmPassword: password,
//       firstName: '',
//       lastName: '',
//     };
//     controller.register(registerParams);
//     expect(authService.register).toHaveBeenCalledWith(registerParams);
//   });
//
//   it('should be call authService.forgotPassword', () => {
//     const forgotPasswordParams = { email };
//     controller.forgotPassword(forgotPasswordParams);
//     expect(authService.forgotPassword).toHaveBeenCalledWith(
//       forgotPasswordParams,
//     );
//   });
//
//     it('AuthService.register must be called in register', () => {
//         const registerDto = {
//             firstName: user.firstName,
//             lastName: user.lastName,
//             email: user.email,
//             password: user.password,
//             confirmPassword: user.password,
//         };
//
//         authController.register(registerDto);
//         expect(authService.register).toHaveBeenCalledWith(registerDto);
//     });
//
//     it('AuthService.login must be called in login', () => {
//         const loginDto = {
//             email: user.email,
//             password: user.password,
//         };
//
//         authController.login(loginDto);
//         expect(authService.login).toHaveBeenCalledWith(loginDto);
//     });
//
//     it('Given AuthController when verifyToken is called the JwtAuthGuard is executed', () => {
//         const guards = Reflect.getMetadata(
//             '__guards__',
//             AuthController.prototype.verifyToken,
//         );
//
//         const guard = new guards[0]();
//         expect(guard).toBeInstanceOf(JwtAuthGuard);
//     });
//
//     it('Given AuthController when verifyToken is called with correct data throw ok response', () => {
//         const result = authController.verifyToken();
//         expect(result).toEqual({ token: 'OK' });
//     });
//
//     it('AuthService.forgotPassword must be called in forgotPassword', () => {
//         const forgotPasswordDto = { email: '' };
//         authController.forgotPassword(forgotPasswordDto);
//         expect(authService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
//     });
//
//     it('AuthService.restorePassword must be called in restorePassword', () => {
//         const restorePasswordDto = { password: '', confirmPassword: '' };
//         const token = '';
//         authController.restorePassword(token, restorePasswordDto);
//         expect(authService.restorePassword).toHaveBeenCalledWith(
//             token,
//             restorePasswordDto,
//         );
//     });
//
//   it('should be call authService.updatePassword', () => {
//     const updatePasswordParams = { password, confirmPassword: password };
//     const token = 'token_test';
//
//     controller.restorePassword(updatePasswordParams, token);
//     expect(authService.restorePassword).toHaveBeenCalledWith(
//       token,
//       updatePasswordParams,
//     );
//   });
//
//   it('should ensure the JwtAuthGuard is applied to the verifyToken method', async () => {
//     const guards = Reflect.getMetadata(
//       '__guards__',
//       AuthController.prototype.verifyToken,
//     );
//     const guard = new guards[0]();
//     expect(guard).toBeInstanceOf(JwtAuthGuard);
//   });
//
//   it('should ensure the JwtAuthGuard is applied to the updateEmail method', async () => {
//     const guards = Reflect.getMetadata(
//       '__guards__',
//       AuthController.prototype.updateEmail,
//     );
//     const guard = new guards[0]();
//     expect(guard).toBeInstanceOf(JwtAuthGuard);
//   });
//
//   it('should ensure the JwtAuthGuard is applied to the updatePassword method', async () => {
//     const guards = Reflect.getMetadata(
//       '__guards__',
//       AuthController.prototype.updatePassword,
//     );
//     const guard = new guards[0]();
//     expect(guard).toBeInstanceOf(JwtAuthGuard);
//   });
//
//   it('should ensure the JwtAuthGuard is applied to the updateMyInformation method', async () => {
//     const guards = Reflect.getMetadata(
//       '__guards__',
//       AuthController.prototype.updateMyInformation,
//     );
//     const guard = new guards[0]();
//     expect(guard).toBeInstanceOf(JwtAuthGuard);
//   });
// });
