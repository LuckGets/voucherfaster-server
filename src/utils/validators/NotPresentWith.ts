import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'RequiredWithValidator', async: false })
export class NotPresentWithValidator implements ValidatorConstraintInterface {
  validate(value: any, args?: ValidationArguments): boolean {
    const [allPropertieseToCheck] = args.constraints as [string[]];
    if (value) {
      allPropertieseToCheck.forEach((property: string) => {
        const otherValue = (args.object as Record<string, any>)[property];
        if (otherValue) return false;
      });
    }
    return true;
  }

  defaultMessage(args?: ValidationArguments): string {
    const [propertyToCheck] = args.constraints as [string[]];
    return `The field "${args.property}" should not have any value if "${propertyToCheck.join(', ')}" is provided.`;
  }
}

export function NotPresentWith(
  property: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'RequiredWith',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: NotPresentWithValidator,
    });
  };
}
