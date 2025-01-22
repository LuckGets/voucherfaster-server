export class TimeAdderHelper {
  public static addTime(
    date: Date,
    time: number,
    unit: 'SECOND' | 'MINUTE' | 'HOUR' | 'DAY' | 'MONTH' | 'YEAR',
  ): Date {
    const result = new Date(date);

    switch (unit) {
      case 'SECOND':
        result.setSeconds(result.getSeconds() + time);
      case 'MINUTE':
        result.setMinutes(result.getMinutes() + time);
        return result;
      case 'HOUR':
        result.setHours(result.getHours() + time);
        return result;
      case 'DAY':
        result.setDate(result.getDate() + time);
      case 'MONTH':
        result.setMonth(result.getMonth() + time);
      case 'YEAR':
        result.setFullYear(result.getFullYear() + time);
      default:
        throw new Error(`Unit ${unit} is not supported`);
    }
  }
}
