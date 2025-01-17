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
  public static add(
    firstNumber: number | string,
    secondeNumber: number | string,
  ): number {
    const decimalA = new Decimal(firstNumber);
    const decimalB = new Decimal(secondeNumber);
    // Use the plus() method to add the two decimals together.
    // The toNumber() method is used to convert the result to a number.
    return decimalA.plus(decimalB).toNumber();
  }

  public static minus(
    firstNumber: number | string,
    secondeNumber: number | string,
  ): number {
    const decimalA = new Decimal(firstNumber);
    const decimalB = new Decimal(secondeNumber);
    return decimalA.minus(decimalB).toNumber();
  }

  /**
   * Multiply two numbers or strings together.
   * @param number The first number or string to multiply.
   * @param numberToMultiply The second number or string to multiply.
   * @returns The result of the multiplication as a number.
   */
  public static multiply(
    number: number | string,
    numberToMultiply: number | string,
  ): number {
    // Convert the inputs to Decimal objects for precise arithmetic operations
    const decimalA = new Decimal(number);
    const decimalB = new Decimal(numberToMultiply);
    // Use the times() method to multiply the two decimals together
    // Convert the result to a number using toNumber() method
    return decimalA.times(decimalB).toNumber();
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
