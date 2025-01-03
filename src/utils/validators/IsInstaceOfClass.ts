import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';

@ValidatorConstraint({ name: 'isInstanceOfClass', async: false })
export class IsInstanceOfClassValidator
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments): boolean {
    const targetClass = args.constraints[0];
    if (!targetClass || typeof targetClass !== 'function') {
      throw new Error(
        'A valid class type must be provided to IsInstanceOfClass.',
      );
    }

    try {
      const instance = plainToInstance(targetClass, value);
      const errors = Object.keys(new targetClass()).some(
        (key) => !(key in instance),
      );
      return !errors;
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const targetClass = args.constraints[0];
    return `The provided object must match the structure of ${targetClass.name}.`;
  }
}

export function IsInstanceOfClass(
  targetClass: Function,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isInstanceOfClass',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [targetClass],
      validator: IsInstanceOfClassValidator,
    });
  };
}
