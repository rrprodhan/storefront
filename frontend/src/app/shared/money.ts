const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatPrice(cents: number): string {
  return usd.format(cents / 100);
}

/** Return null rather than rounding an admin's invalid dollar input. */
export function parseDollarPrice(value: string): number | null {
  const text = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;

  const [dollars, cents = ''] = text.split('.');
  const priceCents = Number(dollars) * 100 + Number(cents.padEnd(2, '0'));
  return Number.isSafeInteger(priceCents) && priceCents <= 2_147_483_647 ? priceCents : null;
}
