import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowLeft, Send, Briefcase, CheckCircle, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { useJobForm } from '../hooks/useJobForm';
import { getJobs, getBenefits } from '../lib/public';
import type { PublicJob, PublicBenefit } from '../lib/public';
import pageBg from '../assets/images/backgrounds/hero-bg.webp';

function BenefitsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="relative group animate-pulse">
          <div className="relative bg-white/95 rounded-2xl p-6 border border-slate-200/50 shadow-xl">
            <div className="w-12 h-12 bg-slate-200 rounded-xl mb-4" />
            <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function JobsSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="flex items-center gap-3">
                <div className="h-3 bg-slate-200 rounded w-20" />
                <div className="h-3 bg-slate-200 rounded w-24" />
              </div>
              <div className="h-3 bg-slate-200 rounded w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WorkWithUsPage() {
  const { formData, file, submitted, sending, error, jobOptions, handleChange, handleFileChange, handleSubmit } = useJobForm();
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [benefits, setBenefits] = useState<PublicBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  useEffect(() => {
    let mounted = true;
    Promise.all([getJobs(), getBenefits()])
      .then(([j, b]) => {
        if (!mounted) return;
        setJobs(j);
        setBenefits(b);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <SEO
        title="Trabaja con Nosotros"
        description="Únete al equipo de Tekny Campo. Envía tu hoja de vida y forma parte de una empresa comprometida con el desarrollo del sector agropecuario colombiano."
      />
      <div className="min-h-screen bg-white">
      <div className="relative pt-32 pb-20 overflow-hidden bg-gray-900 min-h-[200px] sm:min-h-[280px] md:min-h-[340px] lg:min-h-[400px] xl:min-h-[480px]">
        <img src={pageBg} alt="" className="absolute inset-0 w-full h-full object-cover object-[5%_55%] sm:object-[10%_55%] md:object-[15%_50%] lg:object-[25%_40%] xl:object-[35%_35%]" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)' }}>Trabaja con Nosotros</h1>
          <p className="text-lg text-white max-w-2xl" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)' }}>
            Únete a un equipo apasionado por transformar el sector agropecuario. Buscamos talentos comprometidos con la innovación y el desarrollo sostenible.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20 overflow-x-clip">
        <div ref={sectionRef}>
          {loading && <BenefitsSkeleton />}

          {!loading && benefits.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
                  <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50 shadow-xl hover:shadow-green-500/10 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">{benefit.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Vacantes disponibles</h2>

            {loading && <JobsSkeleton />}

            {!loading && jobs.length > 0 && (
              <div className="space-y-4">
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-green-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{job.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                          <span>{job.type}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span>{job.location}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{job.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Envía tu postulación</h2>

              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-700" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Postulación enviada</h4>
                  <p className="text-slate-600">Gracias por tu interés. Revisaremos tu perfil y nos contactaremos contigo pronto.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo</label>
                    <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange}
                      className="w-full px-4 py-3.5 sm:py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
                      placeholder="Tu nombre completo" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange}
                        className="w-full px-4 py-3.5 sm:py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
                        placeholder="tu@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
                      <input type="tel" name="telefono" required value={formData.telefono} onChange={handleChange}
                        className="w-full px-4 py-3.5 sm:py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
                        placeholder="300 000 0000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Cédula</label>
                      <input type="text" name="cedula" value={formData.cedula} onChange={handleChange}
                        className="w-full px-4 py-3.5 sm:py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
                        placeholder="Número de cédula" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Cargo de interés</label>
                    <select name="cargo" required value={formData.cargo} onChange={handleChange}
                      className="w-full px-4 py-3.5 sm:py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
                    >
                      <option value="">Selecciona un cargo</option>
                      {jobOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Mensaje / Hoja de vida</label>
                    <textarea name="mensaje" rows={4} value={formData.mensaje} onChange={handleChange}
                      className="w-full px-4 py-3.5 sm:py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white resize-none"
                      placeholder="Cuéntanos sobre ti y tu experiencia..." />
                  </div>
                  <label className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-green-300 transition-colors cursor-pointer block">
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">{file ? file.name : 'Adjunta tu hoja de vida (PDF)'}</p>
                  </label>
                  <button type="submit" disabled={sending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className={`w-4 h-4 ${sending ? 'animate-spin' : ''}`} />
                    {sending ? 'Enviando...' : 'Enviar postulación'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    </>
  );
}
