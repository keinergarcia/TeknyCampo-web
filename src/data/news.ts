export interface NewsItem {
  id: string;
  image: string;
  title: string;
  date: string;
  category: string;
  content: string;
  excerpt?: string;
  url?: string;
}

export const news: NewsItem[] = [
  {
    id: 'proyecto-productivo-cebolla-catatumbo',
    image: 'https://suresnoticia.com/wp-content/uploads/2024/07/IMG-20240726-WA0289-800x445.jpg',
    title: 'Con proyecto productivo por $20.500 millones, Gobierno nacional les cumple a productores de cebolla del Catatumbo',
    date: '26 de Julio, 2024',
    category: 'Institucional',
    content: 'En tan solo cinco meses desde el diálogo entre el Gobierno nacional y los cultivadores de cebolla roja ocañera del departamento de Norte de Santander, la Agencia de Desarrollo Rural (ADR) estructuró un proyecto productivo por un valor superior a los 20.500 millones de pesos. De este monto, la ADR cofinancia 10.840 millones. Este proyecto beneficiará directamente a 870 productores y productoras de cebolla en bulbo, abarcando igual número de hectáreas pertenecientes a la Asociación ASUNCAT y la Cooperativa de productores municipales COOPROMU. Gracias a la Resolución 436 de 2024, el Proyecto Integral de Desarrollo Agropecuario y Rural (PIDAR), de carácter Estratégico Nacional, ha sido aprobado y se denomina "Fortalecimiento de las Capacidades Técnicas, Socioorganizacionales y Comerciales de los Productores de Cebolla de 8 Municipios de la Región del Catatumbo". Este ambicioso proyecto incluye la entrega de equipos, maquinaria, herramientas e insumos para el cultivo, que facilitan la mecanización y tecnificación de la producción de cebolla. Entre los equipos entregados se encuentran 292 motocultores, 735 fumigadoras, 91 guadañas, 89 ventiladores industriales y otros insumos químicos e industriales. La respuesta del Gobierno a la crisis de los cultivadores de cebolla es un reflejo de la voluntad política del presidente de la Agencia de Desarrollo Rural, Luis Alberto Higuera, quien se comprometió a buscar soluciones rápidas y efectivas a las legítimas demandas de los productores. Para ello conformó un equipo de profesionales dedicados a la estructuración y rápida implementación de este proyecto. La ADR es la primera entidad gubernamental en responder a las demandas de los productores de cebolla, planteadas durante el paro del pasado enero. Junto con la Agencia de Renovación del Territorio (ART), la ADR ha abordado integralmente las problemáticas sociales de las familias campesinas del Catatumbo.',
    excerpt: 'La ADR estructuró un proyecto productivo por más de $20.500 millones que beneficiará a 870 productores de cebolla de ASUNCAT y COOPROMU en el Catatumbo.',
    url: 'https://suresnoticia.com/con-proyecto-productivo-por-20-500-millones-gobierno-nacional-les-cumple-a-productores-de-cebolla-del-catatumbo/',
  },
  {
    id: 'adr-transforma-catatumbo',
    image: 'https://www.adr.gov.co/wp-content/uploads/2025/05/La-ADR-transforma-el-Catatumbo-1024x682.jpeg',
    title: 'La ADR transforma el Catatumbo: proyectos productivos y compras locales impulsan el desarrollo económico y social',
    date: '9 de Mayo, 2025',
    category: 'Institucional',
    content: 'Con la presencia del presidente de la República, Gustavo Petro, en Tibú, Norte de Santander, el presidente de la ADR, César Pachón, entregó y anunció proyectos por un valor total de $20.456 millones, reafirmando el compromiso del Gobierno del Cambio con la región del Catatumbo. En el marco del compromiso del Gobierno del Cambio con el fortalecimiento del campo colombiano, la Agencia de Desarrollo Rural (ADR) y su presidente César Pachón Achury, consolidó significativas inversiones en la región del Catatumbo, al impulsar proyectos productivos que mejoran la calidad de vida de comunidades campesinas, indígenas y firmantes de paz. El 9 de mayo de 2025, con la presencia del presidente de la República, Gustavo Petro Urrego, la ADR formalizó la entrega de un proyecto productivo al pueblo Motilón Barí, centrado en el cultivo de cacao y el establecimiento de granjas integrales. La iniciativa, con una inversión total de $8.423 millones (ADR aportó $6.639 millones), generará empleo directo e indirecto para 1.873 campesinos en los municipios de El Carmen, Teorama, Convención y Tibú. Asimismo, el presidente de la ADR entregó un proyecto al pueblo Barí Catalaura por $3.763 millones (ADR: $2.529 millones) para fortalecer la soberanía alimentaria con siembra de cacao en 105 hectáreas, beneficiando a 371 personas. En el ámbito de paz, la ADR notificó a firmantes de paz en Los Patios un proyecto de 28 hectáreas de pasturas, 37 bovinos y un vehículo para agro logística láctea, con inversión total de $1.846 millones (ADR: $1.456 millones). También notificó a ASOPROCANOR un proyecto de cacao en ocho municipios del Catatumbo por $16.250 millones (ADR: $13.000 millones) para 550 familias. Actualmente, la ADR ejecuta un proyecto de línea productiva de cebolla con ASUNCAT-RC y COOPROMU, que beneficia a productores de ocho municipios con un presupuesto de $20.594 millones.',
    excerpt: 'La ADR, con presencia del presidente Gustavo Petro, entregó proyectos por $20.456 millones en Tibú, incluyendo el proyecto de cebolla con COOPROMU en el Catatumbo.',
    url: 'https://www.adr.gov.co/la-adr-transforma-el-catatumbo-proyectos-productivos-y-compras-locales-impulsan-el-desarrollo-economico-y-social/',
  },
];
