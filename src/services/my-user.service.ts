import { injectable, inject, BindingScope } from '@loopback/core';
import { UserService } from '@loopback/authentication';
import { User } from '../models';
import { Credentials, UserRepository } from '../repositories';
import { securityId, UserProfile } from '@loopback/security';
import { PasswordHasherBindings } from '../keys';
import { BcryptHasherService } from '.';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';



@injectable({ scope: BindingScope.TRANSIENT })
export class MyUserService implements UserService<User, Credentials>{
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasherService
  ) { }



  async verifyCredentials(credentials: Credentials): Promise<User> {
    // implement this method
    const foundUser = await this.userRepository.findOne({
      where: {
        email: credentials.email
      }
    });
    if (!foundUser) {
      throw new HttpErrors.NotFound('user not found');
    }
    const passwordMatched = await this.hasher.comparePassword(credentials.password, foundUser.password)
    if (!passwordMatched)
      throw new HttpErrors.Unauthorized('password is not valid');
    return foundUser;
  }
  convertToUserProfile(user: User): UserProfile {
    let userName = '';
    if (user.firstName)
      userName = user.firstName;
    if (user.lastName) {
      userName = user.firstName ? `${user.firstName} ${user.lastName}` : user.lastName;
    }
    return {
      [securityId]: user.id!.toString(),
      name: userName,
      id: user.id,
      email: user.email
    };
  }



}
