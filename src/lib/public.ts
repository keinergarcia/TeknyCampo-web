import {
  Wheat, Sprout, Beef, GraduationCap, Leaf, Trees, Droplets, Sun,
  Users, Landmark, Building, ScrollText, Building2 as Building2Icon,
  Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin,
  Target, Eye, Flag, Heart, Award, TrendingUp,
  HelpCircle, type LucideIcon,
} from 'lucide-react';
import { supabase } from './supabase';
import { getPublicImageUrl } from './storage';
import type { Service as AdminService, Entity as AdminEntity, ExperienceItem as AdminExperience, News as AdminNews, ContactInfo as AdminContactInfo, SocialLink as AdminSocialLink } from '../types/admin';

export interface PublicService {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  color: string;
  iconBg: string;
  storeUrl: string;
}

export interface PublicEntity {
  id: string;
  name: string;
  fullName: string;
  description: string;
  icon: LucideIcon;
}

export interface PublicNews {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  image: string;
  featured: boolean;
}

export interface PublicContactInfo {
  id: string;
  icon: LucideIcon;
  title: string;
  value: string;
  detail: string | null;
}

export interface PublicSocialLink {
  platform: string;
  url: string;
  icon: LucideIcon;
}

export const contactSubjects = [
  { value: 'consulta', label: 'Consulta general' },
  { value: 'productos', label: 'Información de productos' },
  { value: 'servicios', label: 'Información de servicios' },
  { value: 'cotizacion', label: 'Solicitud de cotización' },
  { value: 'soporte', label: 'Soporte técnico' },
  { value: 'otro', label: 'Otro' },
];

const ICON_MAP: Record<string, LucideIcon> = {
  Wheat, Sprout, Beef, GraduationCap, Leaf, Trees, Droplets, Sun,
  Users, Landmark, Building, ScrollText, Building2: Building2Icon,
  Heart, Award, TrendingUp,
};

export const ABOUT_ICON_MAP: Record<string, LucideIcon> = {
  historia: Clock,
  mision: Target,
  vision: Eye,
  objetivos: Flag,
  valores: Heart,
};

const COLOR_MAP: Record<string, { color: string; iconBg: string }> = {
  amber:  { color: 'bg-amber-50 text-amber-700 border-amber-200',  iconBg: 'bg-amber-100' },
  green:  { color: 'bg-green-50 text-green-700 border-green-200',  iconBg: 'bg-green-100' },
  orange: { color: 'bg-orange-50 text-orange-700 border-orange-200', iconBg: 'bg-orange-100' },
  blue:   { color: 'bg-blue-50 text-blue-700 border-blue-200',    iconBg: 'bg-blue-100' },
};

function mapService(row: AdminService): PublicService {
  const Icon = ICON_MAP[row.icon_name] || HelpCircle;
  const colors = COLOR_MAP[row.color_scheme] || COLOR_MAP.amber;
  return { id: row.id, icon: Icon, title: row.title, description: row.description, features: row.features, storeUrl: row.store_url || '/tienda', ...colors };
}

export async function getServices(): Promise<PublicService[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('services').select('*').eq('active', true).order('order_index', { ascending: true });
  if (error) { console.error('[public] Error fetching services:', error); return []; }
  return (data ?? []).map(mapService);
}

function mapEntity(row: AdminEntity): PublicEntity {
  const Icon = ICON_MAP[row.icon_name] || HelpCircle;
  return { id: row.id, name: row.name, fullName: row.full_name, description: row.description, icon: Icon };
}

export async function getEntities(): Promise<PublicEntity[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('entities').select('*').eq('active', true).order('order_index', { ascending: true });
  if (error) { console.error('[public] Error fetching entities:', error); return []; }
  return (data ?? []).map(mapEntity);
}

export async function getExperienceItems(): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('experience_items').select('*').eq('active', true).order('order_index', { ascending: true });
  if (error) { console.error('[public] Error fetching experience_items:', error); return []; }
  return (data ?? []).map((row: AdminExperience) => row.text);
}

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function formatNewsDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = MONTHS_ES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} de ${month.charAt(0).toUpperCase()}${month.slice(1)}, ${year}`;
}

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22400%22 fill=%22%23e2e8f0%22/%3E';

function mapNews(row: AdminNews): PublicNews {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    date: formatNewsDate(row.published_at ?? row.created_at),
    author: row.author,
    category: row.category,
    image: row.image_url ? getPublicImageUrl(row.image_url) : PLACEHOLDER_IMAGE,
    featured: row.featured,
  };
}

export async function getNews(): Promise<PublicNews[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('active', true)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false });
  if (error) { console.error('[public] Error fetching news:', error); return []; }
  return (data ?? []).map(mapNews);
}

const ICON_CONTACT_MAP: Record<string, LucideIcon> = {
  Phone, Mail, MapPin, Clock,
};

const SOCIAL_ICON_MAP: Record<string, LucideIcon> = {
  facebook: Facebook, instagram: Instagram, linkedin: Linkedin,
};

function mapContactInfo(row: AdminContactInfo): PublicContactInfo {
  const Icon = ICON_CONTACT_MAP[row.icon_name] || HelpCircle;
  return { id: row.id, icon: Icon, title: row.label, value: row.value, detail: row.detail };
}

export async function getContactInfo(): Promise<PublicContactInfo[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('contact_info')
    .select('*')
    .eq('active', true)
    .order('order_index', { ascending: true });
  if (error) { console.error('[public] Error fetching contact_info:', error); return []; }
  return (data ?? []).map(mapContactInfo);
}

function mapSocialLink(row: AdminSocialLink): PublicSocialLink {
  const Icon = SOCIAL_ICON_MAP[row.platform] || HelpCircle;
  return { platform: row.platform, url: row.url, icon: Icon };
}

export async function getSocialLinks(): Promise<PublicSocialLink[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .eq('active', true);
  if (error) { console.error('[public] Error fetching social_links:', error); return []; }
  return (data ?? []).map(mapSocialLink);
}

export interface PublicHeroStat {
  value: string;
  label: string;
}

export async function getHeroStats(): Promise<PublicHeroStat[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('hero_stats')
    .select('value, label')
    .eq('active', true)
    .order('order_index', { ascending: true });
  if (error) { console.error('[public] Error fetching hero_stats:', error); return []; }
  return data ?? [];
}

export interface PublicAboutSection {
  id: string;
  sectionKey: string;
  title: string;
  content: string;
  orderIndex: number;
  icon: LucideIcon;
  imageUrl: string | null;
}

export interface PublicWhyChooseUs {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export async function getAboutSections(): Promise<PublicAboutSection[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('about_sections')
    .select('*')
    .eq('active', true)
    .order('order_index', { ascending: true });
  if (error) { console.error('[public] Error fetching about_sections:', error); return []; }
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    sectionKey: row.section_key as string,
    title: row.title as string,
    content: row.content as string,
    orderIndex: row.order_index as number,
    icon: ABOUT_ICON_MAP[row.section_key as string] || HelpCircle,
    imageUrl: (row.image_url as string) || null,
  }));
}

export async function getWhyChooseUs(): Promise<PublicWhyChooseUs[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('why_choose_us')
    .select('id, icon_name, title, description')
    .eq('active', true)
    .order('order_index', { ascending: true });
  if (error) { console.error('[public] Error fetching why_choose_us:', error); return []; }
  return (data ?? []).map((row) => ({
    id: row.id,
    icon: ICON_MAP[row.icon_name] || HelpCircle,
    title: row.title,
    description: row.description,
  }));
}

export interface PublicJob {
  id: string;
  title: string;
  type: string;
  location: string;
  description: string;
}

export interface PublicBenefit {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export async function getJobs(): Promise<PublicJob[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('jobs')
    .select('id, title, type, location, description')
    .eq('active', true)
    .order('order_index', { ascending: true });
  if (error) { console.error('[public] Error fetching jobs:', error); return []; }
  return data ?? [];
}

export async function getBenefits(): Promise<PublicBenefit[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('benefits')
    .select('id, icon_name, title, description')
    .eq('active', true)
    .order('order_index', { ascending: true });
  if (error) { console.error('[public] Error fetching benefits:', error); return []; }
  return (data ?? []).map((row) => ({
    id: row.id,
    icon: ICON_MAP[row.icon_name] || HelpCircle,
    title: row.title,
    description: row.description,
  }));
}

export async function submitJobApplication(data: {
  nombre: string;
  email: string;
  telefono: string;
  cedula: string;
  cargo: string;
  mensaje: string;
  archivo?: File | null;
  honeypot?: string;
}): Promise<{ error: Error | null }> {
  if (!supabase) return { error: null };

  let cvUrl: string | null = null;

  if (data.archivo) {
    const fileName = `cvs/${Date.now()}_${data.archivo.name}`;
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, data.archivo, { upsert: true });

    if (uploadError) {
      return { error: uploadError as unknown as Error };
    }

    cvUrl = fileName;
  }

  const { error } = await supabase.from('job_applications').insert([{
    nombre: data.nombre,
    email: data.email,
    telefono: data.telefono,
    cedula: data.cedula || null,
    cargo: data.cargo,
    mensaje: data.mensaje,
    cv_url: cvUrl,
    honeypot: data.honeypot || '',
  }]);

  if (error) return { error: error as unknown as Error };
  return { error: null };
}

export async function submitContactMessage(data: {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  honeypot?: string;
}): Promise<{ error: Error | null }> {
  if (!supabase) return { error: null };
  const { error } = await supabase.from('contact_messages').insert([{ ...data, honeypot: data.honeypot || '' }]);
  if (error) return { error: error as unknown as Error };
  return { error: null };
}

export interface PublicTraining {
  id: string;
  title: string;
  description: string;
  instructor: string | null;
  modality: string;
  duration: string | null;
  schedule: string | null;
  location: string | null;
  price: number | null;
  max_participants: number | null;
  requirements: string[] | null;
  certificate: boolean;
  image_url: string;
  featured: boolean;
}

export async function getTrainings(): Promise<PublicTraining[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('trainings')
    .select('id, title, description, instructor, modality, duration, schedule, location, price, max_participants, requirements, certificate, image_url, featured')
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('order_index', { ascending: true });
  if (error) { console.error('[public] Error fetching trainings:', error); return []; }
  return (data ?? []).map((row) => ({
    ...row,
    image_url: row.image_url ? getPublicImageUrl(row.image_url) : PLACEHOLDER_IMAGE,
  }));
}

export async function submitTrainingApplication(data: {
  nombre: string;
  email: string;
  telefono: string;
  trainingTitle: string;
  mensaje: string;
  honeypot?: string;
}): Promise<{ error: Error | null }> {
  if (!supabase) return { error: null };
  const { error } = await supabase.from('contact_messages').insert([{
    nombre: data.nombre,
    email: data.email,
    asunto: `Inscripción Capacitación: ${data.trainingTitle}`,
    mensaje: `Teléfono: ${data.telefono}\n\n${data.mensaje}`,
    honeypot: data.honeypot || '',
  }]);
  if (error) return { error: error as unknown as Error };
  return { error: null };
}
