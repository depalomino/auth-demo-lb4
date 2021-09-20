import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {OnMemoryDataSource} from '../datasources';
import {User, UserRelations} from '../models';

export type Credentials = {
  email: string;
  password: string;
}


export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  constructor(
    @inject('datasources.OnMemory') dataSource: OnMemoryDataSource,
  ) {
    super(User, dataSource);
  }
}
