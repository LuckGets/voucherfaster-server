import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@Injectable()
@ValidatorConstraint({ name: 'isEmptyValue', async: false })
export class IsEmptyValueValidator implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    return !value; // Check if the date is in the future
  }

  defaultMessage(args?: ValidationArguments): string {
    return `The property: ${args.property} must not have any value.`;
  }
}

export function IsEmptyValue(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEmptyValue',
      propertyName: propertyName,
      target: object.constructor,
      options: validationOptions,
      validator: IsEmptyValueValidator,
    });
  };
}
