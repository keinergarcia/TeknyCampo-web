import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { getStatistics } from '../services/api';
import statsBg from '../assets/images/backgrounds/hero-bg.webp';

export default function Statistics() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const stats = getStatistics();

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0">
        <img src={statsBg} alt="" role="presentation" loading="lazy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl sm:text-5xl font-bold text-green-300 mb-2">{stat.value}</div>
              <div className="text-sm text-white/70 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
