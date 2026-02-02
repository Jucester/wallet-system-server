import { IReturnDomain } from '../../../shared/domain/entities/return-domain'
import { IGenericRepository } from '../../../shared/domain/repository/generic.repository.domain'
import { CustomerEntity } from '../entities/customer.domain'

export abstract class CustomersRepositoryDomain {
  abstract base: IGenericRepository<[CustomerEntity]>

  abstract findByUserId(userId: string): Promise<IReturnDomain<CustomerEntity, Error>>

  abstract findByDocument(document: string): Promise<IReturnDomain<CustomerEntity, Error>>

  abstract findByPhone(phone: string): Promise<IReturnDomain<CustomerEntity, Error>>

  abstract findByDocumentAndPhone(document: string, phone: string): Promise<IReturnDomain<CustomerEntity, Error>>
}
