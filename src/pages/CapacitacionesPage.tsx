import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowLeft, GraduationCap, MapPin, Clock, Calendar, Users, CheckCircle, Send, X, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { getTrainings, submitTrainingApplication } from '../lib/public';
import type { PublicTraining } from '../lib/public';
import pageBg from '../assets/images/backgrounds/hero-bg.webp';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const MODALITY_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  virtual: 'Virtual',
  hibrida: 'Híbrida',
};

const MODALITY_COLORS: Record<string, string> = {
  presencial: 'bg-blue-100 text-blue-700',
  virtual: 'bg-purple-100 text-purple-700',
  hibrida: 'bg-amber-100 text-amber-700',
};

function TrainingSkeleton() {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-3xl blur opacity-30" />
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl border border-green-200/50 animate-pulse">
        <div className="h-48 bg-gray-200" />
        <div className="p-6">
          <div className="h-5 bg-gray-200 rounded w-24 mb-3" />
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4" />
          <div className="flex items-center gap-3 mb-4">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="space-y-2 mb-6">
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="h-10 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function formatPrice(price: number | null): string {
  if (price === null || price === 0) return 'Gratis';
  return `$${price.toLocaleString('es-CO')}`;
}

export default function CapacitacionesPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [trainings, setTrainings] = useState<PublicTraining[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<PublicTraining | null>(null);
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '', mensaje: '' });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getTrainings().then((data) => {
      if (!mounted) return;
      setTrainings(data);
      setLoading(false);
    }).catch(() => {
      if (!mounted) return;
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const openForm = (training: PublicTraining) => {
    setSelectedTraining(training);
    setShowForm(true);
    setSubmitted(false);
    setFormError(null);
    setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTraining) return;

    if (!EMAIL_REGEX.test(formData.email)) {
      setFormError('Ingresa un correo electrónico válido.');
      return;
    }

    const form = e.currentTarget as HTMLFormElement;
    const honeypotValue = (form.elements.namedItem('honeypot') as HTMLInputElement)?.value || '';

    setSending(true);
    setFormError(null);
    const { error } = await submitTrainingApplication({
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      trainingTitle: selectedTraining.title,
      mensaje: formData.mensaje,
      honeypot: honeypotValue,
    });
    setSending(false);
    if (error) {
      setFormError(error.message);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <>
      <SEO
        title="Capacitaciones"
        description="Programas de formación técnica y acompañamiento para el sector agropecuario. Capacitación presencial y virtual en Colombia."
      />
      <div className="min-h-screen bg-slate-50">
      <div className="relative pt-32 pb-16 overflow-hidden bg-gray-900 min-h-[200px] sm:min-h-[280px] md:min-h-[340px] lg:min-h-[400px] xl:min-h-[480px]">
        <img src={pageBg} alt="" className="absolute inset-0 w-full h-full object-cover object-[5%_55%] sm:object-[10%_55%] md:object-[15%_50%] lg:object-[25%_40%] xl:object-[35%_35%]" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)' }}>Capacitaciones</h1>
          <p className="text-lg text-white max-w-2xl" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)' }}>
            Programas de formación técnica y acompañamiento productivo para fortalecer el sector agropecuario.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
        <div ref={ref}>
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TrainingSkeleton />
              <TrainingSkeleton />
              <TrainingSkeleton />
            </div>
          )}

          {!loading && trainings.length === 0 && (
            <div className="text-center py-20">
              <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-700 mb-2">Próximamente</h2>
              <p className="text-slate-500">Estamos preparando nuevos programas de capacitación para ti.</p>
            </div>
          )}

          {!loading && trainings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainings.map((training, index) => (
                <motion.div
                  key={training.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                  <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl border border-green-200/50 group">
                    <div className="relative w-full bg-gray-50 overflow-hidden aspect-[4/3]">
                      <img src={training.image_url} alt={training.title} loading="lazy"
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${MODALITY_COLORS[training.modality] || 'bg-slate-100 text-slate-700'}`}>
                          {MODALITY_LABELS[training.modality] || training.modality}
                        </span>
                        {training.certificate && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            Certificado
                          </span>
                        )}
                        {training.featured && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                            Destacado
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-green-700 transition-colors">{training.title}</h3>
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed line-clamp-2">{training.description}</p>

                      <div className="space-y-2 mb-4 text-sm text-slate-500">
                        {training.instructor && (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-green-600" />
                            <span>{training.instructor}</span>
                          </div>
                        )}
                        {training.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span>{training.duration}</span>
                          </div>
                        )}
                        {training.schedule && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span>{training.schedule}</span>
                          </div>
                        )}
                        {training.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span>{training.location}</span>
                          </div>
                        )}
                        {training.max_participants && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-600" />
                            <span>Máx. {training.max_participants} participantes</span>
                          </div>
                        )}
                      </div>

                      {training.requirements && training.requirements.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Requisitos</p>
                          <ul className="space-y-1">
                            {training.requirements.map((req) => (
                              <li key={req} className="flex items-start gap-1.5 text-xs text-slate-600">
                                <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 shrink-0" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-lg font-bold text-green-700">{formatPrice(training.price)}</span>
                        <button
                          onClick={() => openForm(training)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition-colors shadow"
                        >
                          <Send className="w-4 h-4" />
                          Inscribirme
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && selectedTraining && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onKeyDown={(e) => { if (e.key === 'Escape') setShowForm(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="Formulario de inscripción"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Inscripción</h3>
              <button onClick={() => setShowForm(false)} aria-label="Cerrar inscripción" className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" aria-hidden="true" />
              </button>
            </div>

            {submitted ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-700" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Inscripción enviada</h4>
                <p className="text-slate-600 mb-6">Te contactaremos pronto con más información sobre <strong>{selectedTraining.title}</strong>.</p>
                <button onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors"
                >Cerrar</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div aria-hidden="true" className="opacity-0 pointer-events-none h-0 overflow-hidden" tabIndex={-1}>
                  <input type="text" name="honeypot" defaultValue="" />
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-green-700 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{selectedTraining.title}</p>
                      <p className="text-xs text-slate-500">{MODALITY_LABELS[selectedTraining.modality]} · {formatPrice(selectedTraining.price)}</p>
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{formError}</div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
                  <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="tu@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input type="tel" name="telefono" required value={formData.telefono} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="300 000 0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje (opcional)</label>
                  <textarea name="mensaje" rows={3} value={formData.mensaje} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none"
                    placeholder="Cuéntanos por qué te interesa esta capacitación..." />
                </div>
                <button type="submit" disabled={sending}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className={`w-4 h-4 ${sending ? 'animate-spin' : ''}`} />
                  {sending ? 'Enviando...' : 'Enviar inscripción'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
    </>
  );
}