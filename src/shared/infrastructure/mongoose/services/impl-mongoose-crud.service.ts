// import { AnyKeys, FilterQuery, ObjectId } from 'mongoose'
// import { InternalServerErrorException, NotFoundException } from '@nestjs/common'
// import { MongooseCrudService } from '../../../application/services/mongoose-crud.service.interface'
// import { ImplMongooseCRUDRepository } from '../repository/impl-mongoose-crud.repository'
// import { BodyResponse } from '../../../application/services/body-response.interface'
// import { SoftDeleteDocument } from '../plugins/soft-delete.plugin'
// import { GeneralEntity } from '../../../domain/entities/general.entity'

// export abstract class ImplMongooseCRUDService<Entity extends GeneralEntity, Document extends SoftDeleteDocument>
//   implements MongooseCrudService<Entity, Document>
// {
//   protected constructor(protected _repository: ImplMongooseCRUDRepository<Entity, Document>) {}

//   async create(document: AnyKeys<Entity>): Promise<BodyResponse<Entity>> {
//     const [result, error] = await this._repository.create(document)
//     if (error) {
//       throw new InternalServerErrorException(error)
//     }

//     return {
//       message: 'Created successfully.',
//       data: <Entity>{
//         _id: result?._id,
//       },
//     }
//   }

//   async find(query?: FilterQuery<Document>): Promise<Entity[]> {
//     const [result, error] = await this._repository.find(query)
//     if (error) {
//       throw new InternalServerErrorException(error)
//     }

//     if (!result) {
//       throw new NotFoundException('Resource not found')
//     }

//     return result
//   }

//   async findOne(query?: FilterQuery<Document>): Promise<Entity> {
//     const [result, error] = await this._repository.findOne(query)
//     if (error) {
//       throw new InternalServerErrorException(error)
//     }

//     if (!result) {
//       throw new NotFoundException('Resource not found')
//     }

//     return result
//   }

//   async findOneById(id: ObjectId): Promise<Entity> {
//     const [result, error] = await this._repository.findOneById(id)
//     if (error) {
//       throw new InternalServerErrorException(error)
//     }

//     if (!result) {
//       throw new NotFoundException('Resource not found')
//     }

//     return result
//   }

//   async updateOneById(id: ObjectId, document: AnyKeys<Entity>): Promise<BodyResponse<Entity>> {
//     const [result, error] = await this._repository.updateOneById(id, document)
//     if (error) {
//       throw new InternalServerErrorException(error)
//     }

//     if (!result) {
//       throw new NotFoundException('Resource not found')
//     }

//     return {
//       message: 'Updated successfully.',
//     }
//   }

//   async deleteOneById(id: ObjectId): Promise<BodyResponse<Entity>> {
//     const [result, error] = await this._repository.deleteOneById(id)
//     if (error) {
//       throw new InternalServerErrorException(error)
//     }

//     if (!result) {
//       throw new NotFoundException('Resource not found')
//     }

//     return {
//       message: 'Deleted successfully.',
//     }
//   }
// }
