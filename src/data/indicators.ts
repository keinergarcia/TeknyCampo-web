export interface PriceIndicator {
  product: string;
  price: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

export const prices: PriceIndicator[] = [
  { product: 'Huevos Frescos', price: '$380', unit: 'unidad', trend: 'up', change: '+8%' },
  { product: 'Cebolla Roja Cabezona', price: '$3.200', unit: 'kg', trend: 'up', change: '+5%' },
  { product: 'Aguacate', price: '$4.500', unit: 'kg', trend: 'up', change: '+3%' },
  { product: 'Frijol Rosado', price: '$4.800', unit: 'kg', trend: 'up', change: '+2%' },
  { product: 'Habichuela', price: '$2.600', unit: 'kg', trend: 'down', change: '-1%' },
  { product: 'Pimentón', price: '$3.900', unit: 'kg', trend: 'up', change: '+4%' },
  { product: 'Tomate', price: '$2.300', unit: 'kg', trend: 'down', change: '-3%' },
  { product: 'Ahuyama', price: '$1.800', unit: 'kg', trend: 'stable', change: '0%' },
];
