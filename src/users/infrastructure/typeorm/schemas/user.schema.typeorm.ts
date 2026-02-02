import { Entity, Column, PrimaryColumn, Generated, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { genSaltSync, hashSync } from 'bcryptjs'
import { UserRoles } from '../../../domain/entities/user-roles.interface'
import { IUserEntity } from '../../../domain/entities/user.domain'

@Entity({ name: 'users' })
export class UserSchemaTypeOrm implements IUserEntity {
  @Generated('uuid')
  @PrimaryColumn()
  _id: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({ unique: true })
  email: string

  @Column({ default: false })
  isBlocked: boolean

  @Column({
    transformer: {
      to: (value: string): string => hashSync(value, genSaltSync()),
      from: (value: string): string => value,
    },
  })
  password: string

  @Column({
    type: 'enum',
    enum: UserRoles,
    default: UserRoles.User,
  })
  role: UserRoles

  @Column('simple-json', { default: JSON.stringify({ email: false }) })
  verification: { email: boolean }

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date
}
