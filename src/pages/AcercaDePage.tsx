import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sprout, ArrowLeft, Heart } from 'lucide-react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { getAboutSections } from '../lib/public';
import { getPublicImageUrl } from '../lib/storage';
import type { PublicAboutSection } from '../lib/public';
import { ABOUT_ICON_MAP } from '../lib/public';
import pageBg from '../assets/images/backgrounds/hero-bg.webp';

const SECTION_LABELS: Record<string, string> = {
  historia: 'Historia',
  mision: 'Misión',
  vision: 'Visión',
  objetivos: 'Objetivo General',
  valores: 'Valores Corporativos',
};

const SECTION_COLORS: Record<string, string> = {
  historia: 'from-amber-500 to-orange-600',
  mision: 'from-blue-500 to-indigo-600',
  vision: 'from-purple-500 to-violet-600',
  objetivos: 'from-emerald-500 to-green-600',
  valores: 'from-rose-500 to-pink-600',
};

function renderContent(section: PublicAboutSection) {
  const imageUrl = section.imageUrl ? getPublicImageUrl(section.imageUrl) : null;

  if (section.sectionKey === 'valores') {
    const items = section.content.split('\n').filter(Boolean);
    const cards = items.map((item, i) => {
      const colonIdx = item.indexOf(': ');
      if (colonIdx > 0) {
        const label = item.slice(0, colonIdx);
        const desc = item.slice(colonIdx + 2);
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center mb-3">
              <Heart className="w-5 h-5 text-rose-600" />
            </div>
            <h2 className="font-bold text-slate-900 mb-1">{label}</h2>
            <p className="text-sm text-slate-600">{desc}</p>
          </motion.div>
        );
      }
      return (
        <div key={i} className="bg-white rounded-xl p-5 border border-slate-100">
          <p className="text-slate-700">{item}</p>
        </div>
      );
    });

    if (imageUrl) {
      return (
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full md:w-[45%] shrink-0"
          >
            <div className="flex items-center justify-center bg-gray-50 rounded-xl shadow-md p-2">
              <img src={imageUrl} alt="" loading="lazy" className="max-w-full max-h-[60vh] w-auto h-auto object-contain rounded-lg" />
            </div>
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{cards}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{cards}</div>
    );
  }

  const paragraphs = section.content.split('\n\n').filter(Boolean);

  if (imageUrl) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full md:w-[45%] shrink-0"
          >
            <div className="flex items-center justify-center bg-gray-50 rounded-xl shadow-md p-2">
              <img src={imageUrl} alt="" loading="lazy" className="max-w-full max-h-[60vh] w-auto h-auto object-contain rounded-lg" />
            </div>
          </motion.div>
          <div className="flex-1 min-w-0 space-y-6">
            {paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-slate-600 leading-relaxed text-lg"
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {paragraphs.map((p, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.15 }}
          className="text-slate-600 leading-relaxed text-lg"
        >
          {p}
        </motion.p>
      ))}
    </div>
  );
}

export default function AcercaDePage() {
  const { section } = useParams<{ section: string }>();
  const [sections, setSections] = useState<PublicAboutSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getAboutSections().then((data) => {
      if (!mounted) return;
      setSections(data);
      setLoading(false);
    }).catch(() => {
      if (!mounted) return;
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  if (!section || !SECTION_LABELS[section]) {
    return <Navigate to="/" replace />;
  }

  const currentSection = sections.find((s) => s.sectionKey === section);
  const SectionIcon = ABOUT_ICON_MAP[section] || Sprout;
  const gradient = SECTION_COLORS[section] || 'from-green-500 to-green-600';

  const seoTitle = SECTION_LABELS[section] || section;
  const seoDescriptions: Record<string, string> = {
    historia: 'Conoce la historia de Tekny Campo Soluciones Agropecuarias, una empresa comprometida con el desarrollo del sector agropecuario colombiano.',
    mision: 'Nuestra misión: brindar soluciones tecnológicas, insumos, capacitación y acompañamiento técnico para el campo colombiano.',
    vision: 'Nuestra visión: ser líderes en soluciones agropecuarias innovadoras y sostenibles en Colombia, transformando el sector rural.',
    objetivos: 'Objetivo general de Tekny Campo: fortalecer la productividad y sostenibilidad del campo colombiano con soluciones integrales.',
    valores: 'Valores corporativos de Tekny Campo: compromiso, responsabilidad, innovación y trabajo en equipo por el desarrollo rural.',
  };
  const seoDescription = seoDescriptions[section] || 'Conoce más sobre Tekny Campo Soluciones Agropecuarias.';

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
      />
      <div className="min-h-screen bg-slate-50">
      <div className="relative pt-32 pb-16 overflow-hidden bg-gray-900 min-h-[200px] sm:min-h-[280px] md:min-h-[340px] lg:min-h-[400px] xl:min-h-[480px]">
        <img src={pageBg} alt="" className="absolute inset-0 w-full h-full object-cover object-[5%_55%] sm:object-[10%_55%] md:object-[15%_50%] lg:object-[25%_40%] xl:object-[35%_35%]" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
              <SectionIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)' }}>
                {SECTION_LABELS[section]}
              </h1>
              {currentSection && (
                <p className="text-green-200 text-sm">Tekny Campo Soluciones Agropecuarias</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
        {loading && (
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        )}

        {!loading && !currentSection && (
          <div className="text-center py-20">
            <Sprout className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Contenido no disponible</h2>
            <p className="text-slate-500">Esta sección está siendo actualizada.</p>
            <Link to="/" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors">
              Volver al inicio
            </Link>
          </div>
        )}

        {!loading && currentSection && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative bg-white rounded-2xl p-8 lg:p-12 shadow-xl border border-green-200/50"
            >
              {renderContent(currentSection)}
            </motion.div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}