import { Module } from '@nestjs/common';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [GoogleStrategy],
  exports: [GoogleStrategy],
})
export class AuthStrategyModule {}
