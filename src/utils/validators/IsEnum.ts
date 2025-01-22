import { Injectable } from '@nestjs/common';
import { EnumCheckerHelper } from '@utils/services/enum-checker.helper';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import e from 'express';

@Injectable()
@ValidatorConstraint({ name: 'IsEnumValue', async: false })
export class IsEnumValueValidator implements ValidatorConstraintInterface {
  validate(value: any, args?: ValidationArguments): Promise<boolean> | boolean {
    const [enumVar]: object[] = args.constraints;
    return EnumCheckerHelper.checkEnumValue(enumVar, value);
  }

  defaultMessage(args?: ValidationArguments): string {
    const enumValue = [];
    const [enumVar] = args.constraints;
    for (const key in args.constraints[0]) {
      enumValue.push(enumVar[key]);
    }
    return `Value provided should be one of the ${enumValue.join(', ')} value`;
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
