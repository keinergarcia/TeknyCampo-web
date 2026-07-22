import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { getNews } from '../lib/public';
import type { PublicNews } from '../lib/public';
import pageBg from '../assets/images/backgrounds/hero-bg.webp';

function SkeletonFeatured() {
  return (
    <div className="relative group mb-8 animate-pulse">
      <div className="absolute -inset-0.5 bg-slate-200 rounded-3xl blur opacity-30" />
      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="h-64 lg:h-auto bg-gray-200" />
          <div className="p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-6 bg-gray-200 rounded-full w-20" />
              <div className="h-4 bg-gray-200 rounded w-28" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 animate-pulse">
      <div className="relative h-48 bg-gray-200" />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-full mb-1" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
    </div>
  );
}

export default function NewsPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [news, setNews] = useState<PublicNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<PublicNews | null>(null);

  useEffect(() => {
    let mounted = true;
    getNews().then((data) => {
      if (!mounted) return;
      setNews(data);
      setLoading(false);
    }).catch((e) => {
      if (!mounted) return;
      setError(e.message);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const featured = news.find(n => n.featured) ?? news[0] ?? null;
  const otherNews = news.filter(n => n.id !== featured?.id);

  return (
    <>
      <SEO
        title="Noticias"
        description="Últimas noticias y artículos sobre el sector agropecuario colombiano. Innovación, tecnología, capacitación y desarrollo rural."
        canonical="https://teknycampo.com/noticias"
      />
      <div className="min-h-screen bg-white">
      <div className="relative pt-32 pb-20 min-h-[320px] overflow-hidden">
        <img src={pageBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)' }}>Noticias y Novedades</h1>
          <p className="text-lg text-white max-w-2xl" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)' }}>
            Mantente informado sobre las últimas tendencias, eventos y novedades del mundo agropecuario.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20">
        <div ref={ref}>
          {loading && (
            <>
              <SkeletonFeatured />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg">No pudimos cargar las noticias en este momento.</p>
              <p className="text-slate-400 text-sm mt-2">Por favor intenta de nuevo más tarde.</p>
            </div>
          )}

          {!loading && !error && news.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg">No hay noticias publicadas aún.</p>
            </div>
          )}

          {!loading && !error && featured && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative group mb-8"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-green-200/50">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="h-64 lg:h-auto overflow-hidden">
                  <img src={featured.image} alt={featured.title} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-8 lg:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold rounded-full shadow-lg">
                      {featured.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {featured.date}
                    </span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">{featured.title}</h2>
                  <p className="text-slate-600 leading-relaxed mb-4">{featured.excerpt}</p>
                  <button onClick={() => setSelectedNews(featured)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors mb-4 group/btn"
                  >
                    Leer noticia completa
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <User className="w-4 h-4" />
                    {featured.author}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!loading && !error && otherNews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherNews.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={item.image} alt={item.title} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {item.author}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-green-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">{item.excerpt}</p>
                  <button onClick={() => setSelectedNews(item)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors group/btn"
                  >
                    Leer más
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setSelectedNews(null)}
            onKeyDown={(e) => { if (e.key === 'Escape') setSelectedNews(null); }}
            role="dialog"
            aria-modal="true"
            aria-label="Detalle de noticia"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl mt-12 mb-12"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-3xl blur opacity-40" />
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
                <button
                  onClick={() => setSelectedNews(null)}
                  aria-label="Cerrar noticia"
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5 text-white" aria-hidden="true" />
                </button>
                <div className="h-56 sm:h-72 md:h-96 overflow-hidden">
                  <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-8 sm:p-12">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold rounded-full shadow-lg">
                      {selectedNews.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {selectedNews.date}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">{selectedNews.title}</h2>
                  <div className="text-slate-600 leading-relaxed">
                    <p>{selectedNews.content}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-8 pt-6 border-t border-slate-100">
                    <User className="w-4 h-4" />
                    {selectedNews.author}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
