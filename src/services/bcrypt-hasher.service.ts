import { injectable, inject, BindingScope } from '@loopback/core';
import { compare, genSalt, hash } from 'bcryptjs';
import { PasswordHasherBindings } from '../keys';


export interface PasswordHasher<T = string> {
  hashPassword(password: T): Promise<T>;
  comparePassword(providedPass: T, storedPass: T): Promise<boolean>
}

@injectable({ scope: BindingScope.TRANSIENT })
export class BcryptHasherService implements PasswordHasher<string>{
  constructor(/* Add @inject to inject parameters */) { }

  @inject(PasswordHasherBindings.ROUNDS)
  public readonly rounds: number


  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(this.rounds);
    return await hash(password, salt);
  }

  async comparePassword(providedPass: string, storedPass: string): Promise<boolean> {
    const passwordMatches = await compare(providedPass, storedPass);
    return passwordMatches;
  }


}
