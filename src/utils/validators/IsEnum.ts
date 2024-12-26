import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'IsEnumValue', async: false })
export class IsEnumValueValidator implements ValidatorConstraintInterface {
  validate(value: any, args?: ValidationArguments): Promise<boolean> | boolean {
    return !!args.constraints[value];
  }

  defaultMessage(args?: ValidationArguments): string {
    return `Value provided should be one of the ${args.constraints} value`;
  }
}

export function IsEnumValue(
  enumVar: Record<string, string>,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'is enum value',
      propertyName: propertyName,
      constraints: [enumVar],
      target: object.constructor,
      options: validationOptions,
      validator: IsEnumValueValidator,
    });
  };
}
