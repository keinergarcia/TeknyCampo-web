import { Wheat, Sprout, Beef, GraduationCap } from 'lucide-react';

export interface Service {
  id: string;
  icon: typeof Wheat;
  title: string;
  description: string;
  features: string[];
  color: string;
  iconBg: string;
}

export const services: Service[] = [
  {
    id: 'insumos',
    icon: Wheat,
    title: 'Insumos Agropecuarios',
    description: 'Ofrecemos una amplia gama de insumos de alta calidad para el sector agropecuario, incluyendo fertilizantes, semillas certificadas, productos veterinarios, nutrición animal y herramientas especializadas.',
    features: ['Fertilizantes orgánicos y químicos', 'Semillas certificadas', 'Productos veterinarios', 'Nutrición animal', 'Herramientas e implementos'],
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-100',
  },
  {
    id: 'agricolas',
    icon: Sprout,
    title: 'Soluciones Agrícolas',
    description: 'Desarrollamos soluciones tecnológicas para la agricultura: sistemas de riego, manejo de cultivos, asistencia técnica y fertilización para optimizar la productividad del campo.',
    features: ['Sistemas de riego', 'Manejo de cultivos', 'Asistencia técnica', 'Fertilización y productividad'],
    color: 'bg-green-50 text-green-700 border-green-200',
    iconBg: 'bg-green-100',
  },
  {
    id: 'ganaderas',
    icon: Beef,
    title: 'Soluciones Ganaderas',
    description: 'Brindamos soluciones integrales para la ganadería: alimentación animal, manejo sanitario, suplementación y mejoramiento productivo para maximizar la producción.',
    features: ['Alimentación animal', 'Manejo sanitario', 'Suplementación', 'Mejoramiento productivo'],
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    iconBg: 'bg-orange-100',
  },
  {
    id: 'capacitacion',
    icon: GraduationCap,
    title: 'Capacitación y Acompañamiento',
    description: 'Formamos y acompañamos a agricultores y ganaderos con programas de formación técnica, fortalecimiento rural, asesoría agropecuaria y acompañamiento productivo.',
    features: ['Formación técnica', 'Fortalecimiento rural a productores', 'Asesoría agropecuaria', 'Acompañamiento'],
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
  },
];
