import { AnyKeys, FilterQuery, ObjectId } from 'mongoose'
import { BodyResponse } from './body-response.interface'

export interface MongooseCrudService<Entity, Document> {
  find(query?: FilterQuery<Document>): Promise<Entity[]>

  findOne(query?: FilterQuery<Document>): Promise<Entity>

  findOneById(id: ObjectId): Promise<Entity>

  create(document: AnyKeys<Entity>): Promise<BodyResponse<Entity>>

  updateOneById(id: ObjectId, document: AnyKeys<Entity>): Promise<BodyResponse<Entity>>

  deleteOneById(id: ObjectId): Promise<BodyResponse<Entity>>
}
