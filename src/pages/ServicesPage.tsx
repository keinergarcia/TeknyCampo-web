import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { services } from '../data/services';

export default function ServicesPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-green-800 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-green-200 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Nuestros Servicios</h1>
          <p className="text-lg text-green-100 max-w-2xl">
            Soluciones integrales diseñadas para potenciar cada aspecto de tu producción agropecuaria.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div ref={ref} className="space-y-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              id={service.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`rounded-2xl border p-8 lg:p-10 ${service.color}`}
            >
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                <div className="shrink-0">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${service.iconBg}`}>
                    <service.icon className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">{service.title}</h2>
                  <p className="text-slate-600 leading-relaxed mb-6 text-lg">{service.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0" />
                        <span className="text-slate-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
