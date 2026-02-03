// import { Test, TestingModule } from '@nestjs/testing'
// import { ConfigService } from '@nestjs/config'
// import { EmailService } from './email.service'
// import { email } from '../../../../test/mocks/email.mock'

// const TransportInstance = {
//   sendMail: jest.fn().mockImplementation((params, callback) => {
//     callback()
//   }),
// }

// jest.mock('nodemailer', () => {
//   return { createTransport: jest.fn(() => TransportInstance) }
// })

// describe('EmailService', () => {
//   let service: EmailService

//   expect(true).toBeTruthy()
/*  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[ConfigService],
      providers: [
        EmailService, ConfigService
      ],
    }).compile();

    service = module.get(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined emailService sendMail', () => {
    expect(service.sendMail).toBeDefined();
  });

  it('should be defined emailService transport', () => {
    expect(service.transport).toBeDefined();
  });

  it('should be defined emailService generateEmailTemplate', () => {
    expect(service.generateEmailTemplate).toBeDefined();
  });

  it('should be return true emailService sendMail', async () => {
    const result = await service.sendMail(
      email.subject,
      email.emailAddress,
      email.templateData,
    );
    expect(result).toBe(true);
  });*/
// })
