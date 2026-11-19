import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createBasketInsight } from './insights-core.js';
import type { BasketAnalyticsPayload } from '../types/grocery.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      runtime: `Node.js ${process.version}`,
      message: 'Endpoint siap menerima POST analitik keranjang belanja.'
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Metode permintaan tidak didukung.' });
  }

  try {
    const insight = createBasketInsight(req.body as BasketAnalyticsPayload);
    return res.status(200).json(insight);
  } catch (error) {
    const isInvalidRequest = error instanceof TypeError || error instanceof RangeError;
    return res.status(isInvalidRequest ? 400 : 500).json({
      error: isInvalidRequest && error instanceof Error
        ? error.message
        : 'Gagal memproses analitik keranjang.'
    });
  }
}
