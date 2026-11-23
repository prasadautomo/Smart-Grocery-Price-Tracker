/** Local development server for the Cartly PWA and its API routes. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createBasketInsight } from './insights-core.js';
import { createQrisPayment, getQrisPaymentStatus, PaymentError } from './midtrans-core.js';

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY_BYTES = 1024 * 1024;
const PYTHON_TIMEOUT_MS = 2500;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const STATIC_FILES = new Set([
  'index.html', 'styles.css', 'app.js', 'manifest.json', 'sw.js',
  'public/pwa-icon.svg'
]);

const CATALOG = {
  '8991002105432': { name: 'Minyak Goreng Sania Pouch', brand: 'Sania Royale', category: 'Bahan Pokok', unit: 'liter', unitSize: '2 Liter', price: 38500, lastMonthPrice: 34000, defaultDiscounts: '15+5' },
  '8992753311201': { name: 'Beras Ramos Super 5kg', brand: 'Topi Koki', category: 'Bahan Pokok', unit: 'kg', unitSize: '5 Kg', price: 74500, lastMonthPrice: 69000, defaultDiscounts: '0' },
  '8998866200192': { name: 'Telur Ayam Negeri Pack', brand: 'Superindo Fresh', category: 'Bahan Pokok', unit: 'kg', unitSize: '1 Kg (16 Butir)', price: 28500, lastMonthPrice: 31000, defaultDiscounts: '10' },
  '8993189201018': { name: 'Sabun Mandi Cair Biore Guard', brand: 'Biore KAO', category: 'Kebersihan', unit: 'pouch', unitSize: '450 ml', price: 26900, lastMonthPrice: 26900, defaultDiscounts: '50+20' },
  '8991001100223': { name: 'Indomie Goreng Spesial (Dus)', brand: 'Indofood', category: 'Makanan & Minuman', unit: 'dus', unitSize: '40 bungkus', price: 118000, lastMonthPrice: 115000, defaultDiscounts: '5' },
  '8999999001234': { name: 'Deterjen Rinso Molto Cair', brand: 'Unilever', category: 'Kebersihan', unit: 'pouch', unitSize: '750 ml', price: 22500, lastMonthPrice: 24500, defaultDiscounts: '20' },
  '8992388102911': { name: 'Kecap Manis Bango Pouch', brand: 'Bango Unilever', category: 'Dapur & Bumbu', unit: 'pouch', unitSize: '520 ml', price: 24000, lastMonthPrice: 22000, defaultDiscounts: '0' },
  '8996001301124': { name: 'Pembersih Lantai Wipol Karbol', brand: 'Wipol', category: 'Kebersihan', unit: 'botol', unitSize: '780 ml', price: 19500, lastMonthPrice: 19500, defaultDiscounts: '50+20' }
};

function sendJson(res, statusCode, body, extraHeaders = {}) {
  const encoded = Buffer.from(JSON.stringify(body));
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': encoded.length,
    'Cache-Control': 'no-store',
    ...extraHeaders
  });
  res.end(encoded);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;
    let tooLarge = false;

    req.on('data', chunk => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        tooLarge = true;
        chunks.length = 0;
      } else if (!tooLarge) {
        chunks.push(chunk);
      }
    });
    req.on('end', () => {
      if (tooLarge) {
        const error = new RangeError('Ukuran permintaan maksimal 1 MB.');
        error.statusCode = 413;
        reject(error);
        return;
      }
      if (!totalBytes) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        const error = new SyntaxError('Format JSON tidak valid.');
        error.statusCode = 400;
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function applyDiscount(price, expression) {
  const clean = String(expression || '').trim().toLowerCase();
  if (!clean) return { finalPrice: price, steps: [] };

  if (clean.includes('buy 2 get 1') || clean.includes('beli 2 gratis 1')) {
    return { finalPrice: Math.round(price * 2 / 3), steps: ['Beli 2 Gratis 1'] };
  }
  const nominalMatch = clean.match(/^-?\s*(?:rp\s*)?([\d.]+)$/);
  if (nominalMatch) {
    const nominal = Number(nominalMatch[1].replace(/\./g, ''));
    if (nominal > 0 && nominal < price) return { finalPrice: price - nominal, steps: [`Potongan Rp ${nominal.toLocaleString('id-ID')}`] };
    return { finalPrice: price, steps: [] };
  }

  const percentages = clean.split(/[+,&]/)
    .map(part => Number.parseFloat(part.replace(/[^0-9.]/g, '')))
    .filter(Number.isFinite);
  if (!percentages.length || percentages.some(percentage => percentage < 0 || percentage > 100)) {
    return { finalPrice: price, steps: [] };
  }

  let finalPrice = price;
  const steps = [];
  for (const percentage of percentages) {
    if (percentage <= 0) continue;
    finalPrice *= 1 - (percentage / 100);
    steps.push(`${percentage}%`);
  }
  return { finalPrice: Math.max(0, Math.round(finalPrice)), steps };
}

function createScanResult(barcode, discountInput, priceInput, lastPriceInput) {
  const product = CATALOG[barcode] || {
    name: `Produk Supermarket #${barcode.slice(-4)}`,
    brand: 'Item Supermarket',
    category: 'Bahan Pokok',
    unit: 'pcs',
    unitSize: '1 Pcs',
    price: 25000,
    lastMonthPrice: 23000,
    defaultDiscounts: '10'
  };
  const price = priceInput > 0 ? priceInput : product.price;
  const lastPrice = lastPriceInput > 0 ? lastPriceInput : product.lastMonthPrice;
  const discountExpression = discountInput || product.defaultDiscounts;
  const discount = applyDiscount(price, discountExpression);
  const diff = discount.finalPrice - lastPrice;
  const diffPercent = lastPrice > 0 ? Number((diff / lastPrice * 100).toFixed(1)) : 0;
  const comparison = diff > 0
    ? { status: 'UP', arrow: '↑', label: `Naik Rp ${diff.toLocaleString('id-ID')} (+${diffPercent}%)`, css: 'up' }
    : diff < 0
      ? { status: 'DOWN', arrow: '↓', label: `Turun Rp ${Math.abs(diff).toLocaleString('id-ID')} (-${Math.abs(diffPercent)}%)`, css: 'down' }
      : { status: 'STABLE', arrow: '=', label: 'Harga Stabil (Sama)', css: 'stable' };

  const savedAmount = price - discount.finalPrice;
  return {
    engine: 'Node.js Scanner Core',
    pythonInstalled: false,
    barcode,
    name: product.name,
    brand: product.brand,
    category: product.category,
    unit: product.unit,
    unitSize: product.unitSize,
    shelf_price: price,
    discount_applied: discountExpression,
    discount_result: {
      original_price: price,
      final_price: discount.finalPrice,
      saved_amount: savedAmount,
      saved_pct: price > 0 ? Number((savedAmount / price * 100).toFixed(1)) : 0,
      formula_text: discount.steps.length ? `Potongan: ${discount.steps.join(' + ')}` : 'Harga Normal'
    },
    last_month_price: lastPrice,
    comparison
  };
}

async function tryPythonScanner(barcode, discount, price, lastPrice) {
  const scriptPath = path.join(rootDir, 'scripts', 'scanner.py');
  if (!fs.existsSync(scriptPath)) return null;
  const args = [scriptPath, barcode, discount, String(price), String(lastPrice)];
  const commands = process.platform === 'win32' ? ['python', 'py'] : ['python3', 'python'];

  for (const command of commands) {
    try {
      const commandArgs = command === 'py' ? ['-3', ...args] : args;
      const { stdout } = await execFileAsync(command, commandArgs, {
        timeout: PYTHON_TIMEOUT_MS,
        maxBuffer: 64 * 1024,
        windowsHide: true
      });
      const result = JSON.parse(stdout.trim());
      if (result?.discount_result && Number.isFinite(Number(result.discount_result.final_price))) {
        return { ...result, pythonInstalled: true };
      }
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      break;
    }
  }
  return null;
}

async function handleScan(url, res) {
  const barcode = url.searchParams.get('barcode') || '8991002105432';
  const discount = url.searchParams.get('discount') || '';
  const price = Number(url.searchParams.get('price')) || 0;
  const lastPrice = Number(url.searchParams.get('lastPrice')) || 0;

  if (!/^\d{8,14}$/.test(barcode)) {
    sendJson(res, 400, { error: 'Barcode harus berisi 8 sampai 14 angka.' });
    return;
  }
  if (discount.length > 80 || !Number.isFinite(price) || price < 0 || !Number.isFinite(lastPrice) || lastPrice < 0) {
    sendJson(res, 400, { error: 'Harga atau format diskon tidak valid.' });
    return;
  }

  const pythonResult = await tryPythonScanner(barcode, discount, price, lastPrice);
  sendJson(res, 200, pythonResult || createScanResult(barcode, discount, price, lastPrice));
}

const server = http.createServer(async (req, res) => {
  let url;
  try {
    url = new URL(req.url || '/', 'http://127.0.0.1');
  } catch {
    sendJson(res, 400, { error: 'Alamat permintaan tidak valid.' });
    return;
  }

  if (url.pathname === '/api/health') {
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Metode permintaan tidak didukung.' }, { Allow: 'GET' });
      return;
    }
    sendJson(res, 200, {
      status: 'ok',
      service: 'Cartly local backend',
      runtime: `Node.js ${process.version}`,
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (url.pathname === '/api/insights') {
    if (req.method === 'GET') {
      sendJson(res, 200, { status: 'online', runtime: `Node.js ${process.version}`, message: 'Endpoint siap menerima POST analitik keranjang belanja.' });
      return;
    }
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Metode permintaan tidak didukung.' }, { Allow: 'GET, POST' });
      return;
    }
    try {
      const payload = await readJsonBody(req);
      sendJson(res, 200, createBasketInsight(payload));
    } catch (error) {
      const statusCode = error.statusCode || (error instanceof TypeError || error instanceof RangeError ? 400 : 500);
      sendJson(res, statusCode, { error: error.message || 'Gagal memproses analitik keranjang.' });
    }
    return;
  }

  if (url.pathname === '/api/payments/qris/create') {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Metode permintaan tidak didukung.' }, { Allow: 'POST' });
      return;
    }
    try {
      const payload = await readJsonBody(req);
      const payment = await createQrisPayment(payload, req.headers.authorization, req.headers['x-supabase-anon-key']);
      sendJson(res, 201, payment);
    } catch (error) {
      sendJson(res, error instanceof PaymentError ? error.statusCode : 500, {
        error: error instanceof PaymentError ? error.message : 'QRIS belum dapat dibuat.'
      });
    }
    return;
  }

  if (url.pathname === '/api/payments/qris/status') {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Metode permintaan tidak didukung.' }, { Allow: 'POST' });
      return;
    }
    try {
      const payload = await readJsonBody(req);
      const status = await getQrisPaymentStatus(payload, req.headers.authorization, req.headers['x-supabase-anon-key']);
      sendJson(res, 200, status);
    } catch (error) {
      sendJson(res, error instanceof PaymentError ? error.statusCode : 500, {
        error: error instanceof PaymentError ? error.message : 'Status QRIS belum dapat diperiksa.'
      });
    }
    return;
  }

  if (url.pathname === '/api/scan-python' || url.pathname === '/api/scan') {
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Metode permintaan tidak didukung.' }, { Allow: 'GET' });
      return;
    }
    try {
      await handleScan(url, res);
    } catch (error) {
      console.error('Scanner request failed:', error);
      sendJson(res, 500, { error: 'Analisis barcode gagal.' });
    }
    return;
  }

  if (!['GET', 'HEAD'].includes(req.method)) {
    sendJson(res, 405, { error: 'Metode permintaan tidak didukung.' }, { Allow: 'GET, HEAD' });
    return;
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(url.pathname);
  } catch {
    sendJson(res, 400, { error: 'Alamat file tidak valid.' });
    return;
  }
  const relativePath = decodedPath.replace(/^[/\\]+/, '') || 'index.html';
  if (!STATIC_FILES.has(relativePath)) {
    sendJson(res, 404, { error: 'Berkas tidak ditemukan.' });
    return;
  }

  const filePath = path.resolve(rootDir, relativePath);
  const rootPrefix = `${rootDir}${path.sep}`;
  if (!filePath.startsWith(rootPrefix)) {
    sendJson(res, 404, { error: 'Berkas tidak ditemukan.' });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, error.code === 'ENOENT' ? 404 : 500, { error: error.code === 'ENOENT' ? 'Berkas tidak ditemukan.' : 'Berkas tidak dapat dibaca.' });
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream',
      'Content-Length': content.length,
      'Cache-Control': relativePath === 'index.html' ? 'no-cache' : 'public, max-age=3600'
    });
    res.end(req.method === 'HEAD' ? undefined : content);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Cartly] Server running at http://127.0.0.1:${PORT}`);
});
