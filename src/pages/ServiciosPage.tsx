import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getServices } from '../services/api';
import PageHeader from '../components/PageHeader';

export default function ServiciosPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();
  const services = getServices();

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Nuestros Servicios"
        subtitle="Soluciones integrales para el sector agrícola colombiano: desde la producción hasta la comercialización."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div ref={ref} className="space-y-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-slate-100 p-8 lg:p-10 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                <div className="shrink-0">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                    <service.icon className="w-8 h-8 text-green-700" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">{service.title}</h2>
                  <p className="text-slate-600 leading-relaxed mb-6 text-lg">{service.desc}</p>
                  {service.features && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {service.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2.5">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0" />
                          <span className="text-slate-700 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 bg-green-800 rounded-2xl p-8 sm:p-10 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">¿Necesitas un servicio personalizado?</h3>
          <p className="text-green-200 mb-6 max-w-xl mx-auto">
            Nuestro equipo está listo para diseñar soluciones a medida según tus necesidades.
          </p>
          <button
            onClick={() => navigate('/contacto')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-800 font-semibold rounded-xl hover:bg-green-50 transition-colors shadow-lg"
          >
            Solicitar Información
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
