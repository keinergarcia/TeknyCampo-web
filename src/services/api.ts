import { products, type Product } from '../data/products';
import { services, type Service } from '../data/services';
import { news, type NewsItem } from '../data/news';
import { prices, type PriceIndicator } from '../data/indicators';
import { companyValues, statistics, type CompanyValue, type Statistic } from '../data/company';

export type { Product, Service, NewsItem, PriceIndicator, CompanyValue, Statistic };

export function getProducts(): Product[] {
  return products;
}

export function getServices(): Service[] {
  return services;
}

export function getNews(): NewsItem[] {
  return news;
}

export function getNewsById(id: string): NewsItem | undefined {
  return news.find((item) => item.id === id);
}

export function getStaticPrices(): PriceIndicator[] {
  return prices;
}

export async function getPrices(): Promise<PriceIndicator[]> {
  const { getLivePrices } = await import('./livePrices');
  return getLivePrices();
}

export function getCompanyValues(): CompanyValue[] {
  return companyValues;
}

export function getStatistics(): Statistic[] {
  return statistics;
}
