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
}
