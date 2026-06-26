import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, Tag, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNews } from '../services/api';
import PageHeader from '../components/PageHeader';

export default function NoticiasPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();
  const news = getNews();

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Noticias y Novedades"
        subtitle="Mantente al dÃ­a con las novedades, eventos y logros de COOPROMU y el sector agrÃ­cola."
      />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
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
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-green-700 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                  {item.excerpt || item.content.substring(0, 150)}
                </p>
                <button onClick={() => navigate(`/noticias/${item.id}`)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors group/btn"
                >
                  Leer más
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

    </div>
  );
}
