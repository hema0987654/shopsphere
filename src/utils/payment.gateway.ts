export interface IPaymentGateway {
  charge(amount: number, method: string, cardInfo?: any): Promise<boolean>;
}

export const PaymentGateway: IPaymentGateway = {
  async charge(amount: number, method: string) {
    console.log(`[PAYMENT] method=${method}, amount=${amount}`);

    if (method === "card" && amount > 5000) {
      console.log("❌ Card limit exceeded");
      return false;
    }

    console.log("✅ Payment successful");
    return true;
  }
};
