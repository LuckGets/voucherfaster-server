import { Injectable } from '@nestjs/common';
import {
  isUUID,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'IsEnumValue', async: false })
export class IsArrayOfUUIDValidator implements ValidatorConstraintInterface {
  validate(value: any, args?: ValidationArguments): Promise<boolean> | boolean {
    if (!Array.isArray(value)) {
      return false;
    }
    return value.every((item) => isUUID(item));
  }

  defaultMessage(args?: ValidationArguments): string {
    return `All elements in ${args?.property || 'the array'} must be valid UUIDs.`;
  }
}

export function IsArrayOfUUID(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'is array of UUID value.',
      propertyName: propertyName,
      target: object.constructor,
      options: validationOptions,
      validator: IsArrayOfUUIDValidator,
    });
  };
}
