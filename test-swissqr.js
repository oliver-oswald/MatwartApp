import { SwissQRBill } from 'swissqrbill/svg';

try {
  const bill = new SwissQRBill({
    currency: 'CHF',
    amount: 100.0,
    creditor: {
      name: 'Pfadi Muster',
      address: 'Musterstrasse 1',
      zip: '8000',
      city: 'Zurich',
      country: 'CH',
      account: 'CH7930000000000000000'
    }
  });
  console.log("Success");
} catch (e) {
  console.error("Failed:", e.message);
}
