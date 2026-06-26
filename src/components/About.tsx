import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Target, Eye, Flag, Heart, Clock, Users, Award, TrendingUp } from 'lucide-react';

function SectionCard({ id, icon: Icon, title, children, delay = 0 }: {
  id: string; icon: React.ElementType; title: string; children: React.ReactNode; delay?: number;
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
      className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow"
    >
      <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-green-700" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
      <div className="text-slate-600 leading-relaxed">{children}</div>
    </motion.div>
  );
}

export default function About() {
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
            Quiénes Somos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            COOPROMU - Cooperativa de Productores Municipales
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Somos una cooperativa sin ánimo de lucro, compuesta por personas unidas por la solidaridad
            y el compromiso con el desarrollo económico y social de nuestra comunidad.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <SectionCard id="historia" icon={Clock} title="Historia" delay={0}>
            <p>
              COOPROMU nació hace 3 años gracias al sueño de un grupo de agricultores comprometidos
              con mejorar las condiciones de vida del campo colombiano.
            </p>
            <p className="mt-3">
              Impulsados por los principios de cooperación, solidaridad y trabajo en equipo,
              estos agricultores decidieron unir esfuerzos para crear una organización que promoviera
              el desarrollo rural y fortaleciera la economía de la región.
            </p>
            <p className="mt-3">
              Hoy, COOPROMU beneficia a numerosas familias campesinas de la provincia de Ocaña,
              brindando apoyo en la producción, comercialización y fortalecimiento del sector agrícola.
            </p>
          </SectionCard>

          <SectionCard id="mision" icon={Target} title="Misión" delay={0.1}>
            <p>
              Fomentar el desarrollo integral de los productores municipales a través de la planificación
              estratégica, la educación continua y el fortalecimiento de la cultura cooperativa.
            </p>
            <p className="mt-3">
              Promovemos la comercialización y el mercadeo de productos locales con un enfoque sostenible,
              facilitando el consumo responsable y ofreciendo servicios especiales que mejoren la calidad
              de vida de nuestros miembros.
            </p>
          </SectionCard>

          <SectionCard id="vision" icon={Eye} title="Visión" delay={0.2}>
            <p>
              Ser una cooperativa líder en el fortalecimiento de la economía local, destacada por su
              capacidad de planificación, innovación y producción agropecuaria sostenible y sustentable.
            </p>
            <p className="mt-3">
              Nos proyectamos como un modelo de cooperación eficiente en la comercialización,
              mercadeo y consumo responsable de productos locales.
            </p>
          </SectionCard>

          <SectionCard id="objetivos" icon={Flag} title="Objetivo General" delay={0.1}>
            <p>
              Fortalecer la producción agropecuaria local mediante asistencia técnica, capacitación
              y comercialización justa, promoviendo prácticas sostenibles y la educación continua
              de nuestros miembros.
            </p>
          </SectionCard>

          <SectionCard id="valores" icon={Heart} title="Valores Corporativos" delay={0.2}>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <span><strong>Solidaridad:</strong> Trabajo conjunto para el beneficio colectivo.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <span><strong>Compromiso:</strong> Con el desarrollo económico y social.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <span><strong>Cooperación:</strong> Colaboración activa con el sector solidario.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <span><strong>Educación:</strong> Capacitación continua de nuestros miembros.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <span><strong>Sostenibilidad:</strong> Prácticas responsables con el ambiente.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <span><strong>Amor por el campo:</strong> Pasión por el desarrollo rural.</span>
              </li>
            </ul>
          </SectionCard>

          <div className="bg-green-800 rounded-2xl p-8 text-white flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-4">¿Por qué elegirnos?</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Cooperativa sin Ánimo de Lucro</div>
                  <div className="text-sm text-green-200">Compromiso social real</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Gestión Democrática</div>
                  <div className="text-sm text-green-200">Todos los asociados participan</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Comercialización Justa</div>
                  <div className="text-sm text-green-200">Precios justos para productores</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Compromiso Rural</div>
                  <div className="text-sm text-green-200">Pasión por el campo colombiano</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
