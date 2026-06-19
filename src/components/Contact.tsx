import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Send, CheckCircle, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useContactForm } from '../hooks/useContactForm';
import { contactInfo, contactSubjects } from '../data/contact';

function SocialLinks() {
  return (
    <div className="bg-green-800 rounded-2xl p-8 text-white">
      <h3 className="text-xl font-bold mb-4">Síguenos en redes sociales</h3>
      <p className="text-green-200 mb-6 text-sm">
        Mantente conectado con nosotros y entérate de las últimas novedades y tips agrícolas.
      </p>
      <div className="flex items-center gap-3">
        <a href="#" className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors" aria-label="Facebook" title="Facebook">
          <Facebook className="w-5 h-5" />
        </a>
        <a href="#" className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors" aria-label="Instagram" title="Instagram">
          <Instagram className="w-5 h-5" />
        </a>
        <a href="#" className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors" aria-label="LinkedIn" title="LinkedIn">
          <Linkedin className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}

function ContactForm() {
  const { formData, submitted, sending, error, handleChange, handleSubmit } = useContactForm();

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 bg-slate-50 rounded-2xl p-8 border border-slate-100"
      >
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
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo</label>
          <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
            placeholder="Tu nombre" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
          <input type="email" name="email" required value={formData.email} onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
            placeholder="tu@email.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Asunto</label>
          <select name="asunto" required value={formData.asunto} onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
          >
            <option value="">Selecciona un asunto</option>
            {contactSubjects.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Mensaje</label>
          <textarea name="mensaje" rows={4} required value={formData.mensaje} onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white resize-none"
            placeholder="Escribe tu mensaje aquí..." />
        </div>
        <button type="submit" disabled={sending}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className={`w-4 h-4 ${sending ? 'animate-spin' : ''}`} />
          {sending ? 'Enviando...' : 'Enviar mensaje'}
        </button>
      </form>
    </div>
  );
}

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4">
            Contacto
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Estamos aquí para ayudarte
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Ponte en contacto con nosotros. Nuestro equipo de expertos está listo para atender tus consultas y brindarte la mejor solución.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {contactInfo.map((info) => (
                <div key={info.title} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <info.icon className="w-5 h-5 text-green-700" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">{info.title}</h4>
                  <p className="text-slate-900 font-medium">{info.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{info.detail}</p>
                </div>
              ))}
            </div>

            <SocialLinks />

            <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 h-48 sm:h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!4v1781798615303!6m8!1m7!1sz0lmAjVpReBkoHi6pfijrQ!2m2!1d8.237213289825238!2d-73.3563884894518!3f173.50814703499464!4f-3.817710191445599!5f0.7820865974627469"
                width="100%"
                height="100%"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Fachada de Teknycampo en Ocaña, Norte de Santander"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
