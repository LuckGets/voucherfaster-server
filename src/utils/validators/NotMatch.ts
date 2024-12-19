import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'NotMatchValidator', async: false })
export class NotMatchValidator implements ValidatorConstraintInterface {
  validate(value: any, args?: ValidationArguments): boolean {
    const [propertyToMatch] = args.constraints;
    const propertyValue = args.object[propertyToMatch];
    return value !== propertyValue;
  }

  defaultMessage(arg?: ValidationArguments): string {
    return `${arg.property} should not match with ${arg.constraints}`;
  }
}

export function NotMatch(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'Matcher validator',
      propertyName: propertyName,
      constraints: [property],
      target: object.constructor,
      options: validationOptions,
      validator: NotMatchValidator,
    });
  };
}
