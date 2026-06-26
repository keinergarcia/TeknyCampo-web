import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export interface ContactInfo {
  icon: typeof Phone;
  title: string;
  value: string;
  detail: string;
}

export const contactInfo: ContactInfo[] = [
  {
    icon: Phone,
    title: 'Teléfono',
    value: '311 549 9784',
    detail: 'Lunes a Viernes, 8am - 6pm',
  },
  {
    icon: Mail,
    title: 'Correo electrónico',
    value: 'Teknycampos@gmail.com',
    detail: 'Respondemos en 24 horas',
  },
  {
    icon: MapPin,
    title: 'Ubicación',
    value: 'Ocaña, Norte de Santander',
    detail: 'Colombia',
  },
  {
    icon: Clock,
    title: 'Horario de atención',
    value: 'Lunes - Viernes',
    detail: '8:00 AM - 6:00 PM',
  },
];

export const contactSubjects = [
  { value: 'consulta', label: 'Consulta general' },
  { value: 'productos', label: 'Información de productos' },
  { value: 'servicios', label: 'Información de servicios' },
  { value: 'cotizacion', label: 'Solicitud de cotización' },
  { value: 'soporte', label: 'Soporte técnico' },
  { value: 'otro', label: 'Otro' },
];
