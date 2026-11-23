import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const SUPABASE_AUTH_URL = 'https://wkrspzoixbkbpanoelvp.supabase.co/auth/v1/user';

export class PaymentError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function getMidtransConfig() {
  const serverKey = String(process.env.MIDTRANS_SERVER_KEY || '').trim();
  if (!serverKey) {
    throw new PaymentError(503, 'Layanan QRIS belum diaktifkan oleh pengelola aplikasi.');
  }

  const environment = String(process.env.MIDTRANS_IS_PRODUCTION || '').toLowerCase();
  if (!['true', 'false'].includes(environment)) {
    throw new PaymentError(503, 'Layanan QRIS belum diaktifkan oleh pengelola aplikasi.');
  }
  const isProduction = environment === 'true';
  return {
    serverKey,
    isProduction,
    apiUrl: isProduction ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com'
  };
}

async function getAuthenticatedUser(authorization, supabaseAnonKey) {
  const token = String(authorization || '').match(/^Bearer\s+(.+)$/i)?.[1];
  const apiKey = String(supabaseAnonKey || '').trim();
  if (!token || !apiKey) {
    throw new PaymentError(401, 'Silakan masuk ke akun sebelum membuat pembayaran.');
  }

  let response;
  try {
    response = await fetch(SUPABASE_AUTH_URL, {
      headers: { apikey: apiKey, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000)
    });
  } catch {
    throw new PaymentError(502, 'Akun belum dapat diverifikasi. Coba lagi sebentar.');
  }
  if (!response.ok) throw new PaymentError(401, 'Sesi akun berakhir. Silakan masuk kembali.');

  const user = await response.json().catch(() => null);
  if (!user?.id) throw new PaymentError(401, 'Sesi akun tidak valid. Silakan masuk kembali.');
  return user;
}

function createPaymentToken(serverKey, orderId, amount, userId) {
  return createHmac('sha256', serverKey)
    .update(`${orderId}:${amount}:${userId}`)
    .digest('base64url');
}

function isValidPaymentToken(serverKey, token, orderId, amount, userId) {
  const expected = Buffer.from(createPaymentToken(serverKey, orderId, amount, userId));
  const received = Buffer.from(String(token || ''));
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function getMidtransAuthorization(serverKey) {
  return `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`;
}

async function readProviderResponse(response) {
  return response.json().catch(() => ({}));
}

export async function createQrisPayment(payload, authorization, supabaseAnonKey) {
  const user = await getAuthenticatedUser(authorization, supabaseAnonKey);
  const { serverKey, apiUrl } = getMidtransConfig();
  const rawItems = payload?.items;
  if (!Array.isArray(rawItems) || rawItems.length < 1 || rawItems.length > 100) {
    throw new PaymentError(400, 'Daftar barang untuk pembayaran tidak valid.');
  }

  const itemDetails = rawItems.map((item, index) => {
    const price = Number(item?.price);
    const quantity = Number(item?.quantity);
    const name = String(item?.name || '').trim();
    if (!name || !Number.isSafeInteger(price) || price < 1 || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 999) {
      throw new PaymentError(400, 'Nama, harga, atau jumlah barang tidak valid.');
    }
    return {
      id: String(item?.id || `item-${index + 1}`).slice(0, 50),
      price,
      quantity,
      name: name.slice(0, 50)
    };
  });

  const amount = itemDetails.reduce((total, item) => total + (item.price * item.quantity), 0);
  if (!Number.isSafeInteger(amount) || amount < 1 || Number(payload.amount) !== amount) {
    throw new PaymentError(400, 'Total pembayaran tidak cocok dengan rincian barang.');
  }

  const orderId = `CARTLY-${Date.now()}-${randomBytes(6).toString('hex').toUpperCase()}`;
  const customerName = String(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Pelanggan').slice(0, 50);
  let response;
  try {
    response = await fetch(`${apiUrl}/v2/charge`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: getMidtransAuthorization(serverKey)
      },
      body: JSON.stringify({
        payment_type: 'qris',
        transaction_details: { order_id: orderId, gross_amount: amount },
        item_details: itemDetails,
        customer_details: {
          first_name: customerName,
          email: String(user.email || '').slice(0, 100)
        },
        qris: { acquirer: 'gopay' }
      }),
      signal: AbortSignal.timeout(15000)
    });
  } catch {
    throw new PaymentError(502, 'Tidak dapat menghubungi layanan QRIS. Coba lagi.');
  }

  const result = await readProviderResponse(response);
  if (!response.ok) {
    const providerMessage = String(result.status_message || '').slice(0, 160);
    throw new PaymentError(502, providerMessage || 'QRIS belum dapat dibuat. Periksa pengaturan akun merchant.');
  }
  if (result.payment_type !== 'qris' || String(result.transaction_status || '').toLowerCase() !== 'pending') {
    throw new PaymentError(502, 'Penyedia belum mengaktifkan pembayaran QRIS untuk akun merchant ini.');
  }

  const qrAction = Array.isArray(result.actions)
    ? result.actions.find(action => action.name === 'generate-qr-code-v2') || result.actions.find(action => action.name === 'generate-qr-code')
    : null;
  const qrImageUrl = String(qrAction?.url || '');
  let parsedQrUrl;
  try {
    parsedQrUrl = new URL(qrImageUrl);
  } catch {
    throw new PaymentError(502, 'Layanan QRIS tidak mengembalikan kode pembayaran yang valid.');
  }
  if (parsedQrUrl.protocol !== 'https:' || parsedQrUrl.hostname !== new URL(apiUrl).hostname) {
    throw new PaymentError(502, 'Alamat kode QRIS dari penyedia tidak valid.');
  }

  return {
    orderId,
    amount,
    paymentToken: createPaymentToken(serverKey, orderId, amount, user.id),
    qrImageUrl,
    expiresAt: result.expiry_time || null,
    environment: apiUrl.includes('sandbox') ? 'sandbox' : 'production'
  };
}

export async function getQrisPaymentStatus(query, authorization, supabaseAnonKey) {
  const user = await getAuthenticatedUser(authorization, supabaseAnonKey);
  const { serverKey, apiUrl } = getMidtransConfig();
  const orderId = String(query?.orderId || '');
  const amount = Number(query?.amount);
  if (!/^CARTLY-\d{13}-[A-F0-9]{12}$/.test(orderId) || !Number.isSafeInteger(amount) || amount < 1) {
    throw new PaymentError(400, 'Data pembayaran tidak valid.');
  }
  if (!isValidPaymentToken(serverKey, query?.paymentToken, orderId, amount, user.id)) {
    throw new PaymentError(403, 'Pembayaran ini tidak dapat diverifikasi untuk akun ini.');
  }

  let response;
  try {
    response = await fetch(`${apiUrl}/v2/${encodeURIComponent(orderId)}/status`, {
      headers: { Accept: 'application/json', Authorization: getMidtransAuthorization(serverKey) },
      signal: AbortSignal.timeout(10000)
    });
  } catch {
    throw new PaymentError(502, 'Status pembayaran belum dapat diperiksa. Coba lagi.');
  }
  const result = await readProviderResponse(response);
  if (!response.ok) {
    throw new PaymentError(response.status === 404 ? 404 : 502, 'Transaksi QRIS belum ditemukan.');
  }

  const paidAmount = Number(result.gross_amount);
  if (result.order_id !== orderId || paidAmount !== amount || (result.currency && result.currency !== 'IDR') || result.payment_type !== 'qris') {
    throw new PaymentError(409, 'Rincian pembayaran dari penyedia tidak cocok.');
  }

  const transactionStatus = String(result.transaction_status || '').toLowerCase();
  const isPaid = String(result.status_code) === '200' && ['settlement', 'capture'].includes(transactionStatus) &&
    (!result.fraud_status || String(result.fraud_status).toLowerCase() === 'accept');
  const status = isPaid
    ? 'paid'
    : ['expire', 'expired'].includes(transactionStatus)
      ? 'expired'
      : ['deny', 'cancel', 'failure'].includes(transactionStatus)
        ? 'failed'
        : 'pending';

  return {
    orderId,
    amount,
    status,
    paidAt: result.settlement_time || result.transaction_time || null
  };
}
