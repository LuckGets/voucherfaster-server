import { Injectable } from '@nestjs/common';
import { v7 as uuid, UUIDTypes } from 'uuid';

@Injectable()
export class UUIDService {
  constructor() {}

  public make(): UUIDTypes {
    return String(uuid());
  }
}
