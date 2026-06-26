import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, ShoppingBag, Heart } from 'lucide-react';
import { CONTACT } from '../constants/contact';
import SocialIcon from './SocialIcon';

const communityItems = [
  {
    icon: Users,
    title: 'Productores',
    desc: 'Asocia tu producción con nosotros y accede a mejores mercados, precios justos y apoyo técnico.',
    image: 'https://cloudfront-us-east-1.images.arcpublishing.com/prisaradioco/OUIIJ6MJ3JLFPDXNX2QYBHG3MY.jpg',
  },
  {
    icon: ShoppingBag,
    title: 'Compradores',
    desc: 'Accede a productos agrícolas de alta calidad directamente del productor con precios competitivos.',
    image: 'https://upra.gov.co/sites/default/files/styles/webp/public/2025-04/Agronegocios%20es%20la%20plataforma%20que%20impulsa%20compras%20y%20ventas%20en%20el%20sector%20agropecuario.jpg.webp?itok=PUfMG-I-',
  },
  {
    icon: Heart,
    title: 'Asociados',
    desc: 'Disfruta de beneficios exclusivos: créditos, capacitaciones, subsidios y representación.',
    image: 'https://scontent.feoh2-1.fna.fbcdn.net/v/t39.30808-6/492701905_1258670512927903_4425408557573103190_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x2048&ctp=s2048x2048&_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeFJal_ZZ_cVbMfYO7lPj2SOnTHmNxZI3ZqdMeY3FkjdmsE0C70RTVWwSVeAP7DMgEnx-3p7V5P4lO7ME4yyHUxC&_nc_ohc=mMxI7RCYcesQ7kNvwEJQQGk&_nc_oc=AdrpXcEn9T2gAFR0KtDRfyLvRcz0p8TuAlQKA18eijDzJFowdlBPiQb6QisJbJpbmZg&_nc_zt=23&_nc_ht=scontent.feoh2-1.fna&_nc_gid=u798-Cg1RGSGK3Cej70Z_A&_nc_ss=7b2a8&oh=00_Af9XX8NnCebEZpZv1rzVnuJI32fRjk23G2MKPnwYpbvotQ&oe=6A2FC5E0',
  },
];

export default function Community() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4">
            Comunidad
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Únete a Nuestra Comunidad
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Invitamos a productores, compradores y comunidad en general a ser parte
            de COOPROMU y juntos construir un futuro mejor para nuestra región.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {communityItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-white rounded-2xl p-6 text-center shadow-lg border border-slate-100 hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-2 border-green-200">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-5 h-5 text-green-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-green-800 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-xl font-bold mb-4">Síguenos en Redes Sociales</h3>
          <p className="text-green-200 mb-6 text-sm max-w-xl mx-auto">
            Mantente informado sobre nuestras actividades, precios de productos,
            capacitaciones y eventos especiales.
          </p>
          <div className="flex items-center justify-center gap-4">
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
        </motion.div>
      </div>
    </section>
  );
}
