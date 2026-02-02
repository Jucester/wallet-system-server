// import {
//   TestDocument,
//   TestEntity,
//   TestRepository,
// } from '../repository/impl-mongoose-crud.repository.spec';
// import { Test, TestingModule } from '@nestjs/testing';
// import { ImplMongooseCRUDService } from './impl-mongoose-crud.service';
// import { Schema, Types } from 'mongoose';
// import { InternalServerErrorException } from '@nestjs/common';

// export class TestService extends ImplMongooseCRUDService<
//   TestEntity,
//   TestDocument
// > {
//   constructor(_repository: TestRepository) {
//     super(_repository);
//   }
// }

// describe('ImplMongooseCrudService', () => {
//   let repository: TestRepository;
//   let service: TestService;

//   beforeAll(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         {
//           provide: TestRepository,
//           useValue: {
//             create: jest.fn(),
//             find: jest.fn(),
//             findOne: jest.fn(),
//           },
//         },
//         TestService,
//       ],
//     }).compile();

//     repository = module.get<TestRepository>(TestRepository);
//     service = module.get<TestService>(TestService);
//     service['_repository'] = repository;
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should be defined', () => {
//     expect(repository).toBeDefined();
//     expect(service).toBeDefined();
//   });

//   describe('create', () => {
//     it('should create a new document', async () => {
//       // Arrange
//       const document: TestEntity = {
//         name: 'Test',
//       };

//       const createdDocument: TestEntity = {
//         _id: new Types.ObjectId(),
//         ...document,
//       };

//       jest
//         .spyOn(repository, 'create')
//         .mockReturnValueOnce(Promise.resolve([createdDocument, null]));

//       // Act
//       const result = await service.create(document);

//       expect(result).toHaveProperty('message');
//       expect(result).toHaveProperty('data');
//       expect(result.message).toEqual('Created successfully.');
//     });

//     it('should handle an error', async () => {
//       // Arrange
//       const document: TestEntity = {
//         name: 'Test',
//       };

//       jest
//         .spyOn(repository, 'create')
//         .mockReturnValueOnce(Promise.resolve([null, {}]));

//       // Act
//       await expect(service.create(document)).rejects.toThrowError(
//         InternalServerErrorException,
//       );
//     });
//   });

//   describe('find', () => {
//     it('should find documents', async () => {
//       // Arrange
//       const documents: TestEntity[] = [
//         {
//           _id: new Types.ObjectId(),
//           name: 'Test 1',
//         },
//         {
//           _id: new Types.ObjectId(),
//           name: 'Test 2',
//         },
//       ];

//       jest
//         .spyOn(repository, 'find')
//         .mockReturnValueOnce(Promise.resolve([documents, null]));

//       // Act
//       const result = await service.find({});

//       expect(result).toEqual(documents);
//     });

//     it('should handle an error', async () => {
//       // Arrange
//       const document: TestEntity = {
//         name: 'Test',
//       };

//       jest
//         .spyOn(repository, 'find')
//         .mockReturnValueOnce(Promise.resolve([null, {}]));

//       // Act
//       await expect(service.find(document)).rejects.toThrowError(
//         InternalServerErrorException,
//       );
//     });
//   });

//   describe('findOne', () => {
//     it('should find document', async () => {
//       // Arrange
//       const documents: TestEntity[] = [
//         {
//           _id: new Types.ObjectId(),
//           name: 'Test 1',
//         },
//         {
//           _id: new Types.ObjectId(),
//           name: 'Test 2',
//         },
//       ];

//       jest
//         .spyOn(repository, 'findOne')
//         .mockReturnValueOnce(Promise.resolve([documents[0], null]));

//       // Act
//       const result = await service.findOne({});

//       expect(result).toEqual(documents[0]);
//     });

//     it('should handle an error', async () => {
//       // Arrange
//       const document: TestEntity = {
//         name: 'Test',
//       };

//       jest
//         .spyOn(repository, 'find')
//         .mockReturnValueOnce(Promise.resolve([null, {}]));

//       // Act
//       await expect(service.find(document)).rejects.toThrowError(
//         InternalServerErrorException,
//       );
//     });
//   });

//   describe('findOneById', () => {
//     it('should find document', async () => {
//       // Arrange
//       const documents: TestEntity[] = [
//         {
//           _id: new Types.ObjectId(),
//           name: 'Test 1',
//         },
//         {
//           _id: new Types.ObjectId(),
//           name: 'Test 2',
//         },
//       ];

//       jest
//         .spyOn(repository, 'findOneById')
//         .mockReturnValueOnce(Promise.resolve([documents[0], null]));

//       // Act
//       // const result = await service.findOneById({});
//       // expect(result).toEqual(documents[0]);
//     });

//     it('should handle an error', async () => {
//       // Arrange
//       jest
//         .spyOn(repository, 'findOneById')
//         .mockReturnValueOnce(Promise.resolve([null, {}]));

//       // Act
//       await expect(
//         service.findOneById(new Types.ObjectId()),
//       ).rejects.toThrowError(InternalServerErrorException);
//     });
//   });
// });
