import test from 'node:test';
import assert from 'node:assert/strict';
import { createBasketInsight } from '../api/insights-core.js';

test('counts only selected cart items and applies discounts in sequence', () => {
  const insight = createBasketInsight({
    budgetLimit: 100000,
    cart: [
      { price: 100000, qty: 1, discountRaw: '50+20', category: 'Bahan Pokok', lastMonthPrice: 90000, inPhysicalCart: true },
      { price: 250000, qty: 2, category: 'Lainnya', inPhysicalCart: false }
    ]
  });

  assert.equal(insight.status, 'SAFE');
  assert.equal(insight.categoryAllocation['Bahan Pokok'].spent, 40000);
  assert.equal(insight.categoryAllocation['Lainnya'], undefined);
  assert.equal(insight.inflationSummary.itemsIncreased, 1);
  assert.equal(insight.inflationSummary.netInflationPct, 25);
});

test('uses the 90 percent warning threshold and the over-budget danger threshold', () => {
  const item = { price: 90000, qty: 1, category: 'Bahan Pokok', inPhysicalCart: true };
  const warning = createBasketInsight({ budgetLimit: 100000, cart: [item] });
  const danger = createBasketInsight({ budgetLimit: 89900, cart: [item] });
  assert.equal(warning.status, 'WARNING');
  assert.equal(danger.status, 'DANGER');
  assert.equal(danger.healthScore, 75);
});

test('handles direct nominal discounts and safe category keys', () => {
  const insight = createBasketInsight({
    budgetLimit: 100000,
    cart: [{ price: 30000, qty: 1, discountRaw: 'Rp 5.000', category: '__proto__', inPhysicalCart: true }]
  });

  assert.equal(insight.categoryAllocation['__proto__'].spent, 25000);
});

test('ignores the entire invalid stacked discount instead of applying only part of it', () => {
  const insight = createBasketInsight({
    budgetLimit: 150000,
    cart: [{ price: 100000, qty: 1, discountRaw: '50+101', category: 'Bahan Pokok', inPhysicalCart: true }]
  });

  assert.equal(insight.categoryAllocation['Bahan Pokok'].spent, 100000);
});

test('rejects invalid selected quantities and oversized carts', () => {
  assert.throws(
    () => createBasketInsight({ cart: [{ price: 1000, qty: 0, inPhysicalCart: true }] }),
    /bilangan bulat positif/
  );
  assert.throws(
    () => createBasketInsight({ cart: Array.from({ length: 501 }, () => ({})) }),
    /Jumlah barang maksimal/
  );
});
