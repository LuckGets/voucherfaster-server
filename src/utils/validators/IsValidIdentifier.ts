import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
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
  validate(value: any): Promise<boolean> | boolean {
    return isEmail(value) ? true : isPhoneNumber(value, 'TH');
  }

  defaultMessage(): string {
    return 'Identifier must be Email or Phone number';
  }
}

export function IsValidIdentifier(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'is valid identifier',
      propertyName: propertyName,
      target: object.constructor,
      options: validationOptions,
      validator: IsValidIdentifierValidator,
    });
  };
}
