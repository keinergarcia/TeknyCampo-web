import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getProducts } from '../services/api';

export default function Products() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();
  const products = getProducts().slice(0, 3);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4">
            Nuestros Productos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Productos Destacados
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Productos agrícolas de la más alta calidad, cultivados con dedicación
            y comprometidos con la sostenibilidad del campo colombiano.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-44 sm:h-52 overflow-hidden">
                <img src={product.image} alt={product.name} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {product.variety && (
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-green-700 text-xs font-medium rounded-full">
                      {product.variety}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-green-700 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed line-clamp-3">
                  {product.desc}
                </p>
                {product.features && (
                  <ul className="space-y-1 mb-4">
                    {product.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="w-1 h-1 bg-green-500 rounded-full shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => navigate('/productos')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
                >
                  Conocer más
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
