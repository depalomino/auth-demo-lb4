// Uncomment these imports to begin using these cool features!

import { inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import { PasswordHasherBindings, TokenServiceBindings, UserServiceBindings } from '../keys';
import { Credentials, UserRepository } from '../repositories';
import { BcryptHasherService, validateCredentials } from '../services';
import { securityId, UserProfile } from '@loopback/security';
import { get, getJsonSchemaRef, post, requestBody } from '@loopback/rest';
import { MyUserService } from '../services/my-user.service';
import { User } from '../models';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { OPERATION_SECURITY_SPEC } from '../utils/security-specs';
import { JwtService } from '../services/jwt.service';
import _ from 'lodash';



export class UserController {
  constructor(

    @repository(UserRepository)
    public userRepository: UserRepository,

    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasherService,

    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,

    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JwtService,

  ) { }


  @post('/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          schema: getJsonSchemaRef(User) //TODO: modificar respuesta
        }
      }
    }
  })
  async signup(@requestBody() userData: User) {
    validateCredentials(_.pick(userData, ['email', 'password']));
    userData.password = await this.hasher.hashPassword(userData.password)
    const savedUser = await this.userRepository.create(userData);
    delete savedUser.password; //TODO: modificar respuesta
    return savedUser;
  }



  @post('/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  })
  async login(
    @requestBody() credentials: Credentials,
  ): Promise<{ token: string }> {
    // make sure user exist,password should be valid
    const user = await this.userService.verifyCredentials(credentials);
    // console.log(user);
    const userProfile = await this.userService.convertToUserProfile(user);
    // console.log(userProfile);

    const token = await this.jwtService.generateToken(userProfile);
    return Promise.resolve({ token: token })
  }


  @authenticate("jwt")
  @get('/users/me', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: getJsonSchemaRef(User),
          },
        },
      },
    },
  })
  async me(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
  ): Promise<UserProfile> {
    return Promise.resolve(currentUser);
  }


}
