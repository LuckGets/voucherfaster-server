export class ObjectHelper {
  public static isObjectEmpty(obj: object): boolean {
    if (!obj) return true;
    return Object.keys(obj).length === 0;
  }

  public static findEmptyField(obj: object, fields: string[]): string[] {
    return fields.filter((item) => {
      if (!obj[item]) return item;
    });
  }

  public static findEmptyFieldAndThrowError(
    obj: object,
    fields: string[],
    objName: string,
  ) {
    // Check for missing fields
    const missingFields = this.findEmptyField(obj, fields);
    if (missingFields.length > 0) {
      throw new Error(
        `There is missing required fields:: ${missingFields.join(', ')} for ${objName}. `,
      );
    }
  }
}
