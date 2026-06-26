import type { ElementType } from 'react';
import { Users, Heart, Handshake, BookOpen, TreePine } from 'lucide-react';

export interface CompanyValue {
  icon: ElementType;
  title: string;
  desc: string;
  image?: string;
}

export interface Statistic {
  value: string;
  label: string;
}

export const companyValues: CompanyValue[] = [
  { icon: Users, title: 'Solidaridad', desc: 'Trabajo conjunto para el beneficio colectivo de nuestra comunidad.', image: 'https://s1.significados.com/foto/solidaridad-og.jpg' },
  { icon: Heart, title: 'Compromiso', desc: 'Con el desarrollo económico y social de nuestros asociados y la comunidad.', image: 'https://panoramacatolico.com/wp-content/uploads/2021/10/P.-14-ESPIRITUALIDAD.jpg' },
  { icon: Handshake, title: 'Cooperación', desc: 'Colaboración activa con otras entidades del sector solidario.', image: 'https://scontent.feoh2-1.fna.fbcdn.net/v/t51.82787-15/714610627_18402970597157401_1278909807107964863_n.jpg?stp=dst-jpg_tt6&cstp=mx909x516&ctp=s909x516&_nc_cat=106&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeFyvZgz6XT5D0tSVEqcOGXOdiPyXH4k5eV2I_JcfiTl5elkSlibbV9Dj73DKzYcz_I0zG92twvEJcHdKmvh3ysp&_nc_ohc=4YIkKE-yU84Q7kNvwFXEdCz&_nc_oc=Adq53m64YSkuwg9A1ixoczkNHKdzjYJv4dEFUmq5Id_0Sd1Wd44tb7cHreIvE9sUeOk&_nc_zt=23&_nc_ht=scontent.feoh2-1.fna&_nc_gid=QEepVBC49wG6OL5QNLYuHg&_nc_ss=7b2a8&oh=00_Af8y4mSg3SoK-rvTshiEzd0TvSAz4DA1iy9jEZ06OdaKeA&oe=6A2FDD48' },
  { icon: BookOpen, title: 'Educación', desc: 'Capacitación continua y formación integral de nuestros miembros.', image: 'https://www.eluniverso.com/resizer/v2/56ZT5LKF35DKNDEMP2D7OBTOWM.png?auth=34db30197bc30dc647ac55a1ae96bf8fb810ab3e8fd403cc8240df03ed21eb9c&width=1029&height=670&quality=75&smart=true' },
  { icon: TreePine, title: 'Sostenibilidad', desc: 'Prácticas responsables que protegen el medio ambiente y fomentan el consumo consciente.', image: 'https://www.fundacionaquae.org/wp-content/uploads/2020/04/sostenibilidadosocial2-min.jpg' },
];

export const statistics: Statistic[] = [
  { value: '100%', label: 'Cooperativa Sin Ánimo de Lucro' },
  { value: '5+', label: 'Valores Cooperativos' },
  { value: '\u221e', label: 'Capital Variable e Ilimitado' },
  { value: '1', label: 'Compromiso: Desarrollo Comunitario' },
];
