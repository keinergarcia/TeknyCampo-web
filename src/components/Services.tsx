import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getServices } from '../services/api';

export default function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();
  const services = getServices();

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
            Nuestros Servicios
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Soluciones integrales para el sector agrícola
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Ofrecemos soluciones integrales para el sector agrícola colombiano,
            desde la producción hasta la comercialización de productos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group rounded-2xl border border-slate-100 p-6 sm:p-8 hover:shadow-xl transition-all duration-300 bg-white shadow-lg"
            >
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-5">
                <service.icon className="text-2xl text-green-700" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">{service.title}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">{service.desc}</p>
              {service.features && (
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => navigate('/servicios')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
              >
                Conocer más
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
