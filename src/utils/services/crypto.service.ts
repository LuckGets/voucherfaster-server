import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  constructor() {}
  public hash(stringToHash: string, salt: number): Promise<string> {
    return bcrypt.hash(stringToHash, bcrypt.genSaltSync(salt));
  }
  public compare(
    stringToCompare: string,
    hashString: string,
  ): Promise<boolean> {
    return bcrypt.compare(stringToCompare, hashString);
  }
}
