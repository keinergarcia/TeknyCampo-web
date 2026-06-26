import type { ElementType } from 'react';
import { Egg, Flower2, Store, GraduationCap, Briefcase, Users, TreePine, Handshake } from 'lucide-react';

export interface Service {
  icon: ElementType;
  title: string;
  desc: string;
  features?: string[];
  image?: string;
}

export const services: Service[] = [
  {
    icon: Egg,
    title: 'Producción Avícola Artesanal',
    desc: 'Producimos huevos frescos de alta calidad en granjas artesanales, enfocados en el bienestar de las aves y métodos sostenibles.',
    features: ['Granjas artesanales', 'Bienestar animal', 'Alta calidad', 'Métodos sostenibles'],
    image: 'https://www.ica.gov.co/getattachment/5a3ceb2c-3414-4a99-a262-798adae23485/ICA-MEDIDAS-BIOSEGURIDAD-AVICOLAS.aspx',
  },
  {
    icon: Flower2,
    title: 'Producción Agrícola Sostenible',
    desc: 'Cultivamos cebolla, frijol, habichuela y pimentón combinando métodos ancestrales con procesos de tecnificación moderna.',
    features: ['Métodos ancestrales', 'Tecnificación progresiva', 'Cultivos variados', 'Enfoque sostenible'],
    image: 'https://www.radioangulo.cu/wp-content/uploads/2025/02/post-agricultura-sostenible.webp',
  },
  {
    icon: Store,
    title: 'Comercialización de Productos Locales',
    desc: 'Facilitamos la venta y distribución de productos agrícolas locales, promoviendo el consumo responsable y el mercadeo directo.',
    features: ['Mercadeo directo', 'Consumo responsable', 'Precios justos', 'Productos locales'],
    image: 'https://shopandroll.com/wp-content/uploads/comercio-local.jpg',
  },
  {
    icon: GraduationCap,
    title: 'Educación y Capacitación',
    desc: 'Programas de formación continua para nuestros asociados en planificación estratégica, cultura cooperativa y prácticas sostenibles.',
    features: ['Educación continua', 'Cultura cooperativa', 'Planificación estratégica', 'Talleres prácticos'],
    image: 'https://www.cali.gov.co/info/caligovco_se/media/pubInt/thumbs/thpubInt_700X400_188494.webp',
  },
  {
    icon: Briefcase,
    title: 'Planificación y Asesoría',
    desc: 'Acompañamiento profesional en la planificación de producción, comercialización y desarrollo de proyectos agrícolas.',
    features: ['Asesoría técnica', 'Planificación estratégica', 'Acompañamiento integral', 'Desarrollo de proyectos'],
    image: 'https://tactica-consulting.com/wp-content/uploads/2021/10/banner-asesoria-planeacion-y-consultoria-tributaria.jpg',
  },
  {
    icon: Users,
    title: 'Fomento del Consumo Responsable',
    desc: 'Promovemos el consumo consciente y responsable como parte de nuestro compromiso con el desarrollo sostenible de la comunidad.',
    features: ['Consumo consciente', 'Desarrollo sostenible', 'Compromiso social', 'Fomento ambiental'],
    image: 'https://www.bbva.com/wp-content/uploads/2020/01/BBVA-Compra-Ecologia-17012020.jpg',
  },
  {
    icon: TreePine,
    title: 'Fomento Ambiental',
    desc: 'Nos comprometemos con el cuidado del medio ambiente a través de prácticas agrícolas sostenibles y programas de conservación.',
    features: ['Prácticas sostenibles', 'Conservación ambiental', 'Producción ecológica', 'Conciencia verde'],
    image: 'https://www.bbva.com/wp-content/uploads/2021/03/Portada.jpg',
  },
  {
    icon: Handshake,
    title: 'Cooperación y Gestión Democrática',
    desc: 'Fomentamos la participación activa de todos los asociados en la toma de decisiones bajo principios de gestión democrática.',
    features: ['Gestión democrática', 'Adhesión voluntaria', 'Participación activa', 'Trabajo colectivo'],
    image: 'https://elpostantillano.net/images/stories/cooperativismo.jpg',
  },
];
