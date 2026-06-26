import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';

interface ContactFormData {
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    nombre: '', email: '', telefono: '', asunto: '', mensaje: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const { submitContactForm } = await import('../services/formService');
      await submitContactForm(formData);
      setSubmitted(true);
    } catch {
      setError('Error al enviar el mensaje. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 bg-slate-50 rounded-2xl p-8 border border-slate-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-700" />
        </div>
        <h4 className="text-xl font-bold text-slate-900 mb-2">Mensaje enviado</h4>
        <p className="text-slate-600">Gracias por contactarnos. Te responderemos lo antes posible.</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
      <h3 className="text-xl font-bold text-slate-900 mb-6">Envíanos un mensaje</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo</label>
          <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
            placeholder="Tu nombre" />
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
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
              placeholder="300 000 0000" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Asunto</label>
          <select name="asunto" required value={formData.asunto} onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
          >
            <option value="">Selecciona un asunto</option>
            <option value="productos">Información de productos</option>
            <option value="asociarse">Quiero asociarme</option>
            <option value="servicios">Solicitar servicios</option>
            <option value="pqrs">PQRS</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Mensaje</label>
          <textarea name="mensaje" rows={4} required value={formData.mensaje} onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white resize-none"
            placeholder="Escribe tu mensaje aquí..." />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={sending}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {sending ? 'Enviando...' : 'Enviar mensaje'}
        </button>
      </form>
    </div>
  );
}