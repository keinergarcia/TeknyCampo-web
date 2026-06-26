import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import pageBg from '../assets/images/backgrounds/hero-bg.webp';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  backTo?: string;
}

export default function PageHeader({ title, subtitle, backTo = '/' }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="relative pt-32 pb-20 overflow-hidden">
      <img src={pageBg} alt="" role="presentation" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(backTo)}
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </button>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          {title}
        </h1>
        <p className="text-lg text-white max-w-2xl drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
