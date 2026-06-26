import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowLeft, Clock, UserPlus, Upload, CheckCircle, Mail, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import pageBg from '../assets/images/backgrounds/hero-bg.webp';

const requiredDocs = [
  'Cédula de ciudadanía (ambos lados)',
  'Registro Único Tributario (RUT)',
  'Certificado de tradición y libertad del predio (si aplica)',
  'Carta de solicitud de afiliación firmada',
  'Certificaciones de producción o actividad agrícola',
];

export default function TrabajaConNosotrosPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<(File | null)[]>(Array(5).fill(null));

  const handleFileChange = (index: number, file: File | null) => {
    const newFiles = [...files];
    newFiles[index] = file;
    setFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const { submitAffiliationForm } = await import('../services/formService');
      await submitAffiliationForm({
        nombre,
        email,
        telefono,
        documentos: requiredDocs.map((doc, i) => ({ nombre: doc, archivo: files[i] })),
      });
      setSubmitted(true);
    } catch {
      setError('Error al enviar la solicitud. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSubmitted(false);
    setSending(false);
    setError(null);
    setFiles(Array(5).fill(null));
    setNombre('');
    setEmail('');
    setTelefono('');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative pt-32 pb-20 overflow-hidden">
        <img src={pageBg} alt="" role="presentation" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            Trabaja con Nosotros <span className="text-green-300 text-3xl sm:text-4xl">o</span> Asóciate
          </h1>
          <p className="text-lg text-white max-w-2xl drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
            Sé parte de nuestra cooperativa como colaborador o asociado y contribuye al desarrollo del campo colombiano.
          </p>
        </div>
      </div>

      <div ref={ref} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        {!showForm ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center bg-slate-50 rounded-2xl p-10 border border-slate-100"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Convocatorias cerradas</h2>
              <p className="text-lg text-slate-600 max-w-xl mx-auto">
                En este momento no tenemos procesos de selección abiertos.
                Cuando haya nuevas vacantes las publicaremos aquí.
              </p>
              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-slate-500 text-sm mb-3">¿Quieres enviar tu hoja de vida?</p>
                <a
                  href="mailto:COOPROMU2022@gmail.com"
                  className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium"
                >
                  <Mail className="w-4 h-4" />
                  COOPROMU2022@gmail.com
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserPlus className="w-10 h-10 text-green-700" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">¿Quieres asociarte?</h2>
              <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
                Conviértete en asociado de COOPROMU y accede a beneficios exclusivos para productores agrícolas.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors shadow-lg text-lg"
              >
                <UserPlus className="w-5 h-5" />
                Quiero asociarme
              </button>
            </motion.div>
          </>
        ) : submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-700" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Solicitud enviada</h2>
            <p className="text-lg text-slate-600 max-w-lg mx-auto">
              Gracias por tu interés en asociarte a COOPROMU. Revisaremos tus documentos y te contactaremos pronto.
            </p>
            <button onClick={resetForm}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors"
            >
              Volver
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={() => setShowForm(false)}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Documentos requeridos para asociarse</h2>
              <p className="text-slate-600 mb-6">
                Para completar tu afiliación a COOPROMU debes adjuntar los siguientes documentos en formato PDF:
              </p>
              <ul className="space-y-2 mb-6">
                {requiredDocs.map((doc, i) => (
                  <li key={doc} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-700">{i + 1}</span>
                    </div>
                    <span className="text-slate-700">{doc}</span>
                  </li>
                ))}
              </ul>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo</label>
                    <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
                      placeholder="Tu nombre" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
                      placeholder="tu@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
                    <input type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
                      placeholder="300 000 0000" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Sube tus documentos (PDF)</label>
                  {requiredDocs.map((doc, i) => (
                    <label key={doc}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                        files[i] ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-green-300 bg-white'
                      }`}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange(i, e.target.files?.[0] || null)}
                      />
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${files[i] ? 'bg-green-100' : 'bg-slate-100'}`}>
                        {files[i] ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Upload className="w-5 h-5 text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700">{doc}</p>
                        <p className="text-xs text-slate-400 truncate">{files[i]?.name || 'Seleccionar PDF'}</p>
                      </div>
                      {files[i] && (
                        <button type="button" onClick={() => handleFileChange(i, null)} className="p-1 hover:bg-slate-200 rounded shrink-0">
                          <X className="w-4 h-4 text-slate-400" />
                        </button>
                      )}
                    </label>
                  ))}
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button type="submit" disabled={sending}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg text-lg"
                >
                  {sending ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  {sending ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
