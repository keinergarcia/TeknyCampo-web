import proyectosImg from '../assets/images/news/proyectos-catatumbo.svg';
import capacitacionImg from '../assets/images/news/capacitacion-tecnica.svg';
import riegosImg from '../assets/images/news/riegos-eficientes.svg';
import desarrolloImg from '../assets/images/news/desarrollo-rural-ocana.svg';
import alianzasImg from '../assets/images/news/alianzas-estrategicas.svg';
import nutricionImg from '../assets/images/news/nutricion-animal.svg';

export interface NewsItem {
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  author: string;
  category: string;
  image: string;
  featured?: boolean;
}

export const newsItems: NewsItem[] = [
  {
    title: 'Tekny Campo participa en proyectos de desarrollo rural en el Catatumbo',
    excerpt: 'Nuestro equipo continúa trabajando junto a asociaciones y entidades públicas en proyectos que fortalecen la productividad agrícola de la región del Catatumbo.',
    content: 'Tekny Campo Soluciones Agropecuarias ha venido desarrollando importantes proyectos de acompañamiento técnico y suministro de insumos en la región del Catatumbo, trabajando de la mano con asociaciones de productores y entidades gubernamentales para fortalecer el desarrollo rural sostenible.',
    date: '15 de Junio, 2026',
    author: 'Equipo Tekny Campo',
    category: 'Proyectos',
    image: proyectosImg,
    featured: true,
  },
  {
    title: 'Importancia de la capacitación técnica en el sector agropecuario',
    excerpt: 'En Tekny Campo promovemos la formación técnica de productores rurales como herramienta clave para mejorar la productividad y sostenibilidad del campo.',
    content: 'La capacitación técnica es fundamental para el desarrollo del sector agropecuario. En Tekny Campo ofrecemos programas de formación y acompañamiento que permiten a los productores adquirir conocimientos actualizados sobre buenas prácticas agrícolas, manejo de cultivos y nutrición animal.',
    date: '10 de Junio, 2026',
    author: 'Comunicaciones Tekny',
    category: 'Capacitación',
    image: capacitacionImg,
    featured: false,
  },
  {
    title: 'Sistemas de riego eficiente para pequeños y medianos productores',
    excerpt: 'Conoce las soluciones de riego que ofrecemos para optimizar el uso del agua y mejorar los rendimientos en cultivos de la región.',
    content: 'El acceso a sistemas de riego eficiente es clave para mejorar la productividad agrícola. En Tekny Campo ofrecemos soluciones adaptadas a las necesidades de pequeños y medianos productores, contribuyendo al uso responsable del agua y al aumento de los rendimientos.',
    date: '5 de Junio, 2026',
    author: 'Equipo Técnico Tekny',
    category: 'Tecnología',
    image: riegosImg,
    featured: false,
  },
  {
    title: 'Tekny Campo y su compromiso con el desarrollo rural en Ocaña',
    excerpt: 'Desde Ocaña, Norte de Santander, seguimos trabajando por el fortalecimiento del sector agropecuario regional.',
    content: 'Con sede en Ocaña, Norte de Santander, Tekny Campo reafirma su compromiso con el desarrollo del sector agropecuario regional, brindando soluciones integrales y acompañamiento técnico a productores y comunidades rurales.',
    date: '1 de Junio, 2026',
    author: 'Equipo Tekny Campo',
    category: 'Regional',
    image: desarrolloImg,
    featured: false,
  },
  {
    title: 'Alianza estratégica con asociaciones de productores del Catatumbo',
    excerpt: 'Fortalecimiento de alianzas con asociaciones como APRASEF para impulsar el desarrollo agropecuario en la región.',
    content: 'Tekny Campo ha establecido importantes alianzas con asociaciones de productores como APRASEF (Asociación de Productores Agropecuarios Semillas del Futuro), contribuyendo al fortalecimiento técnico y productivo de sus asociados mediante suministro de insumos y acompañamiento especializado.',
    date: '28 de Mayo, 2026',
    author: 'Dirección Comercial',
    category: 'Alianzas',
    image: alianzasImg,
    featured: false,
  },
  {
    title: 'Beneficios de la nutrición animal en la producción ganadera',
    excerpt: 'Conoce las mejores prácticas en alimentación y suplementación animal para mejorar la productividad de tu ganado.',
    content: 'Una adecuada nutrición animal es esencial para garantizar la salud del ganado y la calidad de los productos derivados. En Tekny Campo ofrecemos soluciones en alimentación, suplementación y manejo sanitario para maximizar la producción.',
    date: '20 de Mayo, 2026',
    author: 'Equipo Técnico',
    category: 'Educación',
    image: nutricionImg,
    featured: false,
  },
];
