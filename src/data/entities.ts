import { Building2, GraduationCap, Landmark, Users, Building, ScrollText } from 'lucide-react';

export interface Entity {
  name: string;
  fullName: string;
  description: string;
  icon: typeof Users;
}

export const entities: Entity[] = [
  {
    name: 'APRASEF',
    fullName: 'Asociación de Productores Agropecuarios Semillas del Futuro',
    description: 'Proyectos y suministros agropecuarios para el fortalecimiento de la asociación y sus productores.',
    icon: Users,
  },
  {
    name: 'Universidad Francisco de Paula Santander Ocaña',
    fullName: 'Universidad Francisco de Paula Santander Ocaña',
    description: 'Soluciones agropecuarias y acompañamiento técnico para proyectos institucionales de la UFPSO.',
    icon: GraduationCap,
  },
  {
    name: 'Alcaldía Municipal de Hacarí',
    fullName: 'Alcaldía Municipal de Hacarí',
    description: 'Suministros e insumos para proyectos de desarrollo rural en el municipio de Hacarí.',
    icon: Landmark,
  },
  {
    name: 'Asociación de Municipios del Catatumbo',
    fullName: 'Asociación de Municipios del Catatumbo',
    description: 'Proyectos conjuntos de desarrollo agropecuario para la región del Catatumbo.',
    icon: Building,
  },
  {
    name: 'Alianza Fiduciaria S.A.',
    fullName: 'Alianza Fiduciaria S.A.',
    description: 'Suministros institucionales para el sector agropecuario.',
    icon: ScrollText,
  },
  {
    name: 'Cámara de Comercio de Ocaña',
    fullName: 'Cámara de Comercio de Ocaña',
    description: 'Acompañamiento y soluciones para el sector agropecuario regional.',
    icon: Building2,
  },
];

export const experienceItems = [
  'Experiencia en proyectos agropecuarios',
  'Acompañamiento técnico especializado',
  'Soluciones integrales para el campo',
  'Cumplimiento y responsabilidad',
  'Innovación y tecnología aplicada al agro',
  'Compromiso con las comunidades rurales',
];
