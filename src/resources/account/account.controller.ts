import { Controller } from '@nestjs/common';
import { AccountPath } from '../../config/api-path';

@Controller({ path: AccountPath.Base, version: '1' })
export class AccountController {}
