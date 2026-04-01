export class PaymentGateway {
  constructor() {}

  async payment({
    token,
    amount,
  }: {
    token: string;
    amount: number;
  }): Promise<{ success: boolean }> {
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }
}
