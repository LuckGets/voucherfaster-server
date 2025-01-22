export class EnumCheckerHelper {
  public static checkEnumValue(enumObj: any, value: any): boolean {
    if (!value) return false;
    return Object.values(enumObj).includes(value);
  }
}
