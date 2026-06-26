import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { CONTACT } from '../constants/contact';
import SocialIcon from '../components/SocialIcon';
import PageHeader from '../components/PageHeader';
import ContactForm from '../components/ContactForm';

const contactInfo = [
  { icon: MapPin, title: 'Dirección', value: `${CONTACT.address}, ${CONTACT.department}`, detail: 'Colombia' },
  { icon: Phone, title: 'Teléfono', value: CONTACT.phone, detail: `WhatsApp: ${CONTACT.whatsapp}` },
  { icon: Mail, title: 'Correo Electrónico', value: CONTACT.email, detail: `NIT: ${CONTACT.nit}` },
  { icon: Clock, title: 'Horario', value: CONTACT.schedule, detail: CONTACT.scheduleSaturday },
];

export default function ContactoPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Contáctenos"
        subtitle="Estamos aquí para atenderte. Comunícate con nosotros y te responderemos a la mayor brevedad posible."
      />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {contactInfo.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50 shadow-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-1">{card.title}</h4>
                <p className="text-lg font-bold text-slate-900 mb-1">{card.value}</p>
                <p className="text-sm text-slate-500">{card.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-green-800 rounded-2xl p-8 text-white mb-6">
              <h3 className="text-xl font-bold mb-4">Síguenos en redes sociales</h3>
              <p className="text-green-200 mb-6 text-sm">
                Mantente conectado con nosotros y entérate de las últimas novedades y tips agrícolas.
              </p>
              <div className="flex items-center gap-3">
                <SocialIcon href={CONTACT.social.facebook} label="Facebook" variant="large">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </SocialIcon>
                <SocialIcon href={CONTACT.social.instagram} label="Instagram" variant="large">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </SocialIcon>
                <SocialIcon href={CONTACT.social.youtube} label="YouTube" variant="large">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </SocialIcon>
                <SocialIcon href={CONTACT.social.linkedin} label="LinkedIn" variant="large">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </SocialIcon>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 h-56 sm:h-72">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15822.785634867542!2d-73.2458!3d8.2183!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e5a0b8b8b8b8b8b%3A0x4d2b1b0f4e6d9e4d!2sLa%20Playa%20de%20Bel%C3%A9n%2C%20Norte%20de%20Santander!5e0!3m2!1sen!2sco!4v1"
                width="100%" height="100%" allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación COOPROMU"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
