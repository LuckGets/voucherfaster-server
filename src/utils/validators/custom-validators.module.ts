import { Module } from '@nestjs/common';
import { IsValidIdentifierValidator } from './IsValidIdentifier';
import { MatcherValidator } from './Match';

@Module({
  providers: [IsValidIdentifierValidator, MatcherValidator],
  exports: [IsValidIdentifierValidator, MatcherValidator],
})
export class CustomValidatorModule {}
