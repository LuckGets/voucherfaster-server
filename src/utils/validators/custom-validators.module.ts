import { Module } from '@nestjs/common';
import { IsValidIdentifierValidator } from './IsValidIdentifier';
import { MatcherValidator } from './Match';
import { NotMatchValidator } from './NotMatch';
import { IsEnumValueValidator } from './IsEnum';

@Module({
  providers: [
    IsValidIdentifierValidator,
    MatcherValidator,
    NotMatchValidator,
    IsEnumValueValidator,
  ],
  exports: [
    IsValidIdentifierValidator,
    MatcherValidator,
    NotMatchValidator,
    IsEnumValueValidator,
  ],
})
export class CustomValidatorModule {}
