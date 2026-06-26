import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowLeft, Send, Briefcase, CheckCircle, Upload, Users, Award, TrendingUp, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJobForm } from '../hooks/useJobForm';
import pageBg from '../assets/images/backgrounds/hero-bg.png';

const jobs = [
  { title: 'Ingeniero Agrónomo', type: 'Tiempo completo', location: 'Ocaña', description: 'Responsable de asesorar técnicamente a productores en la selección de insumos y servicios agropecuarios.' },
  { title: 'Asesor Técnico Comercial', type: 'Tiempo completo', location: 'Norte de Santander', description: 'Brinda asesoría técnica y comercial a clientes del sector agropecuario en la región.' },
  { title: 'Especialista en Nutrición Animal', type: 'Tiempo completo', location: 'Ocaña', description: 'Desarrolla programas de alimentación y suplementación para diferentes especies productivas.' },
  { title: 'Técnico de Campo', type: 'Tiempo completo', location: 'Catatumbo', description: 'Realiza visitas técnicas a fincas para brindar acompañamiento y soporte en campo.' },
  { title: 'Coordinador de Capacitación', type: 'Tiempo completo', location: 'Ocaña', description: 'Diseña y coordina programas de formación técnica para agricultores y ganaderos.' },
  { title: 'Profesional de Proyectos', type: 'Tiempo completo', location: 'Ocaña', description: 'Gestiona proyectos agropecuarios con entidades públicas y privadas.' },
];

const benefits = [
  { icon: Users, title: 'Ambiente colaborativo', description: 'Trabaja en un equipo multidisciplinario apasionado por el agro.' },
  { icon: Award, title: 'Desarrollo profesional', description: 'Acceso a capacitaciones y certificaciones especializadas.' },
  { icon: TrendingUp, title: 'Crecimiento', description: 'Oportunidades de crecimiento interno basadas en méritos.' },
  { icon: Heart, title: 'Bienestar', description: 'Programas de bienestar integral y balance vida-trabajo.' },
];

export default function WorkWithUsPage() {
  const { formData, file, submitted, sending, error, jobOptions, handleChange, handleFileChange, handleSubmit } = useJobForm();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <div className="min-h-screen bg-white">
      <div className="relative pt-32 pb-20 overflow-hidden">
        <img src={pageBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20">
        <div ref={sectionRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
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
                <h4 className="text-base font-bold text-slate-900 mb-1">{benefit.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Vacantes disponibles</h2>
            <div className="space-y-4">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.title}
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
                      <h4 className="font-semibold text-slate-900">{job.title}</h4>
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
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
                      placeholder="Tu nombre completo" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
                        placeholder="tu@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
                      <input type="tel" name="telefono" required value={formData.telefono} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
                        placeholder="300 000 0000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Cargo de interés</label>
                    <select name="cargo" required value={formData.cargo} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
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
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white resize-none"
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
  );
}
