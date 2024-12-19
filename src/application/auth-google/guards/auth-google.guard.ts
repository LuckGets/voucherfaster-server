import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategyEnum } from '../../auth/types/strategy.type';

@Injectable()
export class GoogleAuthGuard extends AuthGuard(AuthStrategyEnum.Google) {}
