import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'AtLeastOneProperty', async: false })
export class AtLeastOnePropertyConstraint
  implements ValidatorConstraintInterface
{
  validate(_: any, args: ValidationArguments) {
    const properties = args.constraints[0] as string[];
    const object = args.object as Function;

    return properties.some((property) => {
      const value = object[property];
      return !!value;
    });
  }

  defaultMessage(args: ValidationArguments) {
    const properties = args.constraints[0];
    return `At least one of the following properties must be provided: ${properties.join(
      ', ',
    )}`;
  }
}

export function AtLeastOneProperty(
  properties: string[],
  validationOptions?: ValidationOptions,
) {
  return function (constructor: Function) {
    registerDecorator({
      target: constructor,
      name: 'AtleastOneProperty',
      options: validationOptions,
      constraints: [properties],
      validator: AtLeastOnePropertyConstraint,
      propertyName: '__class__',
    });
  };
}
