import { injectable, /* inject, */ BindingScope } from '@loopback/core';
import { inject } from '@loopback/core';
import { TokenServiceBindings } from '../keys';
import { securityId, UserProfile } from '@loopback/security';
import { HttpErrors } from '@loopback/rest';
import { promisify } from 'util';
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

@injectable({ scope: BindingScope.TRANSIENT })
export class JwtService {


  @inject(TokenServiceBindings.TOKEN_SECRET)
  public readonly jwtSecret: string;

  @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
  public readonly expiresSecret: string;


  constructor(/* Add @inject to inject parameters */) { }


  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'Error while generating token :userProfile is null'
      )
    }
    let token = '';
    try {
      token = await signAsync(userProfile, this.jwtSecret, {
        expiresIn: this.expiresSecret
      });
      return token;
    } catch (err) {
      throw new HttpErrors.Unauthorized(
        `error generating token ${err}`
      )
    }
  }

  async verifyToken(token: string): Promise<UserProfile> {

    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token:'token' is null`
      )
    };

    let userProfile: UserProfile;
    try {
      const decryptedToken = await verifyAsync(token, this.jwtSecret);
      userProfile = Object.assign(
        { [securityId]: '', id: '', name: '' },
        { [securityId]: decryptedToken.id, id: decryptedToken.id, name: decryptedToken.name }
      );
    }
    catch (err) {
      throw new HttpErrors.Unauthorized(`Error verifying token:${err.message}`)
    }
    return userProfile;
  }


}
