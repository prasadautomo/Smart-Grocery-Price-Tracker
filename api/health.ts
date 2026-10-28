export default function handler(_req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    status: 'ok',
    service: 'KeranjangPintar PRO Cloud Intelligence Backend',
    version: '4.0.0',
    runtime: `Node.js ${process.version}`,
    language: 'TypeScript 5.x Serverless',
    platform: 'Vercel Serverless Edge/Node Engine',
    timestamp: new Date().toISOString(),
  });
}
