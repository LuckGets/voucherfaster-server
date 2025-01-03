import { Module } from '@nestjs/common';
import { IsValidIdentifierValidator } from './IsValidIdentifier';
import { MatcherValidator } from './Match';
import { NotMatchValidator } from './NotMatch';
import { IsEnumValueValidator } from './IsEnum';
import { IsFutureDateValidator } from './IsFutureDate';
import { IsInstanceOfClassValidator } from './IsInstaceOfClass';
import { IsDateGreaterThanValidator } from './IsDateGreaterThan';

@Module({
  providers: [
    IsValidIdentifierValidator,
    MatcherValidator,
    NotMatchValidator,
    IsEnumValueValidator,
    IsFutureDateValidator,
    IsInstanceOfClassValidator,
    IsDateGreaterThanValidator,
  ],
  exports: [
    IsValidIdentifierValidator,
    MatcherValidator,
    NotMatchValidator,
    IsEnumValueValidator,
    IsFutureDateValidator,
    IsInstanceOfClassValidator,
    IsDateGreaterThanValidator,
  ],
})
export class CustomValidatorModule {}
