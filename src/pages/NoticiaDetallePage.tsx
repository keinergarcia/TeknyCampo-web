import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';
import { getNewsById } from '../services/api';
import pageBg from '../assets/images/backgrounds/hero-bg.webp';

export default function NoticiaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const newsItem = id ? getNewsById(id) : undefined;

  if (!newsItem) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Noticia no encontrada</h2>
          <p className="text-slate-600 mb-6">La noticia que buscas no existe o ha sido eliminada.</p>
          <button onClick={() => navigate('/noticias')}
            className="px-6 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors">
            Volver a noticias
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative pt-32 pb-20 overflow-hidden">
        <img src={pageBg} alt="" role="presentation" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/noticias')} className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Volver a noticias
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">{newsItem.title}</h1>
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {newsItem.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {newsItem.date}
            </span>
          </div>
        </div>
      </div>

      <div ref={ref} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100"
        >
          <div className="h-56 sm:h-72 md:h-96 overflow-hidden">
            <img src={newsItem.image} alt={newsItem.title} className="w-full h-full object-cover" />
          </div>
          <div className="p-8 sm:p-10">
            {newsItem.excerpt && (
              <p className="text-lg text-slate-700 font-medium mb-6 leading-relaxed">{newsItem.excerpt}</p>
            )}
            <div className="text-slate-600 leading-relaxed whitespace-pre-line">
              {newsItem.content}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-8 pt-6 border-t border-slate-100">
              <User className="w-4 h-4" />
              COOPROMU
            </div>
            {newsItem.url && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <a
                  href={newsItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors text-sm"
                >
                  Ver fuente original
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
