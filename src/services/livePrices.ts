import type { PriceIndicator } from '../data/indicators';
import { prices as staticPrices } from '../data/indicators';

const PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://corsproxy.io/?',
];

const DANE_URL = 'https://apps.dane.gov.co/pentaho/api/repos/%3Apublic%3ASIPSA%3ASIPSAV17.wcdf/generatedContent';

interface ParsedPrice {
  product: string;
  price: string;
  unit: string;
}

async function fetchViaProxy(proxyUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const url = proxyUrl + encodeURIComponent(DANE_URL);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchWithFallback(): Promise<string | null> {
  for (const proxy of PROXIES) {
    const result = await fetchViaProxy(proxy);
    if (result) return result;
  }
  return null;
}

function parsePriceValue(text: string): number {
  const cleaned = text.replace(/[^0-9,.]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

function tryParsePrices(html: string): PriceIndicator[] | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const tables = doc.querySelectorAll('table');
  if (tables.length === 0) return null;

  const rows: ParsedPrice[] = [];

  tables.forEach((table) => {
    const bodyRows = table.querySelectorAll('tbody tr, tr');
    bodyRows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 4) return;

      const product = cells[0]?.textContent?.trim();
      const promStr = cells[3]?.textContent?.trim();

      if (!product || !promStr) return;

      const prom = parsePriceValue(promStr);
      if (prom <= 0) return;

      rows.push({
        product,
        price: `$${prom.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`,
        unit: 'kg',
      });
    });
  });

  if (rows.length === 0) return null;

  return rows.slice(0, 8).map((r) => {
    const staticMatch = staticPrices.find(
      (s) => s.product.toLowerCase().includes(r.product.toLowerCase()) || r.product.toLowerCase().includes(s.product.toLowerCase())
    );
    return {
      product: r.product,
      price: r.price,
      unit: r.unit,
      trend: staticMatch?.trend ?? 'stable',
      change: staticMatch?.change ?? '\u2014',
    };
  });
}

export async function getLivePrices(): Promise<PriceIndicator[]> {
  const html = await fetchWithFallback();
  if (!html) return staticPrices;

  const parsed = tryParsePrices(html);
  if (!parsed) return staticPrices;

  return parsed;
}
