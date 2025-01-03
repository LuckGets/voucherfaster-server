import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { registerDecorator, ValidationOptions } from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'IsDateGreaterThan', async: false })
export class IsDateGreaterThanValidator
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments): boolean {
    const [propertyToCompare] = args.constraints;
    const propertyValue = args.object[propertyToCompare];

    // Ensure both values are instances of Date
    if (value instanceof Date && propertyValue instanceof Date) {
      return value > propertyValue; // Check if the decorated date is greater than the compared one
    }

    return false; // If either value isn't a Date, return false
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be greater than ${args.constraints[0]}`;
  }
}

export function IsDateGreaterThan(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsDateGreaterThan',
      propertyName: propertyName,
      constraints: [property],
      target: object.constructor,
      options: validationOptions,
      validator: IsDateGreaterThanValidator,
    });
  };
}
