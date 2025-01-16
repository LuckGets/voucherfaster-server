export type PaymentServiceResponse = {
  id: string;
  status: 'failed' | 'reversed' | 'expired' | 'pending' | 'successful';
};

export abstract class PaymentService {
  /**
   * This function is used to make a payment to the payment provider.
   *
   * @param {string} token - The token provided by the payment provider.
   * @param {number} amount - The amount to be paid.
   * @param {string} description - A description of the payment.
   */
  abstract makePayment(
    token: string,
    amount: number,
    description: string,
  ): Promise<PaymentServiceResponse>;
}
