import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { getEntities, getExperienceItems } from '../lib/public';
import type { PublicEntity } from '../lib/public';
import pageBg from '../assets/images/backgrounds/hero-bg.webp';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 animate-pulse">
      <div className="w-14 h-14 bg-gray-200 rounded-xl mb-4" />
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-full mb-1" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  );
}

function ExperienceSkeleton() {
  return (
    <div className="bg-green-800 rounded-2xl p-8 animate-pulse">
      <div className="h-7 bg-green-700 rounded w-48 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="h-4 bg-green-700 rounded w-3/4" />
        <div className="h-4 bg-green-700 rounded w-2/3" />
        <div className="h-4 bg-green-700 rounded w-4/5" />
        <div className="h-4 bg-green-700 rounded w-1/2" />
        <div className="h-4 bg-green-700 rounded w-3/4" />
        <div className="h-4 bg-green-700 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [entities, setEntities] = useState<PublicEntity[]>([]);
  const [experience, setExperience] = useState<string[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(true);
  const [loadingExperience, setLoadingExperience] = useState(true);
  const [errorEntities, setErrorEntities] = useState<string | null>(null);
  const [errorExperience, setErrorExperience] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getEntities().then((data) => {
      if (!mounted) return;
      setEntities(data);
      setLoadingEntities(false);
    }).catch((e) => {
      if (!mounted) return;
      setErrorEntities(e.message);
      setLoadingEntities(false);
    });
    getExperienceItems().then((data) => {
      if (!mounted) return;
      setExperience(data);
      setLoadingExperience(false);
    }).catch((e) => {
      if (!mounted) return;
      setErrorExperience(e.message);
      setLoadingExperience(false);
    });
    return () => { mounted = false; };
  }, []);

  const showEntities = !errorEntities && entities.length > 0;
  const showExperience = !errorExperience && experience.length > 0;

  return (
    <>
      <SEO
        title="Experiencia"
        description="Conoce nuestra experiencia y las entidades que confían en Tekny Campo. Proyectos agropecuarios, alianzas estratégicas y resultados."
        canonical="https://teknycampo.com/productos"
      />
      <div className="min-h-screen bg-slate-50">
      <div className="relative pt-32 pb-20 min-h-[320px] overflow-hidden">
        <img src={pageBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)' }}>Nuestra Experiencia</h1>
          <p className="text-lg text-white max-w-2xl" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)' }}>
            Hemos ejecutado proyectos y suministros para entidades públicas, privadas y organizaciones del sector agropecuario.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20">
        <div ref={ref} className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Entidades destacadas</h2>
          {loadingEntities && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}
          {showEntities && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {entities.map((entity, index) => (
                <motion.div
                  key={entity.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                  <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-green-200/50 transition-all duration-300">
                    <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                      <entity.icon className="w-7 h-7 text-green-700" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{entity.fullName}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{entity.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {loadingExperience && <ExperienceSkeleton />}
        {showExperience && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-green-300 via-emerald-400 to-teal-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
            <div className="relative bg-green-800 rounded-2xl p-8 text-white shadow-xl border border-green-600/30">
              <h2 className="text-2xl font-bold mb-6">¿Por qué elegirnos?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {experience.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300 shrink-0" />
                    <span className="text-green-100 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
    </>
  );
}
