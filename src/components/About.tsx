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
            Sobre Nosotros
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Tekny Campo Soluciones Agropecuarias
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Trabajamos con compromiso, responsabilidad e innovación para fortalecer el sector rural colombiano,
            brindando soluciones integrales orientadas al desarrollo agrícola y ganadero.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <SectionCard id="historia" icon={Clock} title="Historia" delay={0}>
            <p>
              Tekny Campo Soluciones Agropecuarias nació con el propósito de apoyar el desarrollo del sector agropecuario colombiano mediante soluciones innovadoras y acompañamiento técnico especializado.
            </p>
            <p className="mt-3">
              Desde sus inicios, la empresa ha trabajado junto a productores, asociaciones, entidades públicas y organizaciones rurales, ofreciendo insumos, capacitación y asesoría para mejorar la productividad y sostenibilidad del campo.
            </p>
            <p className="mt-3">
              A lo largo de su trayectoria, Tekny Campo ha participado en proyectos agropecuarios que han contribuido al fortalecimiento de comunidades rurales y al crecimiento del sector agrícola y ganadero en la región.
            </p>
          </SectionCard>

          <SectionCard id="mision" icon={Target} title="Misión" delay={0.1}>
            <p>
              Somos una empresa comprometida con el desarrollo del sector agropecuario, dedicada a brindar soluciones tecnológicas, suministro de insumos, capacitación y acompañamiento técnico, orientados a mejorar la productividad, sostenibilidad y competitividad del campo colombiano, promoviendo el crecimiento integral de productores y comunidades rurales.
            </p>
          </SectionCard>

          <SectionCard id="vision" icon={Eye} title="Visión" delay={0.2}>
            <p>
              Ser una empresa líder y reconocida en el sector agropecuario colombiano por brindar soluciones innovadoras, sostenibles y de alta calidad, contribuyendo al desarrollo productivo del campo, al fortalecimiento de las comunidades rurales y a la transformación tecnológica del sector agropecuario.
            </p>
          </SectionCard>

          <SectionCard id="objetivos" icon={Flag} title="Objetivo General" delay={0.1}>
            <p>
              Impulsar el desarrollo sostenible y productivo del sector agropecuario colombiano mediante soluciones integrales, asistencia técnica, capacitación y suministro de insumos de alta calidad.
            </p>
          </SectionCard>

          <SectionCard id="valores" icon={Heart} title="Valores Corporativos" delay={0.2}>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <span><strong>Compromiso:</strong> Dedicación total con el campo colombiano.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <span><strong>Responsabilidad:</strong> Cumplimiento y seriedad en cada proyecto.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <span><strong>Innovación:</strong> Búsqueda constante de nuevas soluciones.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <span><strong>Calidad:</strong> Excelencia en productos y servicios.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <span><strong>Servicio al cliente:</strong> Atención personalizada y cercana.</span>
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
                  <div className="font-semibold">Experiencia Comprobada</div>
                  <div className="text-sm text-green-200">Proyectos ejecutados con éxito</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Acompañamiento Técnico</div>
                  <div className="text-sm text-green-200">Asesoría especializada permanente</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Soluciones Integrales</div>
                  <div className="text-sm text-green-200">Todo para tu producción</div>
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
