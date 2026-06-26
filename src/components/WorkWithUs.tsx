import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Handshake, TrendingUp, Shield, CheckCircle } from 'lucide-react';

export default function WorkWithUs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();

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
            Asóciate
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Haz parte de COOPROMU
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Asóciate y disfruta de los beneficios de trabajar juntos por el desarrollo del campo colombiano.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { icon: UserPlus, title: 'Afiliación Simple', desc: 'Proceso rápido y sin costo para asociarte.' },
            { icon: Handshake, title: 'Comercialización Justa', desc: 'Acceso a mercados con precios justos.' },
            { icon: TrendingUp, title: 'Capacitación', desc: 'Formación continua para productores.' },
            { icon: Shield, title: 'Apoyo Solidario', desc: 'Red de apoyo entre todos los asociados.' },
          ].map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-xl p-5 text-center border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <benefit.icon className="w-6 h-6 text-green-700" />
              </div>
              <h4 className="font-semibold text-slate-900 text-sm">{benefit.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-green-800 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-xl font-bold mb-4">¿Quieres asociarte?</h3>
          <p className="text-green-200 mb-6 text-sm max-w-2xl mx-auto">
            Si eres productor agrícola y quieres hacer parte de nuestra cooperativa,
            contáctanos y te daremos toda la información.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/contacto')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-800 font-semibold rounded-xl hover:bg-green-50 transition-colors shadow-lg text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Quiero asociarme
            </button>
            <button
              onClick={() => navigate('/contacto')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-700/80 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-green-700 transition-colors border border-green-600 text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Más información
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
