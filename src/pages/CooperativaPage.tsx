import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Clock, Target, Eye, Heart, Flag, Users, Shield, BookOpen, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { getCompanyValues } from '../services/api';
import { useScrollToState } from '../hooks/useScrollToHash';
import imgHistoria from '../assets/images/news/desarrollo-rural.svg';
import imgMision from '../assets/images/news/alianzas-estrategicas.svg';
import imgVision from '../assets/images/news/riegos-eficientes.svg';
import imgObjetivos from '../assets/images/news/capacitacion-tecnica.svg';
import imgCompromiso from '../assets/images/news/proyectos-catatumbo.svg';

function SectionCard({ id, icon: Icon, title, children, imgSrc, reverse = false, delay = 0 }: {
  id: string; icon: React.ElementType; title: string; children: React.ReactNode;
  imgSrc: string; reverse?: boolean; delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl transition-shadow"
    >
      <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
        <div className="md:w-1/2 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-green-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          </div>
          <div className="text-slate-600 leading-relaxed">{children}</div>
        </div>
        <div className="md:w-1/2 min-h-48 overflow-hidden flex items-center justify-center bg-green-50">
          <img src={imgSrc} alt={title} className="w-full h-full object-cover p-4" />
        </div>
      </div>
    </motion.div>
  );
}

function PageHeaderSection() {
  return (
    <PageHeader
      title="Nuestra Cooperativa"
      subtitle="Conoce nuestra historia, misión, visión y compromiso con el desarrollo de nuestra comunidad."
    />
  );
}

export default function CooperativaPage() {
  const location = useLocation();
  const values = getCompanyValues();
  const scrollTo = location.state && typeof location.state === 'object' && 'scrollTo' in location.state
    ? (location.state as { scrollTo: string }).scrollTo
    : undefined;
  useScrollToState(scrollTo);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeaderSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <SectionCard id="historia" icon={Clock} title="Historia" imgSrc={imgHistoria} delay={0}>
          <p>
            COOPROMU nació hace 3 años gracias al sueño y la visión de un grupo de agricultores
            comprometidos con mejorar las condiciones de vida del campo colombiano.
          </p>
          <p className="mt-3">
            Impulsados por los principios de la cooperación, la solidaridad y el trabajo en equipo,
            estos agricultores decidieron unir esfuerzos para crear una organización que promoviera
            el desarrollo rural y fortaleciera la economía de la región.
          </p>
          <p className="mt-3">
            Hoy, COOPROMU beneficia a numerosas familias campesinas de la provincia de Ocaña,
            brindando apoyo en la producción, comercialización y fortalecimiento del sector agrícola.
          </p>
        </SectionCard>

        <SectionCard id="mision" icon={Target} title="Misión" imgSrc={imgMision} reverse delay={0.1}>
          <p>
            Fomentar el desarrollo integral de los productores municipales a través de la
            planificación estratégica, la educación continua y el fortalecimiento de la
            cultura cooperativa.
          </p>
          <p className="mt-3">
            Promovemos la comercialización y el mercadeo de productos locales con un enfoque
            sostenible, facilitando el consumo responsable y ofreciendo servicios especiales
            que mejoren la calidad de vida de nuestros miembros.
          </p>
        </SectionCard>

        <SectionCard id="vision" icon={Eye} title="Visión" imgSrc={imgVision} delay={0.2}>
          <p>
            Ser una cooperativa líder en el fortalecimiento de la economía local, destacada
            por su capacidad de planificación, innovación y producción agropecuaria
            sostenible y sustentable.
          </p>
          <p className="mt-3">
            Nos proyectamos como un modelo de cooperación eficiente en la comercialización,
            mercadeo y consumo responsable de productos locales, promoviendo el desarrollo
            integral de los productores municipales.
          </p>
        </SectionCard>

        <div id="valores" className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-100">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4">
              Valores
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Nuestros Valores</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100"
              >
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <value.icon className="w-6 h-6 text-green-700" />
                </div>
                <h4 className="font-bold text-slate-900">{value.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <SectionCard id="objetivos" icon={Flag} title="Objetivos Estratégicos" imgSrc={imgObjetivos} reverse delay={0.3}>
          <ul className="space-y-3">
            {[
              'Fortalecer la producción agropecuaria local mediante asistencia técnica y capacitación.',
              'Mejorar las condiciones económicas de los asociados a través de la comercialización justa.',
              'Promover prácticas sostenibles que protejan el medio ambiente y fomenten el consumo responsable.',
              'Fortalecer la educación continua y la cultura cooperativa entre nuestros miembros.',
              'Expandir la comercialización de productos locales en mercados regionales.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-slate-600">{item}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div id="estructura" className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-100">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4">
              Organización
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Estructura Organizacional</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Users, title: 'Asamblea General', desc: 'Máxima autoridad de la cooperativa.' },
              { icon: Shield, title: 'Consejo de Administración', desc: 'Órgano directivo y representación legal.' },
              { icon: BookOpen, title: 'Comité de Control Social', desc: 'Vigila la gestión y el cumplimiento.' },
              { icon: Target, title: 'Comité de Educación', desc: 'Promueve la formación continua.' },
              { icon: Eye, title: 'Revisoría Fiscal', desc: 'Garantiza la transparencia financiera.' },
            ].map((item) => (
              <div key={item.title} className="bg-slate-50 rounded-xl p-5 text-center border border-slate-100">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-green-700" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <SectionCard id="compromiso" icon={Heart} title="Compromiso Social" imgSrc={imgCompromiso} delay={0.4}>
          <p>
            Nuestro compromiso va más allá de lo comercial: trabajamos por el bienestar de la comunidad
            a través de programas de educación rural, seguridad alimentaria y apoyo al asociado.
            Creemos en una agricultura que protege la naturaleza y desarrolla comunidades.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
