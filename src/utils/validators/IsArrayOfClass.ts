import { plainToInstance } from 'class-transformer';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';

export class IsArrayOfClassValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [ClassType] = args.constraints;
    console.log('From validator', ClassType);

    // If it's not an array, fail immediately
    if (!Array.isArray(value)) {
      return false;
    }
    const parsedValue = value.map((item) => plainToInstance(ClassType, item));

    // Check each item to see if it's an instance of the class
    return parsedValue.every((item: any) => item instanceof ClassType);
  }

  defaultMessage(args: ValidationArguments) {
    const [ClassType] = args.constraints;
    return `${args.property} must be an array of ${ClassType.name} instances`;
  }
}

export function IsArrayOfClass(
  classType: Function,
  validationOptions?: ValidationOptions,
) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      name: 'IsArrayOf',
      target: target.constructor,
      propertyName,
      constraints: [classType],
      options: validationOptions,
      validator: IsArrayOfClassValidator,
    });
  };
}
