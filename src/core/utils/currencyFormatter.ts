export class CurrencyFormatter {
  static format(amount: number): string {
    return (isNaN(amount) ? 0 : amount).toFixed(2);
  }
}
