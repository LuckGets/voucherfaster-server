import { Module } from '@nestjs/common';
import { IsValidIdentifierValidator } from './IsValidIdentifier';
import { MatcherValidator } from './Match';
import { NotMatchValidator } from './NotMatch';
import { IsEnumValueValidator } from './IsEnum';
import { IsFutureDateValidator } from './IsFutureDate';
import { IsInstanceOfClassValidator } from './IsInstaceOfClass';
import { IsDateGreaterThanValidator } from './IsDateGreaterThan';
import { IsArrayOfUUIDValidator } from './IsArrayOfUUID';
import { IsArrayOfClassValidator } from './IsArrayOfClass';
import { IsEmptyValueValidator } from './IsEmptyValue';
import { AtLeastOnePropertyConstraint } from './AtleastOneProp';

@Module({
  providers: [
    AtLeastOnePropertyConstraint,
    IsEmptyValueValidator,
    IsValidIdentifierValidator,
    MatcherValidator,
    NotMatchValidator,
    IsEnumValueValidator,
    IsFutureDateValidator,
    IsInstanceOfClassValidator,
    IsDateGreaterThanValidator,
    IsArrayOfUUIDValidator,
    IsArrayOfClassValidator,
  ],
  exports: [
    AtLeastOnePropertyConstraint,
    IsEmptyValueValidator,
    IsValidIdentifierValidator,
    MatcherValidator,
    NotMatchValidator,
    IsEnumValueValidator,
    IsFutureDateValidator,
    IsInstanceOfClassValidator,
    IsDateGreaterThanValidator,
    IsArrayOfUUIDValidator,
    IsArrayOfClassValidator,
  ],
})
export class CustomValidatorModule {}
