import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Metode permintaan tidak didukung.' });
  }

  return res.status(200).json({
    status: 'ok',
    service: 'Cartly Cloud Backend',
    runtime: `Node.js ${process.version}`,
    language: 'TypeScript 5.x',
    platform: 'Vercel Serverless Edge/Node Engine',
    timestamp: new Date().toISOString()
  });
}
