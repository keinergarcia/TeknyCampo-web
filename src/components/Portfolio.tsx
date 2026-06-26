import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function Portfolio() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-100">
              <img
                src="https://www.laopinion.co/sites/default/files/styles/portada_principal_747x420/public/2024-02/cebolleros-oca%C3%B1a-contrabando.jpg?itok=-FnnRD6Q"
                alt="Productos agrícolas COOPROMU"
                className="w-full h-72 sm:h-96 object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-green-800 rounded-2xl p-8 sm:p-10 text-white"
          >
            <span className="inline-block px-3 py-1 bg-green-700 text-green-200 text-xs font-medium rounded-full mb-4">
              Portafolio
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Portafolio de Productos
            </h2>
            <p className="text-green-200 mb-6 leading-relaxed">
              En COOPROMU nos dedicamos a la producción avícola y agrícola con un enfoque sostenible.
              Ofrecemos huevos frescos de granjas artesanales y productos como cebolla, frijol,
              habichuela y pimentón, cultivados con métodos que combinan la tradición con la innovación.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Producción artesanal y sostenible',
                'Compromiso con el bienestar animal',
                'Precios justos para asociados y compradores',
                'Enfoque sostenible con el medio ambiente',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-300 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/productos')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-800 font-semibold rounded-xl hover:bg-green-50 transition-colors shadow-lg"
            >
              Conocer más
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
