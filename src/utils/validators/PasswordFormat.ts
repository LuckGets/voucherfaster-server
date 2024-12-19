import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'PasswordValidator', async: false })
export class PasswordValidator implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    const regexPattern = new RegExp(/(?=.*[A-Z])(?=.*[a-z])/);
    return regexPattern.test(value);
  }

  defaultMessage(arg?: ValidationArguments): string {
    return `${arg.property} should have at least one uppercase character.`;
  }
}

export function IsPasswordValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'Matcher validator',
      propertyName: propertyName,
      target: object.constructor,
      options: validationOptions,
      validator: PasswordValidator,
    });
  };
}
