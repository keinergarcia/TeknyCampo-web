import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { getServices } from '../lib/public';
import type { PublicService } from '../lib/public';
import pageBg from '../assets/images/backgrounds/hero-bg.webp';

function StoreButton({ url }: { url: string }) {
  const isExternal = /^https?:\/\//.test(url);
  if (isExternal) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors shadow text-sm"
      >
        <ShoppingCart className="w-4 h-4" />
        Ir a la tienda
      </a>
    );
  }
  return (
    <Link
      to={url}
      className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors shadow text-sm"
    >
      <ShoppingCart className="w-4 h-4" />
      Ir a la tienda
    </Link>
  );
}

function ServicesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="p-6 lg:p-8 animate-pulse">
          <div className="w-14 h-14 rounded-2xl bg-gray-200 mb-5" />
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
          <div className="space-y-2 mb-6">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="h-3 bg-gray-200 rounded w-2/3" />
            ))}
          </div>
          <div className="h-10 bg-gray-200 rounded-xl w-full" />
        </div>
      ))}
    </div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    let mounted = true;
    getServices().then((data) => {
      if (!mounted) return;
      setServices(data);
      setLoading(false);
    }).catch(() => {
      if (!mounted) return;
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <SEO
        title="Servicios"
        description="Soluciones integrales para tu producción agropecuaria. Insumos, soluciones agrícolas y ganaderas con tecnología e innovación."
      />
      <div className="min-h-screen bg-white">
      <div className="relative pt-32 pb-12 overflow-hidden bg-gray-900 min-h-[200px] sm:min-h-[280px] md:min-h-[340px] lg:min-h-[400px] xl:min-h-[480px]">
        <img src={pageBg} alt="" className="absolute inset-0 w-full h-full object-cover object-[5%_55%] sm:object-[10%_55%] md:object-[15%_50%] lg:object-[25%_40%] xl:object-[35%_35%]" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)' }}>Nuestros Servicios</h1>
          <p className="text-lg text-white max-w-2xl" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)' }}>
            Soluciones integrales diseñadas para potenciar cada aspecto de tu producción agropecuaria.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl border border-green-200/50">
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-green-800 to-green-700 px-8 py-6">
                <h2 className="text-2xl font-bold text-white">Soluciones para tu producción</h2>
                <p className="text-green-200 mt-1">Todo lo que necesitas para potenciar tu negocio agropecuario</p>
              </div>
              {loading ? <ServicesSkeleton /> : (
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-green-100">
                  {services.map((service) => {
                    const Icon = service.icon;
                    return (
                      <div key={service.id} className="p-6 lg:p-8 flex flex-col h-full">
                        <div className={`w-14 h-14 rounded-2xl ${service.iconBg} flex items-center justify-center mb-5`}>
                          <Icon className={`w-7 h-7 ${service.color.split(' ')[1]}`} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">{service.description}</p>
                        <ul className="space-y-2 mb-6 flex-1">
                          {service.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <StoreButton url={service.storeUrl} />
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
