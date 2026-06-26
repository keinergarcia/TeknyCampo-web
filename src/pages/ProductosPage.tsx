import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';
import PageHeader from '../components/PageHeader';

const categories = [
  { name: 'Hortalizas', products: ['Cebolla Roja Cabezona', 'Tomate', 'Pimentón', 'Habichuela', 'Ahuyama'] },
  { name: 'Frutas y Huevos', products: ['Aguacate', 'Huevos Frescos'] },
  { name: 'Granos y Legumbres', products: ['Frijol Rosado'] },
];

export default function ProductosPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();
  const products = getProducts();

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Productos Agrícolas"
        subtitle="Calidad y frescura directamente del campo a tu mesa. Productos cultivados por agricultores colombianos."
      />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categories.map((category, catIndex) => (
          <div key={catIndex} className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products
                .filter(p => category.products.includes(p.name))
                .map((product, index) => (
                  <motion.div
                    key={product.name}
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: (catIndex * 0.2) + index * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row"
                  >
                    <div className="sm:w-48 h-48 sm:h-auto overflow-hidden shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                        {product.variety && (
                          <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full shrink-0">
                            {product.variety}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 flex-1">{product.desc}</p>
                      {product.features && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {product.features.slice(0, 3).map((f) => (
                            <span key={f} className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded-full border border-slate-200">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-green-800 rounded-2xl p-8 sm:p-10 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">¿Interesado en comprar nuestros productos?</h3>
          <p className="text-green-200 mb-6 max-w-xl mx-auto">
            Contáctenos para conocer precios, disponibilidad y condiciones de entrega.
          </p>
          <button
            onClick={() => navigate('/contacto')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-800 font-semibold rounded-xl hover:bg-green-50 transition-colors shadow-lg"
          >
            Contactar
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
