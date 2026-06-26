export interface Product {
  image: string;
  name: string;
  desc: string;
  variety?: string;
  features?: string[];
}

export const products: Product[] = [
  {
    image: 'https://www.ica.gov.co/CMSPages/GetFile.aspx?guid=58b07f65-7283-4646-8c6a-961686f96aeb',
    name: 'Huevos Frescos',
    desc: 'Huevos frescos de alta calidad provenientes de nuestras granjas, producidos de forma artesanal con enfoque en el bienestar animal.',
    variety: 'Campo',
    features: ['Producción artesanal', 'Bienestar animal', 'Alta calidad', 'Frescura garantizada'],
  },
  {
    image: 'https://www.molinosycia.com/wp-content/uploads/2023/03/cebolla_r_02-1024x683.jpg',
    name: 'Cebolla Roja Cabezona',
    desc: 'Cebolla roja cabezona de excelente calidad, cultivada con métodos tradicionales y en proceso de tecnificación sostenible.',
    variety: 'Roja Cabezona',
    features: ['Calidad premium', 'Cultivo tradicional', 'Tecnificación progresiva', 'Sabor auténtico'],
  },
  {
    image: 'https://http2.mlstatic.com/D_NQ_NP_721830-MLM112006082681_052026-O.webp',
    name: 'Aguacate',
    desc: 'Aguacate de alta calidad cultivado con prácticas sostenibles, ideal para consumo local y regional.',
    variety: 'Criollo',
    features: ['Calidad premium', 'Cultivo sostenible', 'Producción local', 'Sabor natural'],
  },
  {
    image: 'https://m.media-amazon.com/images/I/71jOBoTe0VL._AC_UF894,1000_QL80_.jpg',
    name: 'Frijol Rosado',
    desc: 'Frijol rosado cultivado con dedicación, combinando métodos ancestrales con innovaciones modernas para garantizar la mejor calidad.',
    variety: 'Rosado',
    features: ['Cultivo tradicional', 'Calidad superior', 'Producción sostenible', 'Origen campesino'],
  },
  {
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSN5RZAhVlB0LDWREkYJKVzpkj9KqUcQ0PWA&s',
    name: 'Habichuela',
    desc: 'Habichuela fresca cultivada en nuestras tierras, con prácticas sostenibles y respetuosas con el medio ambiente.',
    variety: 'Verde',
    features: ['Frescura garantizada', 'Cultivo sostenible', 'Producción local', 'Calidad artesanal'],
  },
  {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Pimiento_morr%C3%B3n_%28Capsicum_annuum%29.jpg/960px-Pimiento_morr%C3%B3n_%28Capsicum_annuum%29.jpg',
    name: 'Pimentón',
    desc: 'Pimentón fresco cultivado con métodos que combinan la tradición agrícola con procesos de mejora continua.',
    variety: 'Dulce',
    features: ['Sabor natural', 'Cultivo responsable', 'Producción local', 'Frescura del día'],
  },
  {
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs_uGXfDlSXxfeSFCwZ-ahFQwvZ6PL1mlbOA&s',
    name: 'Tomate',
    desc: 'Tomate fresco cultivado con prácticas sostenibles, ideal para consumo fresco y preparaciones culinarias.',
    variety: 'Rojo',
    features: ['Frescura garantizada', 'Cultivo sostenible', 'Sabor natural', 'Producción local'],
  },
  {
    image: 'https://semprecol.com/wp-content/uploads/2025/01/WhatsApp-Image-2025-01-04-at-20.44.34.jpeg',
    name: 'Ahuyama',
    desc: 'Ahuyama fresca cultivada con métodos tradicionales, de excelente calidad y sabor natural. Ideal para sopas, cremas y preparaciones saludables.',
    variety: 'Criolla',
    features: ['Cultivo tradicional', 'Sabor natural', 'Versátil en cocina', 'Alta en nutrientes'],
  },
];
