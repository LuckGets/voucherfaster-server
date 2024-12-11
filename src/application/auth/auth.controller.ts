import { Controller } from '@nestjs/common';
import { AuthPath } from '../../config/api-path';

@Controller(AuthPath.Base)
export class AuthController {}
