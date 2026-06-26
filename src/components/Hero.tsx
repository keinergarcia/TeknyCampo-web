import { motion } from 'framer-motion';
import { ChevronDown, Sprout, Shield, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroBg from '../assets/images/backgrounds/hero-bg.webp';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" role="presentation" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-8">
            <Sprout className="w-4 h-4" />
            COOPROMU - Cooperativa de Productores Municipales
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-3xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight mb-6"
        >
          Creciendo con las alas
          <br />
          <span className="text-green-300">del campo</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg sm:text-xl text-white max-w-3xl mx-auto mb-10 drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]"
        >
          Cooperativa sin ánimo de lucro comprometida con el desarrollo sostenible,
          la comercialización local y el bienestar de nuestra comunidad en La Playa de Belén, Norte de Santander.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={() => navigate('/cooperativa')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-800 font-semibold rounded-xl hover:bg-green-50 transition-colors shadow-lg"
          >
            <Sprout className="w-5 h-5" />
            Conoce más
          </button>
          <button
            onClick={() => navigate('/contacto')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-700/80 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-green-700 transition-colors border border-green-600"
          >
            <Shield className="w-5 h-5" />
            Contáctanos
          </button>
          <button
            onClick={() => navigate('/trabaja-con-nosotros')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600/80 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-green-600 transition-colors border border-green-500"
          >
            <UserPlus className="w-5 h-5" />
            Asociarse
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          {[
            { value: '3+', label: 'Años de experiencia' },
            { value: '500+', label: 'Asociados activos' },
            { value: '8', label: 'Municipios impactados' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-green-300">{stat.value}</div>
              <div className="text-sm text-white/70 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className="w-8 h-8 text-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
