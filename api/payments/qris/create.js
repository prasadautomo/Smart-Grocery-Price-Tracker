import { createQrisPayment, PaymentError } from '../../midtrans-core.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Metode permintaan tidak didukung.' });
  }

  try {
    const payment = await createQrisPayment(
      req.body,
      req.headers.authorization,
      req.headers['x-supabase-anon-key']
    );
    return res.status(201).json(payment);
  } catch (error) {
    const statusCode = error instanceof PaymentError ? error.statusCode : 500;
    return res.status(statusCode).json({
      error: error instanceof PaymentError ? error.message : 'QRIS belum dapat dibuat.'
    });
  }
}
