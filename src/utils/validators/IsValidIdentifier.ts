import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraintInterface,
  isEmail,
  isPhoneNumber,
  ValidatorConstraint,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'isValidIdentifier', async: false })
export class IsValidIdentifierValidator
  implements ValidatorConstraintInterface
{
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    return isEmail(value) || isPhoneNumber(value, 'TH');
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Identifier must be Email or Phone number';
  }
}

export function IsValidIdentifier(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'is valid identifier',
      propertyName: propertyName,
      target: object.constructor,
      options: validationOptions,
      validator: IsValidIdentifierValidator,
    });
  };
}
