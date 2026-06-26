import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, BarChart3, Bell, ArrowRight } from 'lucide-react';
import { getPrices, getStaticPrices } from '../services/api';
import type { PriceIndicator } from '../services/api';

export default function Indicators() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();
  const [prices, setPrices] = useState<PriceIndicator[]>(getStaticPrices());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrices()
      .then((live) => setPrices(live))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4">
            Indicadores Agrícolas
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Precios del Mercado Agrícola
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Precios de referencia del mercado agrícola colombiano según el boletín del DANE SIPSA.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-700" />
                <h3 className="text-lg font-bold text-slate-900">Precios de Productos Agrícolas</h3>
              </div>
              {loading && (
                <div className="w-5 h-5 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <div className="space-y-3">
              {prices.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{item.product}</h4>
                      <span className="text-xs text-slate-500">Precio por {item.unit}</span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-lg font-bold text-green-700">{item.price}</span>
                      {getTrendIcon(item.trend)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-xs ${item.trend === 'up' ? 'text-green-600' : item.trend === 'down' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {item.change} esta semana
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500">
                <span className="font-medium">Fuente:</span> DANE SIPSA — Boletín diario de precios mayoristas.
                Los precios son de referencia y pueden variar según la región.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-green-800 rounded-2xl p-6 text-white">
              <BarChart3 className="w-10 h-10 text-green-300 mb-4" />
              <h3 className="text-lg font-bold mb-2">Mercado Agrícola Estable</h3>
              <p className="text-sm text-green-200 mb-4">
                Los precios de los productos agrícolas se mantienen estables,
                favoreciendo tanto a productores como a consumidores.
              </p>
              <button
                onClick={() => navigate('/productos')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-green-700 px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Ver productos <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
              <Bell className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-2">Recibe Alertas de Precios</h4>
              <p className="text-xs text-slate-500 mb-4">
                Suscríbete para recibir actualizaciones de precios directamente.
              </p>
              <button
                onClick={() => navigate('/contacto')}
                className="inline-flex items-center gap-2 px-4 py-2 border border-green-700 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-700 hover:text-white transition-colors"
              >
                Suscribirme <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
