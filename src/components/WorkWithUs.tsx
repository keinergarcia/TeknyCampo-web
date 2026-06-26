import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Send, Briefcase, CheckCircle, Upload } from 'lucide-react';
import { useJobForm } from '../hooks/useJobForm';

const jobs = [
  { title: 'Ingeniero Agrónomo', type: 'Tiempo completo', location: 'Ocaña' },
  { title: 'Asesor Técnico Comercial', type: 'Tiempo completo', location: 'Norte de Santander' },
  { title: 'Especialista en Nutrición Animal', type: 'Tiempo completo', location: 'Ocaña' },
  { title: 'Técnico de Campo', type: 'Tiempo completo', location: 'Catatumbo' },
];

export default function WorkWithUs() {
  const { formData, file, submitted, sending, error, jobOptions, handleChange, handleFileChange, handleSubmit } = useJobForm();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

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
            Trabaja con Nosotros
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Únete a nuestro equipo
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Buscamos talentos apasionados por el sector agropecuario. Si quieres crecer profesionalmente y contribuir al desarrollo del campo, ésta es tu oportunidad.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6">Vacantes disponibles</h3>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.title} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-green-800 rounded-xl p-6 text-white">
              <h4 className="font-bold text-lg mb-2">Únete a nuestro equipo</h4>
              <p className="text-sm text-green-200 mb-4">
                Si te apasiona el campo colombiano y quieres contribuir al desarrollo del sector agropecuario, envía tu postulación.
              </p>
              <ul className="space-y-2 text-sm text-green-100">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  Experiencia en proyectos agropecuarios
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  Acompañamiento técnico especializado
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  Compromiso con las comunidades rurales
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  Innovación y tecnología aplicada al agro
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Envía tu postulación</h3>

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
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                      placeholder="Tu nombre completo" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                        placeholder="tu@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
                      <input type="tel" name="telefono" required value={formData.telefono} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
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
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none"
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
    </section>
  );
}
