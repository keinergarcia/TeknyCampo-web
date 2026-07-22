import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getServices } from '../lib/public';
import type { PublicService } from '../lib/public';

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 p-6 sm:p-8 animate-pulse">
      <div className="w-14 h-14 rounded-xl bg-gray-200 mb-5" />
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-6" />
      <div className="space-y-2 mb-6">
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-28" />
    </div>
  );
}

export default function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getServices().then((data) => {
      if (!mounted) return;
      setServices(data);
      setLoading(false);
    }).catch((e) => {
      if (!mounted) return;
      setError(e.message);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4">
            Nuestros Servicios
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Soluciones integrales para tu producción
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Desde insumos de calidad hasta acompañamiento técnico, cubrimos todas las necesidades de tu negocio agropecuario.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No pudimos cargar los servicios en este momento.</p>
            <p className="text-slate-400 text-sm mt-2">Por favor intenta de nuevo más tarde.</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">Próximamente</p>
            <p className="text-slate-400 text-sm mt-2">Estamos preparando nuevos servicios para ti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`group rounded-2xl border p-6 sm:p-8 hover:shadow-xl transition-all duration-300 ${service.color}`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${service.iconBg}`}>
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/servicios"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
                >
                  Conocer más
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
