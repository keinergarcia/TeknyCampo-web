import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sprout, Tractor, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getHeroStats } from '../lib/public';
import type { PublicHeroStat } from '../lib/public';
import heroBg from '../assets/images/backgrounds/hero-bg.webp';

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-6 max-w-3xl mx-auto">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center animate-pulse">
          <div className="h-6 sm:h-9 bg-white/10 rounded w-12 sm:w-16 mx-auto" />
          <div className="h-3 sm:h-4 bg-white/10 rounded w-16 sm:w-24 mx-auto mt-1 sm:mt-2" />
        </div>
      ))}
    </div>
  );
}

export default function Hero() {
  const [stats, setStats] = useState<PublicHeroStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getHeroStats().then((data) => {
      if (!mounted) return;
      setStats(data);
      setLoading(false);
    }).catch(() => {
      if (!mounted) return;
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <section className="relative w-full min-h-[500px] sm:min-h-[460px] md:min-h-[460px] lg:min-h-0 lg:aspect-[2/1] lg:max-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-green-950 via-green-900 to-green-950">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover object-[5%_55%] sm:object-[10%_50%] md:object-[15%_50%] lg:object-center opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-6 sm:pt-20 lg:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs sm:text-sm font-medium mb-2 sm:mb-8">
            <Sprout className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="sm:hidden">Tekny Campo</span>
            <span className="hidden sm:inline">Tekny Campo Soluciones Agropecuarias</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-3xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight mb-2 sm:mb-6"
        >
          Tecnología al servicio
          <br />
          <span className="text-green-300">del campo</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xs sm:text-xl text-white/90 max-w-3xl mx-auto mb-4 sm:mb-10 leading-relaxed sm:leading-normal px-2 sm:px-0" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.9)' }}
        >
          Soluciones integrales para el desarrollo agrícola y ganadero en Colombia.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-16"
        >
          <Link
            to="/servicios"
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-8 sm:py-4 bg-white text-green-800 font-semibold text-sm sm:text-base rounded-xl hover:bg-green-50 transition-colors shadow-lg whitespace-nowrap"
          >
            <Tractor className="w-4 h-4 sm:w-5 sm:h-5" />
            Conoce más
          </Link>
          <Link
            to="/contacto"
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-8 sm:py-4 bg-green-700/80 backdrop-blur-sm text-white font-semibold text-sm sm:text-base rounded-xl hover:bg-green-700 transition-colors border border-green-600 whitespace-nowrap"
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            Contáctanos
          </Link>
        </motion.div>

        {loading && <StatsSkeleton />}

        {!loading && stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="grid grid-cols-3 gap-1 sm:gap-6 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-green-300">{stat.value}</div>
                <div className="text-[10px] sm:text-sm text-white/70 mt-0.5 sm:mt-1 leading-tight sm:leading-normal px-1 sm:px-0">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-2 sm:bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5 sm:w-8 sm:h-8 text-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
