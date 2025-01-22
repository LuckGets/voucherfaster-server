import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';

@Injectable()
export class CalculatorService {
  /**
   * Add two numbers or strings together.
   * @param firstNumber The first number or string to add.
   * @param secondeNumber The second number or string to add.
   * @returns The result of the addition.
   */
  public static add(...number: (number | string)[]): number {
    // Use the plus() method to add the two decimals together.
    // The toNumber() method is used to convert the result to a number.
    return number.reduce<number>((acc, curr) => {
      const value = typeof curr === 'string' ? parseFloat(curr) : curr;
      if (isNaN(value)) {
        throw new Error(`Invalid number: ${curr}`);
      }
      return new Decimal(acc).plus(new Decimal(value)).toNumber();
    }, 0);
  }

  public static minus(...number: (number | string)[]): number {
    let result: number;
    for (let i = 0; i < number.length; i++) {
      let value = number[i];

      if (typeof value === 'string') {
        value = parseFloat(value);
        if (isNaN(value)) {
          throw new Error(`Invalid number: ${value}`);
        }
      }

      if (i === 0) {
        result = value;
        continue;
      }
      result = new Decimal(result).minus(new Decimal(value)).toNumber();
    }

    return result;
  }

  /**
   * Multiply two numbers or strings together.
   * @param number The first number or string to multiply.
   * @param numberToMultiply The second number or string to multiply.
   * @returns The result of the multiplication as a number.
   */
  public static multiply(...number: (number | string)[]): number {
    // Use the times() method to multiply the two decimals together
    // Convert the result to a number using toNumber() method
    return number.reduce<number>((acc, curr) => {
      const value = typeof curr === 'string' ? parseFloat(curr) : curr;
      if (isNaN(value)) {
        throw new Error(`Invalid number: ${curr}`);
      }
      return new Decimal(acc).times(new Decimal(value)).toNumber();
    }, 1);
  }

  public static changedayToMilliseconde(day: number): number {
    return new Decimal(day)
      .times(24)
      .times(60)
      .times(60)
      .times(1000)
      .toNumber();
  }
}
