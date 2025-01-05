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
export class RequiredWithValidator implements ValidatorConstraintInterface {
  validate(value: any, args?: ValidationArguments): boolean {
    // The first constraint param will be the property name to check
    const [propertiesParam, options] = args.constraints;

    /**
     * propertiesParam can be either a single string or an array of strings.
     * Convert it to an array for easy iteration.
     */
    const properties: string[] = Array.isArray(propertiesParam)
      ? propertiesParam
      : [propertiesParam];

    const isRequireOneProperties = options?.any ?? false;

    // Collect the values of the other properties
    const otherValues = properties.map((prop) => args.object[prop]);

    // Count how many of these properties are "filled"
    const filledCount = otherValues.filter((item) => !!item).length;

    // if the function need to check all of the
    // property provided via argument
    if (!isRequireOneProperties) {
      // if all of the filter array which filter
      // only the value which have truthy value
      // match the length of all the property
      if (filledCount === properties.length) {
        return true;
      }
    }
    // if the function need to check only one
    // check does any the parameter property has value
    if (filledCount > 0) {
      return true;
    }

    // if not match any requirement
    // return false
    return false;
  }

  defaultMessage(args?: ValidationArguments): string {
    const [propertyToCheck] = args.constraints;
    return `The field "${args.property}" is required because "${propertyToCheck}" is provided.`;
  }
}

export function RequiredWith(
  property: string | string[],
  options?: { any: boolean },
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'RequiredWith',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: RequiredWithValidator,
    });
  };
}
