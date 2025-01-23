import { ErrorApiResponse } from 'src/common/core-api-response';

export class EnumCheckerHelper {
  public static checkEnumValue(enumObj: any, value: any): boolean {
    if (!value) return false;
    return Object.values(enumObj).includes(value);
  }

  public static allEnumValue(enumObj: object): string[] {
    const enumValue = [];
    for (const key in enumObj) {
      enumValue.push(enumObj[key]);
    }
    return enumValue;
  }

  public static getEnumValueOrThrow<T extends object>(
    enumObj: T,
    value: any,
    defaultValue: T[keyof T],
  ): T[keyof T] {
    if (!value) return defaultValue;

    if (!this.checkEnumValue(enumObj, value.toUpperCase())) {
      throw ErrorApiResponse.badRequest(
        `${value} is not valid enumerable for status. Value provided should be one of the ${EnumCheckerHelper.allEnumValue(enumObj).join(', ')} value`,
      );
    }

    return enumObj[value.toUpperCase()];
  }
}
