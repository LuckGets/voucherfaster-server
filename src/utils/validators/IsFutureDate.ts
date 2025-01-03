import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@Injectable()
@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDateValidator implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (!(value instanceof Date)) {
      return false; // Ensure the value is a Date instance
    }
    return value >= new Date(); // Check if the date is in the future
  }

  defaultMessage(): string {
    return 'Date must not be less than the present and be in the future';
  }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      propertyName: propertyName,
      target: object.constructor,
      options: validationOptions,
      validator: IsFutureDateValidator,
    });
  };
}
