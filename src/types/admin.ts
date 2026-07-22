import type { ReactNode } from 'react';

export interface Timestamps {
  created_at: string;
  updated_at: string;
}

export interface Auditable extends Timestamps {
  created_by: string | null;
  updated_by: string | null;
}

export interface Orderable {
  order_index: number;
}

export interface Activable {
  active: boolean;
}

export interface Service extends Auditable, Orderable, Activable {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon_name: string;
  color_scheme: string;
  store_url: string | null;
}

export interface Entity extends Auditable, Orderable, Activable {
  id: string;
  name: string;
  full_name: string;
  description: string;
  icon_name: string;
  logo_url: string | null;
}

export interface ExperienceItem extends Timestamps, Orderable, Activable {
  id: string;
  text: string;
}

export interface News extends Auditable, Activable {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image_url: string | null;
  featured: boolean;
  published_at: string | null;
}

export interface Training extends Auditable, Orderable, Activable {
  id: string;
  title: string;
  description: string;
  content: string | null;
  instructor: string | null;
  modality: string;
  duration: string | null;
  schedule: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  price: number | null;
  max_participants: number | null;
  curriculum: CurriculumItem[] | null;
  requirements: string[] | null;
  certificate: boolean;
  image_url: string | null;
  brochure_url: string | null;
  featured: boolean;
}

export interface CurriculumItem {
  title: string;
  duration: string;
  topics: string[];
}

export interface Job extends Auditable, Orderable, Activable {
  id: string;
  title: string;
  type: string;
  location: string;
  description: string;
}

export interface Benefit extends Timestamps, Orderable, Activable {
  id: string;
  title: string;
  description: string;
  icon_name: string;
}

export interface JobApplication extends Timestamps {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  cedula: string | null;
  cargo: string;
  job_id: string | null;
  mensaje: string | null;
  cv_url: string | null;
  status: string;
  notes: string | null;
}

export interface ContactMessage extends Timestamps {
  id: string;
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  read: boolean;
}

export interface ContactInfo extends Timestamps, Orderable, Activable {
  id: string;
  label: string;
  value: string;
  detail: string | null;
  icon_name: string;
}

export interface HeroStat extends Timestamps, Orderable, Activable {
  id: string;
  value: string;
  label: string;
}

export interface AboutSection {
  id: string;
  section_key: string;
  title: string;
  content: string;
  order_index: number;
  active: boolean;
  updated_at: string;
  image_url: string | null;
}

export interface WhyChooseUs extends Timestamps, Orderable, Activable {
  id: string;
  icon_name: string;
  title: string;
  description: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  active: boolean;
  updated_at: string;
}

export interface SiteConfig {
  id: number;
  site_name: string;
  tagline: string;
  description: string | null;
  canonical_url: string | null;
  email: string;
  phone: string;
  address: string;
  rate_limit_contact_seconds: number;
  rate_limit_application_seconds: number;
  updated_at: string;
}

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
}

export interface ListParams {
  page: number;
  pageSize: number;
  search?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ListResult<T> {
  data: T[];
  total: number;
}

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}
