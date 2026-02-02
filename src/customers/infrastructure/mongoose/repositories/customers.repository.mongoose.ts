import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { CustomerSchemaBaseMongoose } from '../schemas/customer.schema.mongoose'
import { CustomerEntity } from '../../../domain/entities/customer.domain'
import { CustomersRepositoryDomain } from '../../../domain/repository/customers.repository.domain'
import { GenericRepositoryMongoose } from '../../../../shared/infrastructure/mongoose/repositories/generic.repository.mongoose'
import { IReturnDomain } from '../../../../shared/domain/entities/return-domain'

@Injectable()
export class CustomersRepositoryMongoose implements CustomersRepositoryDomain {
  base: GenericRepositoryMongoose<[CustomerEntity, Model<CustomerSchemaBaseMongoose>]>

  constructor(@InjectModel('Customer') private readonly _model: Model<CustomerSchemaBaseMongoose>) {
    this.base = new GenericRepositoryMongoose<[CustomerEntity, Model<CustomerSchemaBaseMongoose>]>(
      _model as any,
      CustomerEntity,
    )
  }

  async findByUserId(userId: string): Promise<IReturnDomain<CustomerEntity, Error>> {
    return this.base.findOne({ userId })
  }

  async findByDocument(document: string): Promise<IReturnDomain<CustomerEntity, Error>> {
    return this.base.findOne({ document })
  }

  async findByPhone(phone: string): Promise<IReturnDomain<CustomerEntity, Error>> {
    return this.base.findOne({ phone })
  }

  async findByDocumentAndPhone(document: string, phone: string): Promise<IReturnDomain<CustomerEntity, Error>> {
    return this.base.findOne({ document, phone })
  }
}
